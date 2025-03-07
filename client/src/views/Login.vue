<template>
  <div class="login-container">
    <div class="login-card">
      <div class="card-content">
        <div class="has-text-centered mb-5">
          <div class="logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="80" height="80">
              <!-- Clipboard outline -->
              <path d="M150 100 Q150 70 180 70 L320 70 Q350 70 350 100 L350 400 Q350 430 320 430 L180 430 Q150 430 150 400 Z" fill="white" stroke="#1e2a3a" stroke-width="20"/>
              <!-- Clipboard top -->
              <path d="M200 70 L300 70 L300 100 L200 100 Z" fill="#1e2a3a"/>
              <!-- Clipboard hole -->
              <circle cx="250" cy="85" r="15" fill="white"/>
              <!-- User icon -->
              <rect x="180" y="130" width="70" height="70" rx="10" fill="#1f9bcf"/>
              <circle cx="215" cy="155" r="15" fill="white"/>
              <path d="M195 185 C195 170 235 170 235 185" stroke="white" stroke-width="10" fill="none"/>
              <!-- Checkmarks -->
              <rect x="180" y="230" width="30" height="30" rx="5" fill="#1f9bcf"/>
              <path d="M185 245 L195 255 L205 235" stroke="white" stroke-width="4" fill="none"/>
              <rect x="180" y="280" width="30" height="30" rx="5" fill="#1f9bcf"/>
              <path d="M185 295 L195 305 L205 285" stroke="white" stroke-width="4" fill="none"/>
              <rect x="180" y="330" width="30" height="30" rx="5" fill="#1e2a3a"/>
              <!-- Check mark circle -->
              <circle cx="320" cy="255" r="30" stroke="#1e2a3a" stroke-width="10" fill="white"/>
              <path d="M305 255 L315 265 L335 235" stroke="#1f9bcf" stroke-width="10" fill="none"/>
              <!-- Text lines -->
              <line x1="270" y1="150" x2="340" y2="150" stroke="#1e2a3a" stroke-width="10" stroke-linecap="round"/>
              <line x1="270" y1="170" x2="340" y2="170" stroke="#1e2a3a" stroke-width="10" stroke-linecap="round"/>
              <line x1="220" y1="245" x2="270" y2="245" stroke="#1e2a3a" stroke-width="10" stroke-linecap="round"/>
              <line x1="220" y1="295" x2="270" y2="295" stroke="#1e2a3a" stroke-width="10" stroke-linecap="round"/>
              <line x1="180" y1="380" x2="340" y2="380" stroke="#1e2a3a" stroke-width="10" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="title is-3 mt-4 has-text-weight-bold has-text-dark">Management</h1>
        </div>
        
        <!-- Error notification -->
        <div v-if="errorMessage" class="notification is-danger mb-4">
          {{ errorMessage }}
        </div>
        
        <form @submit.prevent="login">
          <div class="field">
            <label class="label">Username</label>
            <div class="control has-icons-left">
              <input 
                class="input" 
                type="text" 
                placeholder="Enter your username"
                v-model="username"
                required
              >
              <span class="icon is-small is-left">
                <i class="fas fa-user"></i>
              </span>
            </div>
          </div>

          <div class="field">
            <label class="label">Password</label>
            <div class="control has-icons-left">
              <input 
                class="input" 
                type="password" 
                placeholder="Enter your password"
                v-model="password"
                required
              >
              <span class="icon is-small is-left">
                <i class="fas fa-lock"></i>
              </span>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="rememberMe">
                Remember me
              </label>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <button 
                class="button is-primary is-fullwidth"
                :class="{'is-loading': isLoading}"
                type="submit"
              >
                Login
              </button>
            </div>
          </div>
          
          <!-- Demo credentials helper -->
          <div class="mt-4 has-text-centered">
            <p class="has-text-grey is-size-7">
              <strong>Demo Credentials:</strong><br>
              Username: admin | Password: admin123<br>
              Username: user | Password: user123
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    
    const username = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const isLoading = ref(false)
    const errorMessage = ref('')
    
    const login = async () => {
      isLoading.value = true
      errorMessage.value = ''
      
      try {
        // Call the authentication service to handle login
        await authService.login({
          username: username.value,
          password: password.value,
          rememberMe: rememberMe.value
        })
        
        // Navigate to home page after successful login
        router.push('/')
      } catch (error) {
        console.error('Login failed:', error)
        errorMessage.value = error.message || 'Login failed. Please check your credentials.'
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      username,
      password,
      rememberMe,
      isLoading,
      errorMessage,
      login
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 6px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.card-content {
  padding: 2rem;
}

.logo-container {
  display: flex;
  justify-content: center;
}

/* Override Bulma's primary color to match the logo's blue */
:deep(.button.is-primary) {
  background-color: #1f9bcf;
}

:deep(.button.is-primary:hover) {
  background-color: #1a8ab9;
}
</style>