<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

// Define navigation bar links
const managementMenuItems = [
    { path: '/line-items', label: "Line Items" },
    { path: '/contracts', label: "Contracts" },
    { path: '/personnel', label: "Personnel" },
    { path: '/locations', label: "Locations" },
]

</script>

<template>
    <nav class="navbar is-link" role="navigation" aria-label="main navigation">
        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
                <router-link
                    to="/"
                    class="navbar-item"
                    :class="{ 'is-selected': route.path === '/' }"
                    >
                    Home
                </router-link>
                <router-link
                    to="/staffing"
                    class="navbar-item"
                    :class="{ 'is-selected': route.path === '/staffing' }"
                    >
                    Staffing
                </router-link>
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
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
                    to="/roadmap"
                    class="navbar-item"
                    :class="{ 'is-selected': route.path === '/roadmap' }"
                    >
                    Roadmap
                </router-link>
            </div>
        </div>
    </nav>
</template>
