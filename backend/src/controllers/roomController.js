const roomService = require('../services/roomService');

const roomController = {
  /** GET /api/room */
  getRoomList: async (req, res) => {
    try {
      const { room_type, status, min_price, max_price, page, pageSize } = req.query;
      const result = await roomService.getRoomList({ room_type, status, min_price, max_price, page, pageSize });
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  /** GET /api/room/:id */
  getRoomDetail: async (req, res) => {
    try {
      const room = await roomService.getRoomDetail(req.params.id);
      res.json({ code: 200, data: room });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  },

  /** POST /api/room */
  addRoom: async (req, res) => {
    try {
      const { title, description, price, room_type, image_url } = req.body;
      if (!title || !price || !room_type) {
        return res.status(400).json({ code: 400, message: '标题、价格、房型为必填项' });
      }
      const result = await roomService.addRoom({ title, description, price, room_type, image_url });
      res.status(201).json({ code: 201, message: '添加成功', data: result });
    } catch (err) {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  /** PUT /api/room/:id */
  updateRoom: async (req, res) => {
    try {
      const result = await roomService.updateRoom(req.params.id, req.body);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  },

  /** PATCH /api/room/:id/status */
  updateRoomStatus: async (req, res) => {
    try {
      const result = await roomService.updateRoomStatus(req.params.id, req.body.status);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  },

  /** DELETE /api/room/:id */
  deleteRoom: async (req, res) => {
    try {
      const result = await roomService.deleteRoom(req.params.id);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  }
};

module.exports = roomController;
