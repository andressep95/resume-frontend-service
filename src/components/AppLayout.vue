<template>
  <div class="layout-wrapper">
    <!-- Desktop Sidebar -->
    <div class="desktop-sidebar" :class="{ 'expanded': isHovered }" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <div class="sidebar-header">
        <i class="pi pi-bars sidebar-icon" v-if="!isHovered"></i>
        <h3 v-if="isHovered">CV Processor</h3>
      </div>
      
      <div class="sidebar-menu">
        <div 
          v-for="item in menuItems" 
          :key="item.label"
          class="menu-item"
          @click="item.command"
          :class="{ 'active': isActiveRoute(item.route) }"
        >
          <i :class="item.icon" class="menu-icon"></i>
          <span v-if="isHovered" class="menu-label">{{ item.label }}</span>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <div class="menu-item logout-item" @click="logout">
          <i class="pi pi-sign-out menu-icon"></i>
          <span v-if="isHovered" class="menu-label">Cerrar Sesión</span>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar -->
    <Sidebar v-model:visible="sidebarVisible" class="mobile-sidebar">
      <template #header>
        <div class="sidebar-header">
          <h3>CV Processor</h3>
        </div>
      </template>
      
      <Menu :model="menuItems" class="sidebar-menu" />
      
      <template #footer>
        <div class="sidebar-footer">
          <Button
            icon="pi pi-sign-out"
            label="Cerrar Sesión"
            severity="secondary"
            @click="logout"
            class="logout-button"
          />
        </div>
      </template>
    </Sidebar>

    <div class="layout-main">
      <Button
        icon="pi pi-bars"
        severity="secondary"
        text
        @click="sidebarVisible = true"
        class="mobile-menu-toggle"
      />
      
      <div class="layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from 'primevue/sidebar'
import Menu from 'primevue/menu'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()
const sidebarVisible = ref(false)
const isHovered = ref(false)

const menuItems = ref([
  {
    label: 'Procesar CV',
    icon: 'pi pi-upload',
    route: '/',
    command: () => {
      router.push('/')
      sidebarVisible.value = false
    }
  },
  {
    label: 'Mis CVs',
    icon: 'pi pi-list',
    route: '/my-resumes',
    command: () => {
      router.push('/my-resumes')
      sidebarVisible.value = false
    }
  }
])

const isActiveRoute = (routePath: string) => {
  return route.path === routePath
}

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.desktop-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 60px;
  height: 100vh;
  background: var(--surface-card);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.desktop-sidebar.expanded {
  width: 200px;
}

.mobile-sidebar {
  width: 280px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}

.sidebar-icon {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.sidebar-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.1rem;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0;
  margin: 0.25rem 0.5rem;
}

.menu-item:hover {
  background: var(--surface-100);
}

.menu-item.active {
  background: var(--primary-50);
  color: var(--primary-color);
  border-left: 3px solid var(--primary-color);
}

.menu-icon {
  font-size: 1.1rem;
  min-width: 20px;
  text-align: center;
}

.menu-label {
  margin-left: 0.75rem;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sidebar-footer {
  border-top: 1px solid var(--surface-border);
  padding: 0.5rem 0;
}

.logout-item {
  color: var(--red-500);
}

.logout-item:hover {
  background: var(--red-50);
}

.layout-main {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
}

.mobile-menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  display: none;
}

.layout-content {
  padding: 2rem;
  background: var(--surface-ground);
  min-height: 100vh;
}

@media (min-width: 768px) {
  .desktop-sidebar {
    display: flex;
  }
  
  .mobile-sidebar {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: none;
  }
}

@media (max-width: 767px) {
  .desktop-sidebar {
    display: none;
  }
  
  .mobile-sidebar {
    display: block;
  }
  
  .mobile-menu-toggle {
    display: inline-flex;
  }
  
  .layout-main {
    margin-left: 0;
  }
}
</style>