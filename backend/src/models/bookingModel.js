const pool = require('../config/db');

const bookingModel = {
  /** 查询预订列表（支持筛选） */
  findAll: async ({ tenant_id, status, page = 1, pageSize = 10 } = {}) => {
    let sql = `
      SELECT b.*, t.real_name AS tenant_name, t.phone AS tenant_phone,
             r.title AS room_title, r.room_type
      FROM booking b
      JOIN tenant t ON b.tenant_id = t.id
      JOIN room r   ON b.room_id   = r.id
      WHERE 1=1`;
    const params = [];

    if (tenant_id) { sql += ' AND b.tenant_id = ?'; params.push(tenant_id); }
    if (status)    { sql += ' AND b.status = ?';    params.push(status); }

    const countSql = sql.replace(/SELECT .* FROM/, 'SELECT COUNT(*) AS total FROM');
    const offset = (page - 1) * pageSize;
    sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), Number(offset));

    const [rows] = await pool.query(sql, params);
    const [countResult] = await pool.query(countSql, params.slice(0, -2));
    return { list: rows, total: countResult[0].total, page, pageSize };
  },

  /** 根据ID查找 */
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT b.*, t.real_name AS tenant_name, t.phone AS tenant_phone,
              r.title AS room_title, r.room_type, r.price AS room_price
       FROM booking b
       JOIN tenant t ON b.tenant_id = t.id
       JOIN room r   ON b.room_id   = r.id
       WHERE b.id = ?`, [id]
    );
    return rows[0] || null;
  },

  /** 检查日期冲突：该房间在 [check_in, check_out) 范围内是否有已确认/待确认的预订 */
  checkConflict: async (room_id, check_in, check_out) => {
    const [rows] = await pool.query(
      `SELECT id FROM booking
       WHERE room_id = ?
         AND status IN ('pending','confirmed')
         AND check_in < ?
         AND check_out > ?`,
      [room_id, check_out, check_in]
    );
    return rows.length > 0;
  },

  /** 创建预订 */
  create: async ({ tenant_id, room_id, check_in, check_out, nights, total_price }) => {
    const [result] = await pool.query(
      'INSERT INTO booking (tenant_id, room_id, check_in, check_out, nights, total_price) VALUES (?,?,?,?,?,?)',
      [tenant_id, room_id, check_in, check_out, nights, total_price]
    );
    return { id: result.insertId };
  },

  /** 更新预订状态 */
  updateStatus: async (id, status) => {
    await pool.query('UPDATE booking SET status=? WHERE id=?', [status, id]);
    return true;
  }
};

module.exports = bookingModel;
