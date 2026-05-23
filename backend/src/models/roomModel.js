const pool = require('../config/db');

const roomModel = {
  /** 查询所有房间（支持筛选） */
  findAll: async ({ room_type, status, min_price, max_price, page = 1, pageSize = 10 } = {}) => {
    let sql = 'SELECT * FROM room WHERE 1=1';
    const params = [];

    if (room_type) { sql += ' AND room_type = ?'; params.push(room_type); }
    if (status)    { sql += ' AND status = ?';    params.push(status); }
    if (min_price) { sql += ' AND price >= ?';     params.push(min_price); }
    if (max_price) { sql += ' AND price <= ?';     params.push(max_price); }

    // 分页
    const offset = (page - 1) * pageSize;
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS total');
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), Number(offset));

    const [rows] = await pool.query(sql, params);
    const [countResult] = await pool.query(countSql, params.slice(0, -2));
    return { list: rows, total: countResult[0].total, page, pageSize };
  },

  /** 根据ID查找 */
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM room WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /** 添加房间 */
  create: async ({ title, description, price, room_type, image_url }) => {
    const [result] = await pool.query(
      'INSERT INTO room (title, description, price, room_type, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, description, price, room_type, image_url]
    );
    return { id: result.insertId };
  },

  /** 更新房间 */
  update: async (id, { title, description, price, room_type, image_url }) => {
    await pool.query(
      'UPDATE room SET title=?, description=?, price=?, room_type=?, image_url=? WHERE id=?',
      [title, description, price, room_type, image_url, id]
    );
    return true;
  },

  /** 更新房间状态 */
  updateStatus: async (id, status) => {
    await pool.query('UPDATE room SET status=? WHERE id=?', [status, id]);
    return true;
  },

  /** 删除房间 */
  delete: async (id) => {
    await pool.query('DELETE FROM room WHERE id=?', [id]);
    return true;
  }
};

module.exports = roomModel;
