// src/plugins/router.js
import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/plugins/auth'

const routes = [
    // Login route
    { 
        path: '/login', 
        name: 'login', 
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    // Your existing routes, now with auth requirements
    { 
        path: '', 
        name: 'home', 
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/locations', 
        name: 'locations', 
        component: () => import('@/views/Locations.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/personnel', 
        name: 'personnel', 
        component: () => import('@/views/Personnel.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/contracts', 
        name: 'contracts', 
        component: () => import('@/views/Contracts.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/line-items', 
        name: 'line-items', 
        component: () => import('@/views/ContractLineItems.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/staffing', 
        name: 'staffing', 
        component: () => import('@/views/Staffing.vue'),
        meta: { requiresAuth: true } 
    },
    { 
        path: '/roadmap', 
        name: 'roadmap', 
        component: () => import('@/views/Roadmap.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/reports', 
        name: 'reports', 
        component: () => import('@/views/Reports.vue'),
        meta: { requiresAuth: true }
    },
    // Catch-all redirect
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    routes,
    history: createWebHistory()
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    
    if (requiresAuth && !isAuthenticated()) {
        // Redirect to login if trying to access protected route without authentication
        next('/login')
    } else if (to.path === '/login' && isAuthenticated()) {
        // Redirect to home if already authenticated and trying to access login
        next('/')
    } else {
        next()
    }
})

export default router