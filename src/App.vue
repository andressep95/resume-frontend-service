<template>
  <div class="app-container">
    <!-- Mobile Overlay -->
    <div 
      v-if="isAuthenticated && isMobile && isMobileSidebarOpen" 
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <!-- Mobile Hamburger Button -->
    <Button
      v-if="isAuthenticated && isMobile"
      icon="pi pi-bars"
      class="mobile-menu-btn"
      @click="toggleMobileSidebar"
      severity="secondary"
    />

    <!-- Sidebar -->
    <Sidebar
      v-if="isAuthenticated"
      :is-mobile-open="isMobileSidebarOpen"
      @update:expanded="handleSidebarExpanded"
    />

    <!-- Contenido principal -->
    <main
      :class="['main-content', { 'with-sidebar': isAuthenticated && !isMobile }]"
      :style="{ marginLeft: sidebarMargin }"
    >
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Sidebar from './components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const isSidebarExpanded = ref(false)
const isAuthenticated = ref(false)
const isMobileSidebarOpen = ref(false)
const isMobile = ref(false)

const sidebarMargin = computed(() => {
  if (!isAuthenticated.value || isMobile.value) return '0'
  return isSidebarExpanded.value ? '220px' : '70px'
})

const handleSidebarExpanded = (expanded: boolean) => {
  isSidebarExpanded.value = expanded
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

const checkAuth = () => {
  const token = localStorage.getItem('authToken')
  isAuthenticated.value = !!token
  
  console.log('Checking auth:', { token: !!token, path: route.path })
  
  const publicRoutes = ['/login', '/verify-email', '/register-success']
  const isPublicRoute = publicRoutes.some(route => route.path.startsWith(route))
  
  if (!token && !isPublicRoute) {
    router.push('/login')
  }
}

// Watcher para detectar cambios de ruta
watch(() => route.path, () => {
  checkAuth()
})

onMounted(() => {
  checkAuth()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  overflow-x: hidden;
  background-color: #f9fafb;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.main-content {
  min-height: 100vh;
  padding: 2rem;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
}

.main-content:not(.with-sidebar) {
  padding: 0;
}

/* Mobile Styles */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.mobile-menu-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10000;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
    margin-left: 0 !important;
    padding-bottom: 5rem;
  }
  
  .main-content:not(.with-sidebar) {
    padding: 0;
    padding-bottom: 5rem;
  }
}
</style>