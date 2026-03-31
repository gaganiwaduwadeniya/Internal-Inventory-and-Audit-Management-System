const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

// Mock Express app for testing
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
  // Use a test database
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/equipment-management-test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Cleanup: drop test database
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

// Clean up collections before each test
beforeEach(async () => {
  await User.deleteMany({});
  await Equipment.deleteMany({});
});

describe('Authentication Tests', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new employee successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'Employee',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.role).toBe('Employee');
      expect(res.body.user.password).toBeUndefined(); // Password not returned
    });

    test('should register a new admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'adminuser',
          email: 'admin@example.com',
          password: 'password123',
          role: 'Admin',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('Admin');
      expect(res.body.token).toBeDefined();
    });

    test('should fail registration without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          // Missing email and password
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required fields');
    });

    test('should fail registration with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user1',
          email: 'duplicate@example.com',
          password: 'password123',
        });

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already exists');
    });

    test('should fail registration with duplicate username', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'email1@example.com',
          password: 'password123',
        });

      // Second registration with same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'email2@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    test('should default role to Employee if invalid role provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'InvalidRole',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('Employee');
    });

    test('should hash password before storing', async () => {
      const plainPassword = 'mypassword123';

      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: plainPassword,
        });

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash is long
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123',
          role: 'Employee',
        });
    });

    test('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.body.user.role).toBe('Employee');
    });

    test('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    test('should fail login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    test('should fail login without email or password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          // Missing password
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('email and password');
    });

    test('JWT token should be valid and contain user role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      const token = res.body.token;
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.role).toBe('Employee');
      expect(decoded.id).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'meuser',
          email: 'me@example.com',
          password: 'password123',
        });

      token = res.body.token;
      userId = res.body.user.id;
    });

    test('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('me@example.com');
      expect(res.body.user._id).toBe(userId);
    });

    test('should fail without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_123');

      expect(res.statusCode).toBe(401);
    });
  });
});
