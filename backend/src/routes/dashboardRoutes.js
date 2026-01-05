const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/stats', getStats);

module.exports = router;
