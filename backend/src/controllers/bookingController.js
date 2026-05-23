const bookingService = require('../services/bookingService');

const bookingController = {
  /** POST /api/booking */
  createBooking: async (req, res) => {
    try {
      const { room_id, check_in, check_out } = req.body;
      if (!room_id || !check_in || !check_out) {
        return res.status(400).json({ code: 400, message: '房间ID、入住日期、退房日期为必填项' });
      }
      const result = await bookingService.createBooking({
        tenant_id: req.user.id,
        room_id,
        check_in,
        check_out
      });
      res.status(201).json({ code: 201, message: '预订成功', data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message || '服务器错误' });
    }
  },

  /** GET /api/booking */
  getBookingList: async (req, res) => {
    try {
      const { status, page, pageSize } = req.query;
      const result = await bookingService.getBookingList({ status, page, pageSize }, req.user);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  /** GET /api/booking/:id */
  getBookingDetail: async (req, res) => {
    try {
      const booking = await bookingService.getBookingDetail(req.params.id);
      res.json({ code: 200, data: booking });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  },

  /** PATCH /api/booking/:id/confirm */
  confirmBooking: async (req, res) => {
    try {
      const result = await bookingService.confirmBooking(req.params.id);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  },

  /** PATCH /api/booking/:id/cancel */
  cancelBooking: async (req, res) => {
    try {
      const result = await bookingService.cancelBooking(req.params.id, req.user);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  }
};

module.exports = bookingController;
