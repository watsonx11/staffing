<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavbarGenerator from '@/components/NavbarGenerator.vue'

const route = useRoute()

// Only show navbar when not on the login page
const showNavbar = computed(() => route.name !== 'login')
</script>

<template>
  <!-- Only render the navbar if not on login page -->
  <NavbarGenerator v-if="showNavbar" />

  <!-- Use a conditional class for container styling -->
  <div :class="{ 'container': showNavbar, 'full-page': !showNavbar }">
    <router-view />
  </div>
</template>

<style scoped>
.full-page {
  height: 100vh;
  width: 100%;
}
</style>