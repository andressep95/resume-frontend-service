<template>
  <aside :class="['sidebar', { expanded: isExpanded }]" @mouseenter="expand" @mouseleave="collapse">
    <!-- Logo / Header -->
    <div class="sidebar-header">
      <i class="pi pi-shield logo-icon"></i>
      <span v-show="isExpanded" class="logo-text">CV Processor</span>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-item"
        :class="{ active: isActive(item.path) }"
        :title="!isExpanded ? item.label : ''"
      >
        <i :class="['menu-icon', item.icon]"></i>
        <span v-show="isExpanded" class="menu-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- User Section -->
    <div class="sidebar-footer">
      <div class="user-info">
        <Avatar :label="userInitials" shape="circle" size="normal" />
        <div v-show="isExpanded" class="user-details">
          <span class="user-name">{{ username }}</span>
          <span class="user-email">{{ email }}</span>
        </div>
      </div>
      <Button
        icon="pi pi-sign-out"
        severity="danger"
        :label="isExpanded ? 'Salir' : ''"
        @click="handleLogout"
        class="logout-btn"
        :title="!isExpanded ? 'Salir' : ''"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { decodeJWT } from '../utils/auth'

const router = useRouter()
const route = useRoute()

const emit = defineEmits<{
  (e: 'update:expanded', value: boolean): void
}>()

const isExpanded = ref(false)

// Emitir cuando cambia el estado de expansión
watch(isExpanded, (newValue) => {
  emit('update:expanded', newValue)
})

const menuItems = [
  {
    label: 'Procesar CV',
    icon: 'pi pi-home',
    path: '/'
  },
  {
    label: 'Mis CVs',
    icon: 'pi pi-database',
    path: '/my-resumes'
  }
]

const username = computed(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    const decoded = decodeJWT(token)
    return decoded?.email?.split('@')[0] || 'Usuario'
  }
  return 'Usuario'
})

const email = computed(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    const decoded = decodeJWT(token)
    return decoded?.email || 'usuario@ejemplo.com'
  }
  return 'usuario@ejemplo.com'
})

const userInitials = computed(() => {
  const name = username.value || 'U'
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const isActive = (path: string) => {
  return route.path === path
}

const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
}

const handleLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>

<style scoped>
/* TIPOGRAFÍA GLOBAL */
.sidebar,
.logo-text,
.menu-label,
.user-name,
.user-email {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* SIDEBAR PRINCIPAL */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: var(--surface-0);
  box-shadow: var(--shadow-2);
  display: flex;
  flex-direction: column;
  width: 70px;
  transition: width 0.3s ease;
  z-index: 1000;
  overflow: hidden;
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  border: 1px solid var(--surface-border);
  border-left: none;
}

.sidebar.expanded {
  width: 220px;
}

/* HEADER */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.1rem;
  border-bottom: 1px solid var(--surface-border);
  min-height: 70px;
}

.logo-icon {
  font-size: 1.75rem;
  color: var(--primary-color);
  min-width: 1.75rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
}

/* NAVIGATION */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: var(--border-radius);
  color: var(--text-color-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.sidebar-item:hover {
  background-color: var(--surface-100);
  color: var(--text-color);
}

.sidebar-item.active {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  box-shadow: var(--shadow-3);
}

.sidebar-item.active .menu-icon {
  color: var(--primary-color-text);
}

.sidebar-item.active .menu-label {
  color: var(--primary-color-text);
}

.menu-icon {
  font-size: 1.25rem;
  min-width: 1.25rem;
  color: var(--text-color-secondary);
  transition: color 0.2s ease;
}

.sidebar-item:hover .menu-icon {
  color: var(--text-color);
}

.sidebar-item.active:hover .menu-icon {
  color: var(--primary-color-text);
}

.menu-label {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  color: var(--text-color-secondary);
}

.sidebar-item:hover .menu-label {
  color: var(--text-color);
}

/* FOOTER */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--surface-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
}

.user-info :deep(.p-avatar) {
  flex-shrink: 0;
  width: 2.25rem !important;
  height: 2.25rem !important;
  background-color: var(--primary-color) !important;
  color: var(--primary-color-text) !important;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  justify-content: center;
}

/* SCROLLBAR */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--surface-300);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--surface-400);
}
</style>