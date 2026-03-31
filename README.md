# Equipment Management System - Full Stack Application

A secure, scalable full-stack web application for managing equipment with role-based access control (RBAC).

## Project Overview

This application implements:
- **Authentication & Authorization**: JWT-based authentication with two user roles (Employee and Admin)
- **Role-Based Access Control (RBAC)**:
  - **Employees**: Can create their own equipment records and view only their own equipment
  - **Admins**: Can view all equipment, update equipment status, and delete records
- **Equipment Management**: Create, read, update, and delete equipment records with fields for Device Name, Serial Number, Assigned Date, and Status

## Technology Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Mongoose** for database modeling

### Frontend
- **React** (v18)
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** for styling

## Project Structure

```
NovaCodex/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── equipmentController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Equipment.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── equipment.js
│   │   └── index.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── AuthPages.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── auth.css
│   │   │   └── dashboard.css
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── services.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── .gitignore
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas connection string)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/equipment-management
   JWT_SECRET=your_secure_secret_key_here
   NODE_ENV=development
   ```

5. For MongoDB setup:
   - **Local Setup**: [Install MongoDB locally](https://docs.mongodb.com/manual/installation/)
   - **Cloud Setup**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a free cloud database

6. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will open on `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

**POST** `/api/auth/register`
- Register a new user
- Body: `{ username, email, password, role?: "Employee" | "Admin" }`
- Returns: JWT token and user data

**POST** `/api/auth/login`
- Login with credentials
- Body: `{ email, password }`
- Returns: JWT token and user data

**GET** `/api/auth/me`
- Get current authenticated user
- Headers: `Authorization: Bearer {token}`
- Returns: User data

### Equipment Endpoints

**POST** `/api/equipment`
- Create equipment record (Employee creates for self)
- Headers: `Authorization: Bearer {token}`
- Body: `{ deviceName, serialNumber, assignedDate }`
- Returns: Created equipment object

**GET** `/api/equipment`
- Get all equipment (Admin) or user's equipment (Employee)
- Headers: `Authorization: Bearer {token}`
- Returns: Array of equipment

**GET** `/api/equipment/:id`
- Get single equipment record
- Headers: `Authorization: Bearer {token}`
- Returns: Equipment object

**PUT** `/api/equipment/:id`
- Update equipment status (Admin only)
- Headers: `Authorization: Bearer {token}`
- Body: `{ status: "Active" | "Damaged" | "Retired" }`
- Returns: Updated equipment object

**DELETE** `/api/equipment/:id`
- Delete equipment record (Admin only)
- Headers: `Authorization: Bearer {token}`
- Returns: Success message

## Usage Guide

### For Employees
1. Register a new account or login with existing credentials
2. On the Employee Dashboard:
   - Fill in equipment details (Device Name, Serial Number, Assigned Date)
   - View your equipment records in the table
   - See only your own equipment and their current status

### For Admins
1. Login with admin credentials
2. On the Admin Dashboard:
   - View all equipment records from all employees
   - Update equipment status using the dropdown (Active/Damaged/Retired)
   - Delete equipment records with the Delete button
   - See which employee each equipment is assigned to

## Testing the Application

### Test Credentials (Optional - Create Your Own)

**Employee User:**
- Email: `employee@test.com`
- Password: `password123`
- Role: `Employee`

**Admin User:**
- Email: `admin@test.com`
- Password: `password123`
- Role: `Admin`

### Test Workflow
1. **Register** - Create new employee account
2. **Login** - Access the application
3. **Create Equipment** - Add equipment records (Employee)
4. **View Equipment** - See your records (Employee) or all records (Admin)
5. **Update Status** - Change equipment status (Admin only)
6. **Delete** - Remove records (Admin only)

## Key Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication with 24-hour token expiration
- Secure password hashing with bcryptjs
- Role-based access control middleware

✅ **Employee Features**
- Create equipment records
- View only their own equipment
- Equipment fields: Device Name, Serial Number, Assigned Date, Status

✅ **Admin Features**
- View all equipment records from all employees
- Update equipment status (Active, Damaged, Retired)
- Delete equipment records

✅ **User Interface**
- Clean, responsive design
- Role-based navigation and dashboards
- Error handling and success messages
- Form validation

✅ **Database**
- MongoDB with Mongoose ODM
- User and Equipment schemas with proper relationships
- Indexed fields for performance

## Security Features

- Password encryption with bcryptjs
- JWT token-based authentication
- Authorization middleware for role validation
- Protected API endpoints
- CORS enabled for frontend-backend communication

## Error Handling

- Comprehensive error messages for all operations
- Validation for all input fields
- Proper HTTP status codes
- Client-side error display

## Development Mode

Backend development with auto-reload:
```bash
npm run dev  # Uses nodemon
```

Frontend development with hot reload:
```bash
npm start  # React development server
```

## Production Build

Frontend production build:
```bash
npm run build  # Creates optimized build in `build` folder
```

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running locally or check your MongoDB Atlas connection string
- Verify `MONGO_URI` in `.env` file

**Port Already in Use**
- Backend: Change `PORT` in `.env` (default 5000)
- Frontend: Set `PORT=3001 npm start` (default 3000)

**CORS Errors**
- Ensure backend is running on correct port
- Check proxy settings in frontend `package.json`

**JWT Token Errors**
- Clear localStorage and login again
- Ensure `JWT_SECRET` in backend matches between server instances

## Future Enhancements

- Equipment search and filtering
- Employee management for admins
- Equipment history/audit logs
- File upload for equipment documentation
- Email notifications
- Dashboard analytics
- API documentation with Swagger

## License

ISC

## Support

For issues or questions, please refer to the project documentation or contact the development team.
