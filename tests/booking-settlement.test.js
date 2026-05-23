/**
 * ============================================
 * 预订模块 + 结算模块 集成测试
 * 编写人：学生B | 运行人：学生A
 * ============================================
 * 
 * 运行方式：
 *   1. 确保后端服务已启动: npm run dev
 *   2. 新开终端运行: npx jest booking-settlement.test.js
 */

const BASE_URL = 'http://localhost:3000/api';

let tenantToken = '';
let adminToken = '';
let testBookingId = null;
let testSettlementId = null;

// 前置：获取 Token
beforeAll(async () => {
  // 租客登录
  const tenantRes = await fetch(`${BASE_URL}/tenant/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'zhangsan', password: '123456' })
  });
  tenantToken = (await tenantRes.json()).data.token;

  // 管理员登录
  const adminRes = await fetch(`${BASE_URL}/tenant/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' })
  });
  adminToken = (await adminRes.json()).data.token;
});

// ==================== 预订模块测试 ====================

test('B01 - 提交预订（空闲房间）', async () => {
  // 先用 room_id=3 的套房（空闲状态）
  const checkIn = '2026-07-01';
  const checkOut = '2026-07-03';
  
  const res = await fetch(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tenantToken}`
    },
    body: JSON.stringify({ room_id: 3, check_in: checkIn, check_out: checkOut })
  });
  const data = await res.json();
  expect(res.status).toBe(201);
  expect(data.data.id).toBeDefined();
  testBookingId = data.data.id;
});

test('B02 - 日期冲突检测（同一时段重复预订）', async () => {
  const res = await fetch(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tenantToken}`
    },
    body: JSON.stringify({ room_id: 3, check_in: '2026-07-02', check_out: '2026-07-04' })
  });
  expect(res.status).toBe(409);
});

test('B03 - 退房日期不晚于入住日期返回400', async () => {
  const res = await fetch(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tenantToken}`
    },
    body: JSON.stringify({ room_id: 3, check_in: '2026-08-01', check_out: '2026-07-30' })
  });
  expect(res.status).toBe(400);
});

test('B04 - 预订维护中房间应失败', async () => {
  const res = await fetch(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tenantToken}`
    },
    body: JSON.stringify({ room_id: 4, check_in: '2026-09-01', check_out: '2026-09-03' })
  });
  expect(res.status).toBe(400);
});

test('B05 - 管理员确认预订', async () => {
  if (!testBookingId) return;
  const res = await fetch(`${BASE_URL}/booking/${testBookingId}/confirm`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  expect(res.status).toBe(200);

  // 确认后应生成结算记录
  const settlementRes = await fetch(`${BASE_URL}/settlement`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const settlements = await settlementRes.json();
  const found = settlements.data.list.find(s => s.booking_id === testBookingId);
  expect(found).toBeDefined();
  if (found) testSettlementId = found.id;
});

test('B06 - 普通用户不能确认预订（403）', async () => {
  if (!testBookingId) return;
  const res = await fetch(`${BASE_URL}/booking/${testBookingId}/confirm`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${tenantToken}` }
  });
  expect(res.status).toBe(403);
});

test('B07 - 取消预订', async () => {
  // 先创建一个新预订再取消
  const createRes = await fetch(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tenantToken}`
    },
    body: JSON.stringify({ room_id: 2, check_in: '2026-10-01', check_out: '2026-10-02' })
  });
  const newBooking = await createRes.json();
  
  const cancelRes = await fetch(`${BASE_URL}/booking/${newBooking.data.id}/cancel`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${tenantToken}` }
  });
  expect(cancelRes.status).toBe(200);
});

// ==================== 结算模块测试 ====================

test('S01 - 获取结算列表（管理员）', async () => {
  const res = await fetch(`${BASE_URL}/settlement`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  expect(res.status).toBe(200);
  expect(data.data.list).toBeDefined();
});

test('S02 - 普通用户不能访问结算（403）', async () => {
  const res = await fetch(`${BASE_URL}/settlement`, {
    headers: { 'Authorization': `Bearer ${tenantToken}` }
  });
  expect(res.status).toBe(403);
});

test('S03 - 获取结算统计', async () => {
  const res = await fetch(`${BASE_URL}/settlement/stats`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  expect(res.status).toBe(200);
  expect(data.data.total_settlements).toBeDefined();
  expect(data.data.total_amount).toBeDefined();
});

test('S04 - 标记已支付', async () => {
  if (!testSettlementId) return;
  const res = await fetch(`${BASE_URL}/settlement/${testSettlementId}/pay`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  expect(res.status).toBe(200);
});

test('S05 - 订单核销归档', async () => {
  if (!testSettlementId) return;
  const res = await fetch(`${BASE_URL}/settlement/${testSettlementId}/complete`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  expect(res.status).toBe(200);
});

module.exports = {};
