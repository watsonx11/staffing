<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
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
                            to="/locations"
                            class="navbar-item"
                            :class="{ 'is-selected': route.path === '/locations' }"
                            >
                            Locations
                        </router-link>
                        <router-link
                            to="/personnel"
                            class="navbar-item"
                            :class="{ 'is-selected': route.path === '/personnel' }"
                            >
                            Personnel
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
