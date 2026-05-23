import request from '../utils/request'

export const tenantApi = {
  register: (data) => request.post('/tenant/register', data),
  login: (data) => request.post('/tenant/login', data),
  getProfile: () => request.get('/tenant/profile'),
  getMyBookings: (params) => request.get('/tenant/bookings', { params })
}

export const roomApi = {
  getList: (params) => request.get('/room', { params }),
  getDetail: (id) => request.get(`/room/${id}`),
  add: (data) => request.post('/room', data),
  update: (id, data) => request.put(`/room/${id}`, data),
  updateStatus: (id, status) => request.patch(`/room/${id}/status`, { status }),
  delete: (id) => request.delete(`/room/${id}`)
}

export const bookingApi = {
  create: (data) => request.post('/booking', data),
  getList: (params) => request.get('/booking', { params }),
  getDetail: (id) => request.get(`/booking/${id}`),
  confirm: (id) => request.patch(`/booking/${id}/confirm`),
  cancel: (id) => request.patch(`/booking/${id}/cancel`)
}

export const settlementApi = {
  getList: (params) => request.get('/settlement', { params }),
  getStats: () => request.get('/settlement/stats'),
  markPaid: (id) => request.patch(`/settlement/${id}/pay`),
  complete: (id) => request.patch(`/settlement/${id}/complete`)
}
