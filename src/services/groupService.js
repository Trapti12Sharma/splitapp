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
  // Full report as a styled .xlsx. The timezone offset lets the server print
  // settle-up times and the file date in the user's local time.
  exportGroupSpreadsheet: (id) => api.get(`/groups/${id}/export`, {
    params: { tzOffset: new Date().getTimezoneOffset() },
    responseType: 'blob',
    // Big groups on a cold server can take a while to build.
    timeout: 90000,
  }),
}
