<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
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
        </div>
    </nav>
</template>

<style scoped>
.navbar-item.is-active,
.navbar-link.is-active {
    color: gold !important;
    font-weight: bold;;
}

/* Optional: adjust hover state for consistency */
.navbar-item.is-active:hover,
.navbar-link.is-active:hover {
    color: #e6c200 !important; /* Slightly darker gold on hover */
}
</style>