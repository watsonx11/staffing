<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/authService'

const route = useRoute()
const router = useRouter()

// Define navigation bar links
const managementMenuItems = [
    { path: '/line-items', label: "Line Items" },
    { path: '/contracts', label: "Contracts" },
    { path: '/personnel', label: "Personnel" },
    { path: '/locations', label: "Locations" },
]

// Check if any of the management items are active
const isManagementActive = computed(() => {
    return managementMenuItems.some(item => item.path === route.path)
})

// Handle logout
const handleLogout = async () => {
    await authService.logout()
    router.push('/login')
}
</script>

<template>
    <nav class="navbar is-link" role="navigation" aria-label="main navigation">
        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
                <router-link
                    to="/"
                    class="navbar-item"
                    :class="{ 'is-active': route.path === '/' }"
                    >
                    Home
                </router-link>
                <router-link
                    to="/staffing"
                    class="navbar-item"
                    :class="{ 'is-active': route.path === '/staffing' }"
                    >
                    Staffing
                </router-link>
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link" :class="{ 'is-active': isManagementActive }">
                        Management
                    </a>
                    <div class="navbar-dropdown">
                        <router-link
                            v-for="(item, index) in managementMenuItems"
                            :key="index"
                            :to="item.path"
                            class="navbar-item"
                            :class="{ 'is-selected': route.path === item.path }"
                        >
                            {{ item.label }}
                        </router-link>
                    </div>
                </div>
                <router-link
                    to="/reports"
                    class="navbar-item"
                    :class="{ 'is-active': route.path === '/reports' }"
                    >
                    Reports
                </router-link>
                <router-link
                    to="/roadmap"
                    class="navbar-item"
                    :class="{ 'is-active': route.path === '/roadmap' }"
                    >
                    Roadmap
                </router-link>
            </div>
            
            <!-- Add this navbar-end section for logout button -->
            <div class="navbar-end">
                <div class="navbar-item">
                    <div class="buttons">
                        <button @click="handleLogout" class="button is-link">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.navbar-item.is-active,
.navbar-link.is-active {
    color: gold !important;
    font-weight: bold;;
}

.navbar-item:hover,
.navbar-item button:hover {
    color: #e6c200;
}

/* Optional: adjust hover state for consistency */
.navbar-item.is-active:hover,
.navbar-link.is-active:hover {
    color: #e6c200 !important; /* Slightly darker gold on hover */
}
</style>