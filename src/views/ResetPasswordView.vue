<template>
  <div class="reset-password-view">
    <Card class="reset-card">
      <template #content>
        <div class="reset-content">
          <i class="pi pi-key reset-icon"></i>
          <h2>Resetear contraseña</h2>
          <p>Ingresa tu nueva contraseña.</p>
          
          <form @submit.prevent="handleResetPassword" class="reset-form">
            <div class="form-group">
              <Password
                v-model="password"
                placeholder="Nueva contraseña"
                :class="{ 'p-invalid': errors.password }"
                toggleMask
                :feedback="false"
              />
              <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
            </div>

            <div class="form-group">
              <Password
                v-model="confirmPassword"
                placeholder="Confirmar contraseña"
                :class="{ 'p-invalid': errors.confirmPassword }"
                toggleMask
                :feedback="false"
              />
              <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
            </div>

            <Button
              type="submit"
              label="Resetear contraseña"
              :loading="loading"
              class="reset-button"
            />
          </form>

          <div class="back-to-login">
            <router-link to="/login">← Volver al login</router-link>
          </div>
        </div>
      </template>
    </Card>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref({
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  errors.value = { password: '', confirmPassword: '' }
  let isValid = true
  
  if (!password.value) {
    errors.value.password = 'La contraseña es requerida'
    isValid = false
  } else if (password.value.length < 8) {
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }
  
  return isValid
}

const handleResetPassword = async () => {
  if (!validateForm()) return
  
  const token = route.query.token as string
  if (!token) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Token de reset inválido',
      life: 5000
    })
    return
  }
  
  loading.value = true
  
  try {
    const response = await fetch('https://auth.cloudcentinel.com/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        new_password: password.value
      })
    })
    
    if (response.ok) {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Contraseña reseteada correctamente',
        life: 5000
      })
      router.push('/login')
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      console.error('Reset password error:', errorData)
      const isExpiredToken = errorData.error?.includes('expired') || errorData.message?.includes('expired')
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: isExpiredToken 
          ? 'El enlace ha expirado. Solicita uno nuevo desde "Olvidé mi contraseña"'
          : errorData.message || errorData.error || 'Error al resetear la contraseña',
        life: 8000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error de conexión',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const token = route.query.token as string
  if (!token) {
    router.push('/login')
  }
})
</script>

<style scoped>
.reset-password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.reset-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.reset-content {
  text-align: center;
  padding: 2rem;
}

.reset-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.reset-content h2 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.reset-content p {
  margin: 0 0 2rem 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reset-button {
  width: 100%;
}

.back-to-login {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-border);
}

.back-to-login a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.back-to-login a:hover {
  text-decoration: underline;
}

/* Fix Password component eye icon positioning */
:deep(.p-password) {
  position: relative;
  width: 100%;
}

:deep(.p-password .p-inputtext) {
  width: 100%;
  padding-right: 3rem;
}

:deep(.p-password .p-password-toggle-mask) {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-secondary);
  cursor: pointer;
  z-index: 1;
}

:deep(.p-password .p-password-toggle-mask:hover) {
  color: var(--primary-color);
}
</style>