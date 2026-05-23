const roomModel = require('../models/roomModel');

const roomService = {
  /** 获取房间列表 */
  getRoomList: async (query) => {
    return roomModel.findAll(query);
  },

  /** 获取房间详情 */
  getRoomDetail: async (id) => {
    const room = await roomModel.findById(id);
    if (!room) {
      throw { status: 404, message: '房间不存在' };
    }
    return room;
  },

  /** 添加房间 */
  addRoom: async (data) => {
    return roomModel.create(data);
  },

  /** 更新房间 */
  updateRoom: async (id, data) => {
    const room = await roomModel.findById(id);
    if (!room) {
      throw { status: 404, message: '房间不存在' };
    }
    await roomModel.update(id, data);
    return { message: '更新成功' };
  },

  /** 修改房间状态 */
  updateRoomStatus: async (id, status) => {
    const validStatuses = ['available', 'booked', 'maintenance'];
    if (!validStatuses.includes(status)) {
      throw { status: 400, message: '无效的房间状态，可选值：available/booked/maintenance' };
    }
    const room = await roomModel.findById(id);
    if (!room) {
      throw { status: 404, message: '房间不存在' };
    }
    await roomModel.updateStatus(id, status);
    return { message: '状态更新成功' };
  },

  /** 删除房间 */
  deleteRoom: async (id) => {
    const room = await roomModel.findById(id);
    if (!room) {
      throw { status: 404, message: '房间不存在' };
    }
    await roomModel.delete(id);
    return { message: '删除成功' };
  }
};

module.exports = roomService;
