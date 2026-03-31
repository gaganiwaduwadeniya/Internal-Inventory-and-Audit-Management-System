const request = require('supertest');
const mongoose = require('mongoose');
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

describe('Equipment Management Tests', () => {
  let employeeToken;
  let employeeId;
  let adminToken;
  let adminId;

  beforeEach(async () => {
    // Create employee user
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

    // Create admin user
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

  describe('POST /api/equipment - Create Equipment', () => {
    test('employee should create equipment for themselves', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Dell Laptop',
          serialNumber: 'DL-001-2024',
          assignedDate: '2024-03-30',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceName).toBe('Dell Laptop');
      expect(res.body.data.serialNumber).toBe('DL-001-2024');
      expect(res.body.data.assignedTo).toBe(employeeId);
      expect(res.body.data.status).toBe('Active');
    });

    test('should fail creating equipment without token', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .send({
          deviceName: 'Dell Laptop',
          serialNumber: 'DL-001-2024',
          assignedDate: '2024-03-30',
        });

      expect(res.statusCode).toBe(401);
    });

    test('should fail creating equipment without required fields', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Dell Laptop',
          // Missing serialNumber and assignedDate
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('required fields');
    });

    test('should fail creating equipment with duplicate serial number', async () => {
      // Create first equipment
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Dell Laptop',
          serialNumber: 'UNIQUE-SN-001',
          assignedDate: '2024-03-30',
        });

      // Try to create second with same serial number
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'HP Desktop',
          serialNumber: 'UNIQUE-SN-001', // Duplicate
          assignedDate: '2024-03-30',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Serial number already exists');
    });
  });

  describe('GET /api/equipment - View Equipment', () => {
    beforeEach(async () => {
      // Employee creates equipment
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Employee Laptop',
          serialNumber: 'EMP-001',
          assignedDate: '2024-03-30',
        });

      // Admin creates equipment for employee (through separate request simulating another employee)
      const emp2Res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'employee2',
          email: 'emp2@example.com',
          password: 'password123',
          role: 'Employee',
        });

      const emp2Token = emp2Res.body.token;
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${emp2Token}`)
        .send({
          deviceName: 'Employee2 Desktop',
          serialNumber: 'EMP2-001',
          assignedDate: '2024-03-30',
        });
    });

    test('employee should see only their own equipment', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].deviceName).toBe('Employee Laptop');
      expect(res.body.data[0].serialNumber).toBe('EMP-001');
    });

    test('admin should see all equipment from all employees', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2); // Both employee equipment visible
      expect(res.body.data.length).toBe(2);
    });

    test('should fail viewing equipment without token', async () => {
      const res = await request(app)
        .get('/api/equipment');

      expect(res.statusCode).toBe(401);
    });

    test('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/equipment/:id - Update Equipment (Admin Only)', () => {
    let equipmentId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Dell Laptop',
          serialNumber: 'DL-UPDATE-001',
          assignedDate: '2024-03-30',
        });

      equipmentId = createRes.body.data._id;
    });

    test('admin should update equipment status', async () => {
      const res = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Damaged',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Damaged');
    });

    test('admin should change status from Active to Retired', async () => {
      const res = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Retired',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('Retired');
    });

    test('employee should NOT update equipment (403 Forbidden)', async () => {
      const res = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          status: 'Damaged',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not authorized');
    });

    test('should fail updating without token (401)', async () => {
      const res = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .send({
          status: 'Damaged',
        });

      expect(res.statusCode).toBe(401);
    });

    test('should fail updating non-existent equipment (404)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/equipment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Damaged',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/equipment/:id - Delete Equipment (Admin Only)', () => {
    let equipmentId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Dell Laptop',
          serialNumber: 'DL-DELETE-001',
          assignedDate: '2024-03-30',
        });

      equipmentId = createRes.body.data._id;
    });

    test('admin should delete equipment', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      // Verify it's actually deleted
      const getRes = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.body.count).toBe(0);
    });

    test('employee should NOT delete equipment (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not authorized');

      // Verify it's NOT deleted
      const getRes = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(getRes.body.count).toBe(1);
    });

    test('should fail deleting without token (401)', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${equipmentId}`);

      expect(res.statusCode).toBe(401);
    });

    test('should fail deleting non-existent equipment (404)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/equipment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('GET /api/equipment/:id - Get Single Equipment', () => {
    let equipmentId;
    let emp2Token;

    beforeEach(async () => {
      // Employee creates equipment
      const createRes = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          deviceName: 'Dell Laptop',
          serialNumber: 'DL-SINGLE-001',
          assignedDate: '2024-03-30',
        });

      equipmentId = createRes.body.data._id;

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
    });

    test('employee should get their own equipment', async () => {
      const res = await request(app)
        .get(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(equipmentId.toString());
    });

    test('employee should NOT get another employee\'s equipment (403)', async () => {
      const res = await request(app)
        .get(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${emp2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Not authorized');
    });

    test('admin should get any equipment', async () => {
      const res = await request(app)
        .get(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(equipmentId.toString());
    });

    test('should fail without token (401)', async () => {
      const res = await request(app)
        .get(`/api/equipment/${equipmentId}`);

      expect(res.statusCode).toBe(401);
    });
  });
});
