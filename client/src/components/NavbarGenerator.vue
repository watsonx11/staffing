<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

// Define navigation bar links
const managementMenuItems = [
    { path: '/contracts', label: "Contracts" },
    { path: '/line-items', label: "Line Items" },
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
            </div>
        </div>
    </nav>
</template>
