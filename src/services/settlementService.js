import api from './api'

export const settlementService = {
  getSettlements: (params) => api.get('/settlements', { params }),
  createSettlement: (data) => api.post('/settlements', data),
  getSettlement: (id) => api.get(`/settlements/${id}`),
}
