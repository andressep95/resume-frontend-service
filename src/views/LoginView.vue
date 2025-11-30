<template>
  <div class="login-view">
    <div class="auth-container">
      <div class="auth-forms">
        <LoginForm
          v-if="currentForm === 'login'"
          @login="handleLogin"
          @switch-to-register="currentForm = 'register'"
        />

        <RegisterForm v-else @register="handleRegister" @switch-to-login="currentForm = 'login'" />
      </div>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Toast from 'primevue/toast'

type FormType = 'login' | 'register'

interface LoginData {
  email: string
  password: string
  app_id: string
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
}

const router = useRouter()
const toast = useToast()
const currentForm = ref<FormType>('login')

const handleLogin = async (data: LoginData) => {
  try {
    const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'https://auth.cloudcentinel.com/api/v1/auth'
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()

      // Guardar token en localStorage o store
      localStorage.setItem('authToken', result.token)

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Inicio de sesión exitoso',
        life: 3000,
      })

      // Redirigir a la página principal
      router.push('/')
    } else {
      const error = await response.json()
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al iniciar sesión',
        life: 5000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error de conexión. Intenta nuevamente.',
      life: 5000,
    })
  }
}

const handleRegister = async (data: RegisterData) => {
  try {
    const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'https://auth.cloudcentinel.com/api/v1/auth'
    const response = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Registro exitoso. Ahora puedes iniciar sesión.',
        life: 5000,
      })

      // Cambiar al formulario de login
      currentForm.value = 'login'
    } else {
      const error = await response.json()
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al registrarse',
        life: 5000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error de conexión. Intenta nuevamente.',
      life: 5000,
    })
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  padding: 2rem;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 500px;
}

.auth-forms {
  width: 100%;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .login-view {
    padding: 1rem;
  }

  .auth-header h1 {
    font-size: 1.5rem;
  }
}
</style>
