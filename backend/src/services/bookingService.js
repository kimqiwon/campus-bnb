const bookingModel = require('../models/bookingModel');
const roomModel = require('../models/roomModel');
const settlementModel = require('../models/settlementModel');

const bookingService = {
  /** 提交预订 */
  createBooking: async ({ tenant_id, room_id, check_in, check_out }) => {
    // 1. 校验房间是否存在且状态为 available
    const room = await roomModel.findById(room_id);
    if (!room) {
      throw { status: 404, message: '房间不存在' };
    }
    if (room.status !== 'available') {
      throw { status: 400, message: '该房间当前不可预订' };
    }

    // 2. 校验日期
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    if (checkOutDate <= checkInDate) {
      throw { status: 400, message: '退房日期必须晚于入住日期' };
    }

    // 3. 计算天数
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
      throw { status: 400, message: '入住天数必须大于0' };
    }

    // 4. 检查日期冲突
    const hasConflict = await bookingModel.checkConflict(room_id, check_in, check_out);
    if (hasConflict) {
      throw { status: 409, message: '该时段房间已被预订，请选择其他日期' };
    }

    // 5. 计算总价
    const total_price = nights * room.price;

    // 6. 创建预订
    return bookingModel.create({ tenant_id, room_id, check_in, check_out, nights, total_price });
  },

  /** 查询预订列表 */
  getBookingList: async (query, user) => {
    // 租客只能看自己的预订
    if (user.role === 'tenant') {
      query.tenant_id = user.id;
    }
    return bookingModel.findAll(query);
  },

  /** 预订详情 */
  getBookingDetail: async (id) => {
    const booking = await bookingModel.findById(id);
    if (!booking) {
      throw { status: 404, message: '预订不存在' };
    }
    return booking;
  },

  /** 确认预订（管理员） */
  confirmBooking: async (id) => {
    const booking = await bookingModel.findById(id);
    if (!booking) {
      throw { status: 404, message: '预订不存在' };
    }
    if (booking.status !== 'pending') {
      throw { status: 400, message: '只有待确认的预订才能确认' };
    }

    // 更新预订状态 + 房间状态 + 生成结算记录
    await bookingModel.updateStatus(id, 'confirmed');
    await roomModel.updateStatus(booking.room_id, 'booked');
    await settlementModel.create(id, booking.total_price);

    return { message: '预订已确认，结算记录已生成' };
  },

  /** 取消预订 */
  cancelBooking: async (id, user) => {
    const booking = await bookingModel.findById(id);
    if (!booking) {
      throw { status: 404, message: '预订不存在' };
    }
    // 权限校验：租客只能取消自己的，管理员可以取消任意
    if (user.role === 'tenant' && booking.tenant_id !== user.id) {
      throw { status: 403, message: '无权取消他人预订' };
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw { status: 400, message: '当前状态不可取消' };
    }

    await bookingModel.updateStatus(id, 'cancelled');
    // 恢复房间状态
    await roomModel.updateStatus(booking.room_id, 'available');

    return { message: '预订已取消' };
  }
};

module.exports = bookingService;
