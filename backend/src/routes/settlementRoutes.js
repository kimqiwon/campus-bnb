const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settlementController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 管理员接口
router.get('/', authMiddleware, adminMiddleware, ctrl.getList);
router.get('/stats', authMiddleware, adminMiddleware, ctrl.getStats);
router.patch('/:id/pay', authMiddleware, adminMiddleware, ctrl.markPaid);
router.patch('/:id/complete', authMiddleware, adminMiddleware, ctrl.complete);

module.exports = router;
