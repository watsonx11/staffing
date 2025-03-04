import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/locations', name: 'locations', component: () => import('@/views/Locations.vue') },
    { path: '/personnel', name: 'personnel', component: () => import('@/views/Personnel.vue') },
    { path: '/contracts', name: 'contracts', component: () => import('@/views/Contracts.vue') },
]

const router = createRouter({
    routes,
    history: createWebHistory()
})

export default router