import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import MyResumesView from '../views/MyResumesView.vue'
import ResumeDetailView from '../views/ResumeDetailView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import RegisterSuccessView from '../views/RegisterSuccessView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'

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
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
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
  // Permitir acceso a rutas públicas sin verificación
  const publicRoutes = ['verify-email', 'register-success', 'forgot-password', 'reset-password']
  if (publicRoutes.includes(to.name as string)) {
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
