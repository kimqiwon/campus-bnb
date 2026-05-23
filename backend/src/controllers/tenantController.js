const tenantService = require('../services/tenantService');
const bookingModel = require('../models/bookingModel');

const tenantController = {
  /** POST /api/tenant/register */
  register: async (req, res) => {
    try {
      const { username, password, real_name, phone, email } = req.body;
      if (!username || !password || !real_name || !phone) {
        return res.status(400).json({ code: 400, message: '用户名、密码、真实姓名、手机号为必填项' });
      }
      const result = await tenantService.register({ username, password, real_name, phone, email });
      res.status(201).json({ code: 201, message: '注册成功', data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message || '服务器错误' });
    }
  },

  /** POST /api/tenant/login */
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ code: 400, message: '用户名和密码为必填项' });
      }
      const result = await tenantService.login(username, password);
      res.json({ code: 200, message: '登录成功', data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message || '服务器错误' });
    }
  },

  /** GET /api/tenant/profile */
  getProfile: async (req, res) => {
    try {
      const user = await tenantService.getProfile(req.user.id);
      res.json({ code: 200, data: user });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message || '服务器错误' });
    }
  },

  /** GET /api/tenant/bookings */
  getMyBookings: async (req, res) => {
    try {
      const { status, page, pageSize } = req.query;
      const result = await bookingModel.findAll({
        tenant_id: req.user.id,
        status,
        page: page || 1,
        pageSize: pageSize || 10
      });
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
};

module.exports = tenantController;
