import { createApp } from 'vue'
import App from '@/App.vue'

// Import vue-router
import router from '@/plugins/router'

// Import Bulma's CSS
import 'bulma/css/bulma.css'

// Import the toast function (and optionally setDefaults if needed)
import { toast, setDefaults } from 'bulma-toast'

// (Optional) Update default configuration if you need custom settings
setDefaults({
    duration: 3000,
    position: 'bottom-right',
    closeOnClick: false,
})

const app = createApp(App)

// Attach the toast function to global properties so you can use it anywhere
app.config.globalProperties.$toast = toast

app.use(router).mount('#app')
