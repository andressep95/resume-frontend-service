<template>
  <div class="forgot-password-view">
    <Card class="forgot-card">
      <template #content>
        <div class="forgot-content">
          <i class="pi pi-lock forgot-icon"></i>
          <h2>¿Olvidaste tu contraseña?</h2>
          <p>Ingresa tu email y te enviaremos un enlace para resetear tu contraseña.</p>

          <form @submit.prevent="handleForgotPassword" class="forgot-form">
            <div class="form-group">
              <InputText
                v-model="email"
                type="email"
                placeholder="tu@email.com"
                :class="{ 'p-invalid': error }"
                class="email-input"
              />
              <small v-if="error" class="p-error">{{ error }}</small>
            </div>

            <Button type="submit" label="Enviar enlace" :loading="loading" class="send-button" />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const router = useRouter()
const toast = useToast()
const email = ref('')
const loading = ref(false)
const error = ref('')

const handleForgotPassword = async () => {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'El email es requerido'
    return
  }

  if (!/\S+@\S+\.\S+/.test(email.value)) {
    error.value = 'Email inválido'
    return
  }

  loading.value = true

  try {
    const appId = import.meta.env.VITE_APP_ID || '7057e69d-818b-45db-b39b-9d1c84aca142'
    const response = await fetch('https://auth.cloudcentinel.com/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        app_id: appId,
      }),
    })

    if (response.ok) {
      toast.add({
        severity: 'success',
        summary: 'Email enviado',
        detail: 'Si el email existe, recibirás un enlace para resetear tu contraseña',
        life: 5000,
      })
      router.push('/login')
    } else {
      const errorData = await response.json()
      error.value = errorData.message || 'Error al enviar el email'
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error de conexión',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.forgot-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.forgot-content {
  text-align: center;
  padding: 2rem;
}

.forgot-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.forgot-content h2 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.forgot-content p {
  margin: 0 0 2rem 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.email-input {
  width: 100%;
}

.send-button {
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
</style>
