import api from './api';

export const authService = {
  register: (username, email, password, role = 'Employee') =>
    api.post('/auth/register', { username, email, password, role }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getMe: () =>
    api.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const equipmentService = {
  createEquipment: (deviceName, serialNumber, assignedDate) =>
    api.post('/equipment', { deviceName, serialNumber, assignedDate }),

  getEquipment: () =>
    api.get('/equipment'),

  getEquipmentById: (id) =>
    api.get(`/equipment/${id}`),

  updateEquipment: (id, status) =>
    api.put(`/equipment/${id}`, { status }),

  deleteEquipment: (id) =>
    api.delete(`/equipment/${id}`)
};
