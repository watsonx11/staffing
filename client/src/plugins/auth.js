// src/plugins/auth.js
import authService from '@/services/authService'

// Helper function for router
export const isAuthenticated = () => {
    return authService.isAuthenticated()
}

// Export the auth service for convenience
export default authService