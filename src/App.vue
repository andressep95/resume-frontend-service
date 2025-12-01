<template>
  <div class="app-container">
    <!-- Sidebar fijo que siempre está visible -->
    <Sidebar
      v-if="isAuthenticated"
      @update:expanded="handleSidebarExpanded"
    />

    <!-- Contenido principal -->
    <main
      :class="['main-content', { 'with-sidebar': isAuthenticated }]"
      :style="{ marginLeft: sidebarMargin }"
    >
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const router = useRouter()
const isSidebarExpanded = ref(false)
const isAuthenticated = ref(false)

const sidebarMargin = computed(() => {
  if (!isAuthenticated.value) return '0'
  return isSidebarExpanded.value ? '220px' : '70px'
})

const handleSidebarExpanded = (expanded: boolean) => {
  isSidebarExpanded.value = expanded
}

const checkAuth = () => {
  const token = localStorage.getItem('authToken')
  isAuthenticated.value = !!token
  
  if (!token && router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
}

onMounted(() => {
  checkAuth()
  
  // Escuchar cambios en el localStorage para actualizar el estado de autenticación
  window.addEventListener('storage', checkAuth)
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
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
    margin-left: 0 !important;
  }
}
</style>