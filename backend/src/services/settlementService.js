const settlementModel = require('../models/settlementModel');
const bookingModel = require('../models/bookingModel');
const roomModel = require('../models/roomModel');

const settlementService = {
  /** 结算列表 */
  getSettlementList: async (query) => {
    return settlementModel.findAll(query);
  },

  /** 标记已支付 */
  markPaid: async (id) => {
    await settlementModel.markPaid(id);
    return { message: '已标记为已支付' };
  },

  /** 订单核销归档 */
  completeSettlement: async (id) => {
    const settlements = await settlementModel.findAll({ page: 1, pageSize: 1000 });
    const settlement = settlements.list.find(s => s.id === Number(id));
    if (!settlement) {
      throw { status: 404, message: '结算记录不存在' };
    }

    await settlementModel.complete(id, settlement.booking_id);
    // 恢复房间为空闲状态
    const booking = await bookingModel.findById(settlement.booking_id);
    if (booking) {
      await roomModel.updateStatus(booking.room_id, 'available');
    }

    return { message: '订单已核销归档，房间已恢复空闲' };
  },

  /** 统计 */
  getStats: async () => {
    return settlementModel.getStats();
  }
};

module.exports = settlementService;
