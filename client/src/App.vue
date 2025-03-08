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
  <div class="app-layout">
    <NavbarGenerator v-if="showNavbar" class="sticky-navbar" />
    
    <!-- Use a conditional class for container styling -->
    <div :class="{ 'container content-area': showNavbar, 'full-page': !showNavbar }">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.sticky-navbar {
  position: sticky;
  top: 0;
  z-index: 100; /* Ensures navbar stays on top of other content */
}

.content-area {
  flex: 1;
}

.full-page {
  height: 100vh;
  width: 100%;
}

/* TODO Replace custom css with bulma CSS helpers */
</style>