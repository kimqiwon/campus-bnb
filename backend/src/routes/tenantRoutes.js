const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tenantController');
const { authMiddleware } = require('../middleware/auth');

// 公开接口
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

// 需要认证的接口
router.get('/profile', authMiddleware, ctrl.getProfile);
router.get('/bookings', authMiddleware, ctrl.getMyBookings);

module.exports = router;
