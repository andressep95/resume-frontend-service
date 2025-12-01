import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AppLayout from '../components/AppLayout.vue'
import HomeView from '../views/HomeView.vue'
import MyResumesView from '../views/MyResumesView.vue'
import ResumeDetailView from '../views/ResumeDetailView.vue'

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
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'my-resumes',
          name: 'my-resumes',
          component: MyResumesView,
        },
        {
          path: 'resume/:id',
          name: 'resume-detail',
          component: ResumeDetailView,
        },
      ],
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
