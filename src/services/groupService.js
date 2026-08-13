import api from './api'

export const groupService = {
  getGroups: () => api.get('/groups'),
  createGroup: (formData) => api.post('/groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getGroup: (id) => api.get(`/groups/${id}`),
  updateGroup: (id, formData) => api.put(`/groups/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  addMembers: (id, memberIds) => api.post(`/groups/${id}/members`, { memberIds }),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
  getGroupBalances: (id) => api.get(`/groups/${id}/balances`),
}
