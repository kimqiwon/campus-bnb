const settlementService = require('../services/settlementService');

const settlementController = {
  /** GET /api/settlement */
  getList: async (req, res) => {
    try {
      const { payment_status, page, pageSize } = req.query;
      const result = await settlementService.getSettlementList({ payment_status, page, pageSize });
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  /** GET /api/settlement/stats */
  getStats: async (req, res) => {
    try {
      const stats = await settlementService.getStats();
      res.json({ code: 200, data: stats });
    } catch (err) {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  /** PATCH /api/settlement/:id/pay */
  markPaid: async (req, res) => {
    try {
      const result = await settlementService.markPaid(req.params.id);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  },

  /** PATCH /api/settlement/:id/complete */
  complete: async (req, res) => {
    try {
      const result = await settlementService.completeSettlement(req.params.id);
      res.json({ code: 200, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
    }
  }
};

module.exports = settlementController;
