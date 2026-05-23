const pool = require('../config/db');

const settlementModel = {
  /** 结算列表 */
  findAll: async ({ payment_status, page = 1, pageSize = 10 } = {}) => {
    let sql = `
      SELECT s.*, b.check_in, b.check_out, b.nights,
             t.real_name AS tenant_name, r.title AS room_title
      FROM settlement s
      JOIN booking b ON s.booking_id = b.id
      JOIN tenant t ON b.tenant_id = t.id
      JOIN room r   ON b.room_id   = r.id
      WHERE 1=1`;
    const params = [];

    if (payment_status) { sql += ' AND s.payment_status = ?'; params.push(payment_status); }

    const countSql = sql.replace(/SELECT .* FROM/, 'SELECT COUNT(*) AS total FROM');
    const offset = (page - 1) * pageSize;
    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), Number(offset));

    const [rows] = await pool.query(sql, params);
    const [countResult] = await pool.query(countSql, params.slice(0, -2));
    return { list: rows, total: countResult[0].total, page, pageSize };
  },

  /** 创建结算记录（预订确认时自动生成） */
  create: async (booking_id, amount) => {
    const [result] = await pool.query(
      'INSERT INTO settlement (booking_id, amount) VALUES (?, ?)',
      [booking_id, amount]
    );
    return { id: result.insertId };
  },

  /** 标记已支付 */
  markPaid: async (id) => {
    await pool.query(
      "UPDATE settlement SET payment_status='paid', settled_at=NOW() WHERE id=?",
      [id]
    );
    return true;
  },

  /** 订单完成归档（核销） */
  complete: async (id, booking_id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // 更新结算和预订状态
      await conn.query(
        "UPDATE settlement SET payment_status='paid', settled_at=NOW() WHERE id=?",
        [id]
      );
      await conn.query(
        "UPDATE booking SET status='completed' WHERE id=?",
        [booking_id]
      );
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /** 统计 */
  getStats: async () => {
    const [totalResult] = await pool.query(
      'SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS total_amount FROM settlement'
    );
    const [paidResult] = await pool.query(
      "SELECT COUNT(*) AS paid_count, COALESCE(SUM(amount),0) AS paid_amount FROM settlement WHERE payment_status='paid'"
    );
    const [cancelResult] = await pool.query(
      "SELECT COUNT(*) AS cancel_count FROM booking WHERE status='cancelled'"
    );
    return {
      total_settlements: totalResult[0].total,
      total_amount: totalResult[0].total_amount,
      paid_count: paidResult[0].paid_count,
      paid_amount: paidResult[0].paid_amount,
      cancel_count: cancelResult[0].cancel_count
    };
  }
};

module.exports = settlementModel;
