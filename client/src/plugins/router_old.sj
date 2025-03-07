import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/locations', name: 'locations', component: () => import('@/views/Locations.vue') },
    { path: '/personnel', name: 'personnel', component: () => import('@/views/Personnel.vue') },
    { path: '/contracts', name: 'contracts', component: () => import('@/views/Contracts.vue') },
    { path: '/line-items', name: 'line-items', component: () => import('@/views/ContractLineItems.vue') },
    { path: '/staffing', name: 'staffing', component: () => import('@/views/Staffing.vue') },
    { path: '/roadmap', name: 'roadmap', component: () => import('@/views/Roadmap.vue') },
    { path: '/reports', name: 'reports', component: () => import('@/views/Reports.vue') },
]

const router = createRouter({
    routes,
    history: createWebHistory()
})

export default router