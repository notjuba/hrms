const express = require('express');
const {
    getAllSalaries,
    getSalaryByEmployee,
    upsertSalary,
    getPayrollSummary
} = require('../controllers/payrollController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'HR_MANAGER'));

router.get('/', getAllSalaries);
router.get('/summary', getPayrollSummary);
router.get('/employee/:employeeId', getSalaryByEmployee);
router.post('/', upsertSalary);

module.exports = router;
