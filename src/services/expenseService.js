import api from './api'

export const expenseService = {
  getExpenses: (params) => api.get('/expenses', { params }),
  createExpense: (formData) => api.post('/expenses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getExpense: (id) => api.get(`/expenses/${id}`),
  updateExpense: (id, formData) => api.put(`/expenses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getGroupExpenses: (groupId, params) => api.get(`/groups/${groupId}/expenses`, { params }),
  createGroupExpense: (groupId, formData) => api.post(`/groups/${groupId}/expenses`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}
