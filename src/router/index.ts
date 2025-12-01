import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
  ],
})

// Guard de navegación para rutas protegidas
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('authToken')

  if (to.meta.requiresAuth) {
    if (!token) {
      next('/login')
      return
    }
    
    // Verificar si el token es válido
    const { isTokenValid, clearAuthAndRedirect } = await import('../utils/auth')
    if (!isTokenValid(token)) {
      clearAuthAndRedirect()
      return
    }
  }
  
  if (to.name === 'login' && token) {
    const { isTokenValid } = await import('../utils/auth')
    if (isTokenValid(token)) {
      next('/')
      return
    }
  }
  
  next()
})

export default router
