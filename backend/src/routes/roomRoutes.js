const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roomController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 公开接口
router.get('/', ctrl.getRoomList);
router.get('/:id', ctrl.getRoomDetail);

// 管理员接口
router.post('/', authMiddleware, adminMiddleware, ctrl.addRoom);
router.put('/:id', authMiddleware, adminMiddleware, ctrl.updateRoom);
router.patch('/:id/status', authMiddleware, adminMiddleware, ctrl.updateRoomStatus);
router.delete('/:id', authMiddleware, adminMiddleware, ctrl.deleteRoom);

module.exports = router;
