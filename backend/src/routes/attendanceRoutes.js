const express = require('express');
const {
    getAttendance,
    checkIn,
    checkOut,
    upsertAttendance
} = require('../controllers/attendanceController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAttendance);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/', requireRole('ADMIN', 'HR_MANAGER'), upsertAttendance);

module.exports = router;
