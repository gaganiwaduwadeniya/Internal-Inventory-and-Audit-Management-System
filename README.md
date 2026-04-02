# Equipment Management System

A secure, full-stack application for managing equipment with role-based access control (RBAC).

**Live Demo:** [Frontend](https://internal-inventory-and-audit-manage.vercel.app) | [Backend API](https://internal-inventory-and-audit-management-system-production.up.railway.app)

## Quick Start

### Prerequisites
- Node.js v14+
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
- ✅ JWT authentication (24h expiration)
- ✅ bcryptjs password hashing
- ✅ Role-based access control (RBAC)
- ✅ Authorization middleware on protected endpoints

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT  
**Frontend:** React 18, React Router, Axios, CSS3

## Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/equipment` | Create equipment | User |
| GET | `/api/equipment` | Get user/all equipment | User |
| PUT | `/api/equipment/:id` | Update status | Admin |
| DELETE | `/api/equipment/:id` | Delete equipment | Admin |

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

## Project Structure

```
backend/src/
├── controllers/    # Business logic
├── models/         # Mongoose schemas
├── routes/         # API endpoints
├── middleware/     # Auth & validation
├── utils/          # Helper functions
└── config/         # Database connection

frontend/src/
├── pages/          # Employee/Admin dashboards
├── components/     # Reusable UI components
├── utils/          # API services
└── styles/         # CSS (mobile-first responsive)
```

## Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [Setup & Design Decisions](SETUP_AND_DESIGN.md)
- [Requirements Checklist](REQUIREMENTS_CHECKLIST.md)

## Deployment

**Backend:** Railway (Auto-deploys on git push)  
**Frontend:** Vercel (Auto-deploys on git push)  
**Database:** MongoDB Atlas

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check `MONGO_URI` in `.env` and ensure MongoDB is running |
| Port 5000/3000 in use | Edit `.env` PORT variable or use `PORT=3001 npm start` |
| CORS errors | Ensure backend is running on correct port |
| JWT errors | Clear localStorage and login again |

## Future Enhancements

- Search & advanced filtering
- Equipment history/audit logs
- File upload support
- Email notifications
- Two-factor authentication
- Advanced RBAC with more roles

## License

ISC
