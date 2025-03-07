// src/services/authService.js
import axios from 'axios'

// You can use mock data for initial development
const MOCK_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
]

// Flag to toggle between mock mode and API mode
const USE_MOCK = true // Set to false when your backend is ready

// Create API client (for when you're ready to connect to your backend)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add interceptor for authentication
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default {
  // Login method
  async login(credentials) {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Check credentials against mock data
      const user = MOCK_USERS.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      )
      
      if (user) {
        // Create a simple "token" (just for demonstration)
        const mockToken = btoa(JSON.stringify({
          username: user.username,
          role: user.role,
          exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        }))
        
        // Store mock authentication data
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('user', JSON.stringify({
          username: user.username,
          role: user.role
        }))
        
        return { success: true, user: { username: user.username, role: user.role } }
      } else {
        throw new Error('Invalid username or password')
      }
    } else {
      // Real API call for when your backend is ready
      return apiClient.post('/auth/login', credentials)
        .then(response => {
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token)
            if (response.data.user) {
              localStorage.setItem('user', JSON.stringify(response.data.user))
            }
          }
          return response.data
        })
    }
  },
  
  // Logout method
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return Promise.resolve()
  },
  
  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('auth_token')
    if (!token) return false
    
    if (USE_MOCK) {
      try {
        // Parse the mock token
        const parsed = JSON.parse(atob(token))
        // Check if token is expired
        return parsed.exp > Date.now()
      } catch (e) {
        return false
      }
    } else {
      // For a real JWT, you'd want to check if it's expired
      // This is a simplified example
      return true
    }
  }
}