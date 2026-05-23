/**
 * ============================================
 * 租客模块 + 房源模块 集成测试
 * 编写人：学生A | 运行人：学生B
 * ============================================
 * 
 * 运行方式：
 *   1. 确保后端服务已启动: npm run dev
 *   2. 新开终端运行: npx jest tenant-room.test.js
 * 
 * 注意：测试依赖本地 MySQL 数据库，请先执行 init.sql
 */

const BASE_URL = 'http://localhost:3000/api';

let tenantToken = '';
let adminToken = '';
let testRoomId = null;

// ==================== 租客模块测试 ====================

test('T01 - 注册新租客', async () => {
  const res = await fetch(`${BASE_URL}/tenant/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser_' + Date.now(),
      password: 'test123',
      real_name: '测试用户',
      phone: '13900001111',
      email: 'test@test.com'
    })
  });
  const data = await res.json();
  expect(res.status).toBe(201);
  expect(data.code).toBe(201);
});

test('T02 - 重复用户名注册应返回409', async () => {
  const res = await fetch(`${BASE_URL}/tenant/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'zhangsan',
      password: '123456',
      real_name: '重复',
      phone: '13800000000'
    })
  });
  expect(res.status).toBe(409);
});

test('T03 - 租客登录获取 Token', async () => {
  const res = await fetch(`${BASE_URL}/tenant/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'zhangsan', password: '123456' })
  });
  const data = await res.json();
  expect(res.status).toBe(200);
  expect(data.data.token).toBeDefined();
  tenantToken = data.data.token;
});

test('T04 - 管理员登录获取 Token', async () => {
  const res = await fetch(`${BASE_URL}/tenant/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' })
  });
  const data = await res.json();
  expect(res.status).toBe(200);
  expect(data.data.user.role).toBe('admin');
  adminToken = data.data.token;
});

test('T05 - 错误密码登录返回401', async () => {
  const res = await fetch(`${BASE_URL}/tenant/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
  });
  expect(res.status).toBe(401);
});

test('T06 - 获取个人信息（需认证）', async () => {
  const res = await fetch(`${BASE_URL}/tenant/profile`, {
    headers: { 'Authorization': `Bearer ${tenantToken}` }
  });
  const data = await res.json();
  expect(res.status).toBe(200);
  expect(data.data.username).toBe('zhangsan');
});

test('T07 - 未认证访问个人信息返回401', async () => {
  const res = await fetch(`${BASE_URL}/tenant/profile`);
  expect(res.status).toBe(401);
});

test('T08 - 查看我的预订', async () => {
  const res = await fetch(`${BASE_URL}/tenant/bookings`, {
    headers: { 'Authorization': `Bearer ${tenantToken}` }
  });
  const data = await res.json();
  expect(res.status).toBe(200);
  expect(data.data.list).toBeDefined();
});

// ==================== 房源模块测试 ====================

test('R01 - 获取房源列表（公开）', async () => {
  const res = await fetch(`${BASE_URL}/room`);
  const data = await res.json();
  expect(res.status).toBe(200);
  expect(data.data.list.length).toBeGreaterThan(0);
});

test('R02 - 按房型筛选房源', async () => {
  const res = await fetch(`${BASE_URL}/room?room_type=suite`);
  const data = await res.json();
  expect(res.status).toBe(200);
  data.data.list.forEach(room => {
    expect(room.room_type).toBe('suite');
  });
});

test('R03 - 管理员添加房间', async () => {
  const res = await fetch(`${BASE_URL}/room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: '测试房间-' + Date.now(),
      description: '集成测试用',
      price: 199.00,
      room_type: 'single'
    })
  });
  const data = await res.json();
  expect(res.status).toBe(201);
  testRoomId = data.data.id;
});

test('R04 - 普通用户不能添加房间（403）', async () => {
  const res = await fetch(`${BASE_URL}/room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tenantToken}`
    },
    body: JSON.stringify({ title: '非法添加', price: 100, room_type: 'single' })
  });
  expect(res.status).toBe(403);
});

test('R05 - 管理员修改房间状态', async () => {
  if (!testRoomId) return;
  const res = await fetch(`${BASE_URL}/room/${testRoomId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'maintenance' })
  });
  const data = await res.json();
  expect(res.status).toBe(200);
});

test('R06 - 无效状态值返回400', async () => {
  if (!testRoomId) return;
  const res = await fetch(`${BASE_URL}/room/${testRoomId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'invalid_status' })
  });
  expect(res.status).toBe(400);
});

test('R07 - 管理员删除测试房间', async () => {
  if (!testRoomId) return;
  const res = await fetch(`${BASE_URL}/room/${testRoomId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  expect(res.status).toBe(200);
});

// 导出供 Jest 使用
module.exports = {};
