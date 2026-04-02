import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmployeeDashboard, AdminDashboard } from './pages/Dashboard';
import { PrivateRoute } from './components/PrivateRoute';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoute requiredRole="Employee">
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute requiredRole="Admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
