import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api.config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request - URL:', config.url, 'Token:', token ? 'exists' : 'none'); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Added Authorization header'); // Debug log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // For blob responses (like PDFs), check if it's actually an error response
    if (response.config.responseType === 'blob') {
      // Check if the blob is actually a JSON error response
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = function() {
          try {
            const text = reader.result;
            // Try to parse as JSON - if it works, it's an error response
            const json = JSON.parse(text);
            if (json.success === false) {
              // This is an error response, reject it
              reject({
                response: {
                  status: 400,
                  data: json
                }
              });
            } else {
              // Valid response, return the blob
              resolve(response.data);
            }
          } catch (e) {
            // Not JSON, so it's a valid PDF blob
            resolve(response.data);
          }
        };
        reader.readAsText(response.data);
      });
    }
    return response;
  },
  (error) => {
    console.log('API Response Error - Status:', error.response?.status, 'URL:', error.config?.url); // Debug log
    
    if (error.response?.status === 401) {
      console.log('API Response Error - 401 Unauthorized, clearing auth data'); // Debug log
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect immediately, let the component handle it
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerFirstAdmin: (userData) => api.post('/auth/register-first-admin', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  getProfile: () => api.get('/auth/profile'),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  getUserAttempts: (userId) => api.get(`/users/${userId}/attempts`),
  getUserPayments: (userId) => api.get(`/users/${userId}/payments`),
  getUserExamHistory: (params) => api.get('/exams/history', { params }),
  getUserExamStats: () => api.get('/exams/stats'),
  getUserCertificates: (params) => api.get('/exams/certificates', { params }),
  generateCertificate: (attemptId) => api.post(`/exams/attempts/${attemptId}/generate-certificate`),
  downloadCertificate: (certificateId) => api.get(`/exams/certificates/${certificateId}/download`, { responseType: 'blob' }),
  autoGenerateCertificates: () => api.post('/exams/certificates/auto-generate'),
};

// Exam Categories API
export const categoryAPI = {
  getAllCategories: () => api.get('/exam-categories'),
  createCategory: (categoryData) => api.post('/exam-categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/exam-categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/exam-categories/${categoryId}`),
  getCategoryById: (categoryId) => api.get(`/exam-categories/${categoryId}`),
  getCategoryStats: (categoryId) => api.get(`/exam-categories/${categoryId}/stats`),
  getCategoryQuestions: (categoryId) => api.get(`/exam-categories/${categoryId}/questions`),
  getCategoryExams: (categoryId) => api.get(`/exam-categories/${categoryId}/exams`),
};

// Questions API
export const questionAPI = {
  getAllQuestions: (params) => api.get('/questions', { params }),
  getQuestionById: (questionId) => api.get(`/questions/${questionId}`),
  createQuestion: (questionData) => api.post('/questions', questionData),
  updateQuestion: (questionId, questionData) => api.put(`/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`),
  getQuestionsByCategory: (categoryId) => api.get(`/questions`, { params: { categoryId } }),
  getQuestionsByDifficulty: (difficulty) => api.get(`/questions`, { params: { difficulty } }),
  getQuestionsByType: (type) => api.get(`/questions`, { params: { type } }),
  bulkCreateQuestions: (questions) => api.post('/questions/bulk', { questions }),
  importQuestions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Exams API
export const examAPI = {
  getAllExams: (params) => api.get('/admin/exams', { params }),
  getExamById: (examId) => api.get(`/exams/${examId}`),
  getExamDetails: (examId) => {
    console.log('🔍 API Call - getExamDetails:', examId);
    return api.get(`/exams/${examId}`);
  },
  createExam: (examData) => api.post('/admin/exams', examData),
  updateExam: (examId, examData) => api.put(`/admin/exams/${examId}`, examData),
  deleteExam: (examId) => api.delete(`/admin/exams/${examId}`),
  getAvailableExams: () => api.get('/exams/available'),
  getUpcomingExams: () => api.get('/exams/upcoming'),
  getExamQuestions: (examId) => api.get(`/exams/${examId}/questions`),
  getExamStats: (examId) => api.get(`/exams/${examId}/stats`),
  getExamAttempts: (examId) => api.get(`/exams/${examId}/attempts`),
  publishExam: (examId) => api.put(`/admin/exams/${examId}/publish`),
  unpublishExam: (examId) => api.put(`/admin/exams/${examId}/unpublish`),
  duplicateExam: (examId) => api.post(`/admin/exams/${examId}/duplicate`),
  getUserExamHistory: (params) => api.get('/exams/history', { params }),
  getUserExamStats: () => api.get('/exams/stats'),
  getUserCertificates: (params) => api.get('/exams/certificates', { params }),
  generateCertificate: (attemptId) => api.post(`/exams/attempts/${attemptId}/generate-certificate`),
  downloadCertificate: (certificateId) => api.get(`/exams/certificates/${certificateId}/download`, { responseType: 'blob' }),
  autoGenerateCertificates: () => api.post('/exams/certificates/auto-generate'),
  getExamCategories: () => api.get('/exam-categories'),
};

// Exam Attempts API
export const attemptAPI = {
  startAttempt: (examId, bookingId) => api.post(`/exams/${examId}/start`, { bookingId }),
  submitAnswer: (attemptId, questionId, selectedOptions, timeSpent) =>
    api.post(`/exams/attempts/${attemptId}/responses`, { questionId, selectedOptions, timeSpent }),
  submitAttempt: (attemptId, responses) => api.post(`/exams/attempts/${attemptId}/complete`, { responses }),
  completeAttempt: (attemptId) => api.post(`/exams/attempts/${attemptId}/complete`),
  getAttemptHistory: (params) => api.get('/exams/attempts/history', { params }),
  getAttemptById: (attemptId) => api.get(`/exams/attempts/${attemptId}`),
  getAttemptResponses: (attemptId) => api.get(`/exams/attempts/${attemptId}/responses`),
  getAttemptAnalytics: (attemptId) => api.get(`/exams/attempts/${attemptId}/analytics`),
  pauseAttempt: (attemptId) => api.put(`/exams/attempts/${attemptId}/pause`),
  resumeAttempt: (attemptId) => api.put(`/exams/attempts/${attemptId}/resume`),
};

// Bookings API
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  createAdminBooking: (bookingData) => api.post('/bookings/admin/create', bookingData),
  getMyBookings: () => api.get('/bookings'),
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  updateBooking: (bookingId, bookingData) => api.put(`/bookings/${bookingId}`, bookingData),
  deleteBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  rescheduleBooking: (bookingId, newDateTime) => api.put(`/bookings/${bookingId}/reschedule`, { newDateTime }),
  getBookingStats: () => api.get('/bookings/stats'),
};

// Payments API
export const paymentAPI = {
  createPayment: (paymentData) => api.post('/payments', paymentData),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
  getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),
  processPayment: (paymentId, status, metadata) =>
    api.post(`/payments/${paymentId}/process`, { status, metadata }),
  refundPayment: (paymentId, amount, reason) =>
    api.post(`/payments/${paymentId}/refund`, { amount, reason }),
  getPaymentStats: () => api.get('/payments/stats/overview'),
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  updatePayment: (paymentId, paymentData) => api.put(`/payments/${paymentId}`, paymentData),
  deletePayment: (paymentId) => api.delete(`/payments/${paymentId}`),
  processPaymentOnPrint: (bookingId) => api.post(`/payments/admin/process-on-print/${bookingId}`),
};

// Billing API
export const billingAPI = {
  generateBill: (bookingId) => api.get(`/billing/${bookingId}`),
  getUserBills: (params) => api.get('/billing/user/bills', { params }),
  getAllBills: (params) => api.get('/billing/admin/all', { params }),
  downloadBill: (bookingId) => api.get(`/billing/${bookingId}/download`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getDashboardAnalytics: (params) => api.get('/analytics/dashboard', { params }),
  getUserPerformance: (categoryId) => api.get('/analytics/user-performance', { params: { categoryId } }),
  getExamAnalytics: (examId) => api.get(`/analytics/exams/${examId}`),
  getCategoryAnalytics: (categoryId) => api.get(`/analytics/categories/${categoryId}`),
  getUserAnalytics: (userId) => api.get(`/analytics/users/${userId}`),
  getSystemAnalytics: (params) => api.get('/analytics/system', { params }),
  getRevenueAnalytics: (params) => api.get('/analytics/revenue', { params }),
  getPerformanceAnalytics: (params) => api.get('/analytics/performance', { params }),
  exportAnalytics: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
  getRecentActivities: () => api.get('/analytics/dashboard'), // Use dashboard endpoint which includes recent activities
  getAuditLogs: (params) => api.get('/analytics/audit-logs', { params }),
};

// Admin API
export const adminAPI = {
  // Users
  getAllUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/auth/register', userData),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  bulkCreateUsers: (users) => api.post('/admin/users/bulk', { users }),
  importUsers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Categories
  getAllCategories: () => api.get('/admin/exam-categories'),
  createCategory: (categoryData) => api.post('/admin/exam-categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/exam-categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/admin/exam-categories/${categoryId}`),
  getCategoryDetails: (categoryId) => api.get(`/admin/exam-categories/${categoryId}`),

  // Questions
  getAllQuestions: (params) => api.get('/admin/questions', { params }),
  createQuestion: (questionData) => {
    // If questionData is FormData (for file uploads), send it directly
    if (questionData instanceof FormData) {
      return api.post('/admin/questions', questionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    // Otherwise, send as JSON
    return api.post('/admin/questions', questionData);
  },
  updateQuestion: (questionId, questionData) => api.put(`/admin/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/admin/questions/${questionId}`),
  getQuestionDetails: (questionId) => api.get(`/admin/questions/${questionId}`),
  bulkCreateQuestions: (questions) => api.post('/admin/questions/bulk', { questions }),
  importQuestions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Exams
  getAllExams: (params) => api.get('/admin/exams', { params }),
  createExam: (examData) => api.post('/admin/exams', examData),
  updateExam: (examId, examData) => api.put(`/admin/exams/${examId}`, examData),
  deleteExam: (examId) => api.delete(`/admin/exams/${examId}`),
  getExamDetails: (examId) => {
    console.log('🔍 API Call - getExamDetails:', examId);
    return api.get(`/exams/${examId}`);
  },
  publishExam: (examId) => api.put(`/admin/exams/${examId}/publish`),
  unpublishExam: (examId) => api.put(`/admin/exams/${examId}/unpublish`),
  duplicateExam: (examId) => api.post(`/admin/exams/${examId}/duplicate`),

  // Bookings
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  createAdminBooking: (bookingData) => api.post('/bookings/admin/create', bookingData),
  updateBooking: (bookingId, bookingData) => api.put(`/bookings/admin/${bookingId}/status`, bookingData),
  deleteBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  getBookingDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  approveBooking: (bookingId) => api.put(`/admin/bookings/${bookingId}/approve`),
  rejectBooking: (bookingId, reason) => api.put(`/admin/bookings/${bookingId}/reject`, { reason }),

  // Payments
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  updatePayment: (paymentId, paymentData) => api.put(`/admin/payments/${paymentId}`, paymentData),
  deletePayment: (paymentId) => api.delete(`/admin/payments/${paymentId}`),
  getPaymentDetails: (paymentId) => api.get(`/admin/payments/${paymentId}`),
  processPayment: (paymentId, status, metadata) => api.post(`/admin/payments/${paymentId}/process`, { status, metadata }),
  refundPayment: (paymentId, amount, reason) => api.post(`/admin/payments/${paymentId}/refund`, { amount, reason }),

  // System Management
  getSystemStats: () => api.get('/admin/system/stats'),
  getSystemHealth: () => api.get('/admin/system/health'),
  getSystemLogs: (params) => api.get('/admin/system/logs', { params }),
  clearSystemCache: () => api.post('/admin/system/clear-cache'),
  backupDatabase: () => api.post('/admin/system/backup'),
  restoreDatabase: (backupFile) => {
    const formData = new FormData();
    formData.append('backup', backupFile);
    return api.post('/admin/system/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Analytics & Reports
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUserAnalytics: () => api.get('/admin/users/analytics'),
  getExamAnalytics: () => api.get('/admin/exams/analytics'),
  getQuestionAnalytics: () => api.get('/admin/questions/analytics'),
  getSystemAnalytics: () => api.get('/admin/system/analytics'),
  exportData: (exportData) => api.post('/admin/system/export', exportData),

  // Settings
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (settings) => api.put('/admin/settings', settings),
  getEmailSettings: () => api.get('/admin/settings/email'),
  updateEmailSettings: (settings) => api.put('/admin/settings/email', settings),
  testEmailSettings: (testEmail) => api.post('/admin/settings/email/test', { testEmail }),
};

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/health'),
  getAPIInfo: () => api.get('/api'),
};

export default api; 