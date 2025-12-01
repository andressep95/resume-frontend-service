<template>
  <aside :class="['sidebar', { expanded: isExpanded }]" @mouseenter="expand" @mouseleave="collapse">
    <!-- Logo / Header -->
    <div class="sidebar-header">
      <i class="pi pi-file logo-icon"></i>
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
    icon: 'pi pi-upload',
    path: '/'
  },
  {
    label: 'Mis CVs',
    icon: 'pi pi-list',
    path: '/my-resumes'
  }
]

const username = computed(() => 'Usuario')
const email = computed(() => 'usuario@ejemplo.com')

const userInitials = computed(() => {
  return 'U'
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
/* SIDEBAR PRINCIPAL */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 70px;
  transition: width 0.3s ease;
  z-index: 1000;
  overflow: hidden;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  border: 1px solid #e5e7eb;
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
  border-bottom: 1px solid #e5e7eb;
  min-height: 70px;
}

.logo-icon {
  font-size: 1.75rem;
  color: var(--green-600);
  min-width: 1.75rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--green-600);
  white-space: nowrap;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.sidebar.expanded .logo-text {
  opacity: 1;
  transform: translateX(0);
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
  border-radius: 0.65rem;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.sidebar-item:hover {
  background-color: #f3f4f6;
}

.sidebar-item.active {
  background-color: var(--green-600);
  color: #ffffff;
  box-shadow:
    0 4px 6px -1px rgba(34, 197, 94, 0.2),
    0 2px 4px -2px rgba(34, 197, 94, 0.2);
}

.sidebar-item.active .menu-icon {
  color: #ffffff;
}

.sidebar-item.active .menu-label {
  color: #ffffff;
}

.menu-icon {
  font-size: 1.25rem;
  min-width: 1.25rem;
  color: #6b7280;
  transition: color 0.2s ease;
}

.sidebar-item:hover .menu-icon {
  color: var(--green-600);
}

.sidebar-item.active:hover .menu-icon {
  color: #ffffff;
}

.menu-label {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  color: #4b5563;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.sidebar.expanded .menu-label {
  opacity: 1;
  transform: translateX(0);
}

/* FOOTER */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
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
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.sidebar.expanded .user-details {
  opacity: 1;
  transform: translateX(0);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  justify-content: center;
  transition: all 0.3s ease;
}

.sidebar:not(.expanded) .logout-btn {
  padding: 0.5rem;
}

.sidebar:not(.expanded) .logout-btn :deep(.p-button-label) {
  display: none;
}

/* SCROLLBAR */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>