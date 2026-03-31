const express = require('express');
const router = express.Router();
const {
  createEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Create equipment (Employee can create, but only for themselves)
router.post('/', createEquipment);

// Get all equipment (Admin sees all, Employee sees own)
router.get('/', getEquipment);

// Get single equipment
router.get('/:id', getEquipmentById);

// Update equipment status (Admin only)
router.put('/:id', authorize('Admin'), updateEquipment);

// Delete equipment (Admin only)
router.delete('/:id', authorize('Admin'), deleteEquipment);

module.exports = router;
