const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 需要认证
router.post('/', authMiddleware, ctrl.createBooking);
router.get('/', authMiddleware, ctrl.getBookingList);
router.get('/:id', authMiddleware, ctrl.getBookingDetail);
router.patch('/:id/cancel', authMiddleware, ctrl.cancelBooking);

// 管理员确认
router.patch('/:id/confirm', authMiddleware, adminMiddleware, ctrl.confirmBooking);

module.exports = router;
