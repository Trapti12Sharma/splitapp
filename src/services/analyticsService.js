import api from './api'

export const analyticsService = {
  getSummary: () => api.get('/analytics/summary'),
  getMonthlyExpenses: () => api.get('/analytics/monthly'),
  getCategoryBreakdown: () => api.get('/analytics/categories'),
  getGroupSpending: () => api.get('/analytics/groups'),
}
