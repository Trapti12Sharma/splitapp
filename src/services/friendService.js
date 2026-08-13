import api from './api'

export const friendService = {
  getFriends: () => api.get('/friends'),
  getFriendRequests: () => api.get('/friends/requests'),
  sendRequest: (userId) => api.post('/friends/request', { userId }),
  acceptRequest: (id) => api.put(`/friends/${id}/accept`),
  rejectRequest: (id) => api.put(`/friends/${id}/reject`),
  removeFriend: (id) => api.delete(`/friends/${id}`),
  getFriendBalance: (id) => api.get(`/friends/${id}/balance`),
  searchUsers: (q) => api.get('/users/search', { params: { q } }),
}
