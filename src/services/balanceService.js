import api from './api'

export const balanceService = {
  getUserBalances: () => api.get('/balances'),
  getGroupBalances: (groupId) => api.get(`/groups/${groupId}/balances`),
  getFriendBalance: (friendId) => api.get(`/friends/${friendId}/balance`),
}
