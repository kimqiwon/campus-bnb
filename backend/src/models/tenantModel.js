const pool = require('../config/db');

const tenantModel = {
  /** 根据用户名查找 */
  findByUsername: async (username) => {
    const [rows] = await pool.query('SELECT * FROM tenant WHERE username = ?', [username]);
    return rows[0] || null;
  },

  /** 根据ID查找 */
  findById: async (id) => {
    const [rows] = await pool.query(
      'SELECT id, username, real_name, phone, email, created_at FROM tenant WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /** 注册新租客 */
  create: async ({ username, password, real_name, phone, email }) => {
    const [result] = await pool.query(
      'INSERT INTO tenant (username, password, real_name, phone, email) VALUES (?, ?, ?, ?, ?)',
      [username, password, real_name, phone, email]
    );
    return { id: result.insertId, username, real_name, phone, email };
  }
};

module.exports = tenantModel;
