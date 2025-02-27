import { createApp } from 'vue'
import App from '@/App.vue'

// Import vue-router
import router from '@/plugins/router'

// Import Bulma's CSS
import 'bulma/css/bulma.css'

createApp(App).use(router).mount('#app')
