# Equipment Management System

A secure, full-stack application for managing equipment with role-based access control (RBAC).

**Live Demo:** [Frontend](https://internal-inventory-and-audit-manage.vercel.app) | [Backend API](https://internal-inventory-and-audit-management-system-production.up.railway.app)

## Quick Start

### Prerequisites
- Node.js 
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Update with your MongoDB URI
npm run dev
# Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

## Features

### Employee Dashboard
- Create equipment records
- View only personal equipment
- Equipment fields: Device Name, Serial Number, Assigned Date, Status

### Admin Dashboard
- View all employee equipment
- Update equipment status (Active/Damaged/Retired)
- Delete equipment records

### Security
- ✅ JWT authentication 
- ✅ bcryptjs password hashing
- ✅ Role-based access control 
- ✅ Authorization middleware on protected endpoints

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT  
**Frontend:** React 18, React Router, Axios, CSS3


## Test Accounts

```
Employee:
email: employee@test.com
password: Test@12345

Admin:
email: admin@test.com
password: Admin@12345
```

## Scripts

```bash
# Backend
npm run dev        # Development with nodemon
npm test           # Run tests
npm run test:coverage

# Frontend
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

## Deployment

**Backend:** Railway (Auto-deploys on git push)  
**Frontend:** Vercel (Auto-deploys on git push)  
**Database:** MongoDB Atlas




