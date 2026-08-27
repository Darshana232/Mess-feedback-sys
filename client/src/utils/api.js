const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`)
    }

    return { success: true, data, status: response.status }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message)
    return { success: false, error: error.message }
  }
}

export const authAPI = {
  googleLogin: (token) =>
    apiCall('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
}

export const feedbackAPI = {
  submit: (payload) =>
    apiCall('/api/feedback/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  checkStatus: (userId, mealType) =>
    apiCall(`/api/feedback/status?userId=${userId}&mealType=${mealType}`),
  getList: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return apiCall(`/api/feedback/list?${params}`)
  },
}

export const menuAPI = {
  getByDate: (vendorId, date) =>
    apiCall(`/api/menu?vendorId=${vendorId}&date=${date}`),
  update: (payload) =>
    apiCall('/api/menu/update', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  uploadImage: (formData) =>
    apiCall('/api/menu/upload-image', {
      method: 'POST',
      headers: {},
      body: formData,
    }),
}

export const adminAPI = {
  getAnalytics: (userId) =>
    apiCall(`/api/admin/analytics?userId=${userId}`),
  getSuggestions: (userId) =>
    apiCall(`/api/admin/suggestions?userId=${userId}`),
  getUsers: (userId) =>
    apiCall(`/api/admin/users?userId=${userId}`),
  updateUser: (userId, targetUserId, newRole) =>
    apiCall(`/api/admin/update-user?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ targetUserId, newRole }),
    }),
  inviteUser: (userId, email, role, assignedVendor) =>
    apiCall(`/api/admin/invite-user?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ email, role, assignedVendor }),
    }),
}

export const vendorAPI = {
  getPerformance: (vendorId) =>
    apiCall(`/api/vendor/performance?vendorId=${vendorId}`),
  getFeedback: (vendorId) =>
    apiCall(`/api/vendor/feedback?vendorId=${vendorId}`),
}

export default apiCall
