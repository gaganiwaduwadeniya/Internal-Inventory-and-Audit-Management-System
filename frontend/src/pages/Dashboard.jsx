import React, { useState, useEffect } from 'react';
import { equipmentService } from '../utils/services';
import '../styles/dashboard.css';

export function EmployeeDashboard() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceName, setDeviceName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipment();
      setEquipment(response.data.data);
    } catch (err) {
      setError('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await equipmentService.createEquipment(deviceName, serialNumber, assignedDate);
      setSuccess('Equipment created successfully!');
      setDeviceName('');
      setSerialNumber('');
      setAssignedDate('');
      loadEquipment();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create equipment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Equipment Management - Employee Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="create-equipment-section">
          <h2>Create New Equipment Record</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleCreateEquipment}>
            <div className="form-group">
              <label htmlFor="deviceName">Device Name:</label>
              <input
                type="text"
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number:</label>
              <input
                type="text"
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="assignedDate">Assigned Date:</label>
              <input
                type="date"
                id="assignedDate"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Create Equipment</button>
          </form>
        </section>

        <section className="equipment-list-section">
          <h2>My Equipment</h2>
          {loading ? (
            <p>Loading...</p>
          ) : equipment.length === 0 ? (
            <p>No equipment records found</p>
          ) : (
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Serial Number</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item._id}>
                    <td>{item.deviceName}</td>
                    <td>{item.serialNumber}</td>
                    <td>{new Date(item.assignedDate).toLocaleDateString()}</td>
                    <td><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadAllEquipment();
  }, []);

  const loadAllEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipment();
      setEquipment(response.data.data);
    } catch (err) {
      setError('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await equipmentService.updateEquipment(id, newStatus);
      setSuccess('Equipment status updated successfully!');
      loadAllEquipment();
    } catch (err) {
      setError('Failed to update equipment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await equipmentService.deleteEquipment(id);
        setSuccess('Equipment deleted successfully!');
        loadAllEquipment();
      } catch (err) {
        setError('Failed to delete equipment');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Equipment Management - Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username} (Admin)</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="equipment-list-section">
          <h2>All Equipment Records</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {loading ? (
            <p>Loading...</p>
          ) : equipment.length === 0 ? (
            <p>No equipment records found</p>
          ) : (
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Serial Number</th>
                  <th>Assigned To</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item._id}>
                    <td>{item.deviceName}</td>
                    <td>{item.serialNumber}</td>
                    <td>{item.assignedTo.username}</td>
                    <td>{new Date(item.assignedDate).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Active">Active</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
