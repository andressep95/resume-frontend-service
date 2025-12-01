<template>
  <div class="layout-wrapper">
    <!-- Desktop Sidebar -->
    <div class="desktop-sidebar">
      <div class="sidebar-header">
        <h3>CV Processor</h3>
      </div>
      
      <Menu :model="menuItems" class="sidebar-menu" />
      
      <div class="sidebar-footer">
        <Button
          icon="pi pi-sign-out"
          label="Cerrar Sesión"
          severity="secondary"
          @click="logout"
          class="logout-button"
        />
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
      <Toolbar class="layout-toolbar">
        <template #start>
          <Button
            icon="pi pi-bars"
            severity="secondary"
            text
            @click="sidebarVisible = true"
            class="menu-toggle"
          />
          <h2 class="page-title">{{ pageTitle }}</h2>
        </template>
        
        <template #end>
          <Button
            icon="pi pi-sign-out"
            label="Cerrar Sesión"
            severity="secondary"
            @click="logout"
            class="desktop-logout"
          />
        </template>
      </Toolbar>

      <div class="layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from 'primevue/sidebar'
import Menu from 'primevue/menu'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()
const sidebarVisible = ref(false)

const menuItems = ref([
  {
    label: 'Procesar CV',
    icon: 'pi pi-upload',
    command: () => {
      router.push('/')
      sidebarVisible.value = false
    }
  },
  {
    label: 'Mis CVs',
    icon: 'pi pi-list',
    command: () => {
      router.push('/my-resumes')
      sidebarVisible.value = false
    }
  }
])

const pageTitle = computed(() => {
  switch (route.name) {
    case 'home':
      return 'Procesar CV'
    case 'my-resumes':
      return 'Mis CVs'
    case 'resume-detail':
      return 'Detalle del CV'
    default:
      return 'CV Processor'
  }
})

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
  width: 280px;
  background: var(--surface-card);
  border-right: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.mobile-sidebar {
  width: 280px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.sidebar-header h3 {
  margin: 0;
  color: var(--primary-color);
}

.sidebar-menu {
  border: none;
  width: 100%;
  flex: 1;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--surface-border);
  margin-top: auto;
}

.logout-button {
  width: 100%;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.layout-toolbar {
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
}

.menu-toggle {
  margin-right: 1rem;
}

.page-title {
  margin: 0;
  color: var(--text-color);
}

.desktop-logout {
  display: none;
}

.layout-content {
  flex: 1;
  padding: 2rem;
  background: var(--surface-ground);
}

@media (min-width: 768px) {
  .desktop-sidebar {
    display: flex;
  }
  
  .mobile-sidebar {
    display: none;
  }
  
  .menu-toggle {
    display: none;
  }
  
  .desktop-logout {
    display: inline-flex;
  }
}

@media (max-width: 767px) {
  .desktop-sidebar {
    display: none;
  }
  
  .mobile-sidebar {
    display: block;
  }
}
</style>