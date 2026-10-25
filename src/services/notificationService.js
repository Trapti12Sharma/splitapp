import api from './api'

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getPushPublicKey: () => api.get('/push/public-key'),
  subscribePush: (subscription) => api.post('/push/subscribe', subscription),
  unsubscribePush: (endpoint) => api.post('/push/unsubscribe', { endpoint }),
}
