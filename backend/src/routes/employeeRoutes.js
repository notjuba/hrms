const express = require('express');
const {
    getAllEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllEmployees);
router.get('/:id', getEmployee);
router.post('/', requireRole('ADMIN', 'HR_MANAGER'), createEmployee);
router.put('/:id', requireRole('ADMIN', 'HR_MANAGER'), updateEmployee);
router.delete('/:id', requireRole('ADMIN'), deleteEmployee);

module.exports = router;
