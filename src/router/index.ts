import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import MyResumesView from '../views/MyResumesView.vue'
import ResumeDetailView from '../views/ResumeDetailView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import RegisterSuccessView from '../views/RegisterSuccessView.vue'

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
    {
      path: '/my-resumes',
      name: 'my-resumes',
      component: MyResumesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/resume/:id',
      name: 'resume-detail',
      component: ResumeDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView,
    },
    {
      path: '/register-success',
      name: 'register-success',
      component: RegisterSuccessView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/login'
    },
  ],
})

// Guard de navegación para rutas protegidas
router.beforeEach(async (to, from, next) => {
  console.log('Router guard - to:', to.name, to.path, to.query)
  console.log('All routes:', router.getRoutes().map(r => ({ name: r.name, path: r.path })))
  
  // Permitir acceso a rutas públicas sin verificación
  if (to.name === 'verify-email' || to.name === 'register-success') {
    console.log('Public route allowed:', to.name)
    next()
    return
  }

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
