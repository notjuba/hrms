const express = require('express');
const {
    getAllLeaves,
    getLeave,
    createLeave,
    updateLeaveStatus,
    deleteLeave
} = require('../controllers/leaveController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllLeaves);
router.get('/:id', getLeave);
router.post('/', createLeave);
router.patch('/:id/status', requireRole('ADMIN', 'HR_MANAGER'), updateLeaveStatus);
router.delete('/:id', requireRole('ADMIN', 'HR_MANAGER'), deleteLeave);

module.exports = router;
