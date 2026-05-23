const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tenantModel = require('../models/tenantModel');
require('dotenv').config();

const tenantService = {
  /** 注册 */
  register: async ({ username, password, real_name, phone, email }) => {
    // 校验用户名唯一性
    const existing = await tenantModel.findByUsername(username);
    if (existing) {
      throw { status: 409, message: '用户名已存在' };
    }
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    return tenantModel.create({
      username,
      password: hashedPassword,
      real_name,
      phone,
      email
    });
  },

  /** 登录 */
  login: async (username, password) => {
    const user = await tenantModel.findByUsername(username);
    if (!user) {
      throw { status: 401, message: '用户名或密码错误' };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: '用户名或密码错误' };
    }
    // 生成 JWT
    const role = (username === process.env.ADMIN_USERNAME) ? 'admin' : 'tenant';
    const token = jwt.sign(
      { id: user.id, username: user.username, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        phone: user.phone,
        email: user.email,
        role
      }
    };
  },

  /** 获取个人信息 */
  getProfile: async (id) => {
    const user = await tenantModel.findById(id);
    if (!user) {
      throw { status: 404, message: '用户不存在' };
    }
    return user;
  }
};

module.exports = tenantService;
