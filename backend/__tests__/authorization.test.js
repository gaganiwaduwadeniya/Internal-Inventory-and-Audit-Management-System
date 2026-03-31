const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('../src/routes/auth');
const equipmentRoutes = require('../src/routes/equipment');

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);

// Import models
const User = require('../src/models/User');
const Equipment = require('../src/models/Equipment');

// Database setup
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/equipment-management-test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Equipment.deleteMany({});
});

describe('Authorization & Middleware Tests', () => {
  let employeeToken;
  let adminToken;
  let employeeId;
  let adminId;

  beforeEach(async () => {
    // Create employee
    const empRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'employee',
        email: 'employee@example.com',
        password: 'password123',
        role: 'Employee',
      });

    employeeToken = empRes.body.token;
    employeeId = empRes.body.user.id;

    // Create admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'Admin',
      });

    adminToken = adminRes.body.token;
    adminId = adminRes.body.user.id;
  });

  describe('JWT Token Validation', () => {
    test('should reject requests without Authorization header', async () => {
      const res = await request(app)
        .get('/api/equipment');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Not authorized');
    });

    test('should reject requests with invalid Bearer token', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', 'Bearer invalid_token_xyz');

      expect(res.statusCode).toBe(401);
    });

    test('should reject requests with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', 'InvalidBearer token');

      expect(res.statusCode).toBe(401);
    });

    test('JWT token should contain correct user data', () => {
      const decoded = jwt.verify(employeeToken, process.env.JWT_SECRET);
      expect(decoded.id).toBe(employeeId);
      expect(decoded.role).toBe('Employee');
    });

    test('admin JWT token should contain Admin role', () => {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      expect(decoded.role).toBe('Admin');
      expect(decoded.id).toBe(adminId);
    });
  });

  describe('Role-Based Access Control', () => {
    let equipmentId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Test Equipment',
          serialNumber: 'RBAC-TEST-001',
          assignedDate: '2024-03-30',
        });

      equipmentId = createRes.body.data._id;
    });

    test('Employee cannot UPDATE equipment status', async () => {
      const res = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ status: 'Damaged' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Employee');
      expect(res.body.message).toContain('not authorized');
    });

    test('Employee cannot DELETE equipment', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Employee');
      expect(res.body.message).toContain('not authorized');
    });

    test('Admin CAN UPDATE equipment status', async () => {
      const res = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Damaged' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('Damaged');
    });

    test('Admin CAN DELETE equipment', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing required fields in registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'incomplete',
          // email and password missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should handle missing required fields in equipment creation', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Incomplete',
          // serialNumber and assignedDate missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should handle non-existent equipment fetch', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/equipment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should handle invalid MongoDB ObjectId', async () => {
      const res = await request(app)
        .get('/api/equipment/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Data Isolation & Ownership', () => {
    let emp2Token;
    let emp1EquipmentId;

    beforeEach(async () => {
      // Create second employee
      const emp2Res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'employee2',
          email: 'emp2@example.com',
          password: 'password123',
          role: 'Employee',
        });

      emp2Token = emp2Res.body.token;

      // Employee 1 creates equipment
      const createRes = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Employee1 Equipment',
          serialNumber: 'EMP1-001',
          assignedDate: '2024-03-30',
        });

      emp1EquipmentId = createRes.body.data._id;
    });

    test('Employee should not see other employee\'s equipment in list', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${emp2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(0); // Employee 2 sees no equipment
    });

    test('Employee should not access other employee\'s equipment by ID', async () => {
      const res = await request(app)
        .get(`/api/equipment/${emp1EquipmentId}`)
        .set('Authorization', `Bearer ${emp2Token}`);

      expect(res.statusCode).toBe(403);
    });

    test('Admin should see all employees\' equipment', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1); // Admin sees employee's equipment
    });

    test('Admin should access any equipment by ID', async () => {
      const res = await request(app)
        .get(`/api/equipment/${emp1EquipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(emp1EquipmentId);
    });
  });

  describe('Password Security', () => {
    test('password should not be returned in registration response', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'secureuser',
          email: 'secure@example.com',
          password: 'mypassword123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.password).toBeUndefined();
    });

    test('password should not be returned in login response', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employee@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.password).toBeUndefined();
    });

    test('password should not be returned in /me response', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.password).toBeUndefined();
    });

    test('stored password should be hashed', async () => {
      const user = await User.findOne({ email: 'employee@example.com' });
      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash
    });
  });

  describe('Status Enum Validation', () => {
    let equipmentId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Status Test Equipment',
          serialNumber: 'STATUS-001',
          assignedDate: '2024-03-30',
        });

      equipmentId = createRes.body.data._id;
    });

    test('should allow valid status values: Active, Damaged, Retired', async () => {
      const statuses = ['Active', 'Damaged', 'Retired'];

      for (const status of statuses) {
        const res = await request(app)
          .put(`/api/equipment/${equipmentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe(status);
      }
    });

    test('new equipment should default to Active status', async () => {
      // Created in beforeEach already, check equipment
      const res = await request(app)
        .get(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.status).toBe('Active');
    });
  });

  describe('Unique Field Constraints', () => {
    test('should not allow duplicate email during registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user1',
          email: 'unique@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'unique@example.com', // Duplicate email
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
    });

    test('should not allow duplicate serial number', async () => {
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Equipment 1',
          serialNumber: 'UNIQUE-SN',
          assignedDate: '2024-03-30',
        });

      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Equipment 2',
          serialNumber: 'UNIQUE-SN', // Duplicate serial number
          assignedDate: '2024-03-30',
        });

      expect(res.statusCode).toBe(400);
    });
  });
});
