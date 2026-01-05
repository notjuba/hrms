const express = require('express');
const {
    getAllDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllDepartments);
router.get('/:id', getDepartment);
router.post('/', requireRole('ADMIN', 'HR_MANAGER'), createDepartment);
router.put('/:id', requireRole('ADMIN', 'HR_MANAGER'), updateDepartment);
router.delete('/:id', requireRole('ADMIN'), deleteDepartment);

module.exports = router;
