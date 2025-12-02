<template>
  <div class="verify-email-view">
    <Card class="verify-card">
      <template #content>
        <div class="verify-content">
          <div v-if="loading" class="loading-state">
            <ProgressSpinner />
            <h3>Verificando tu email...</h3>
            <p>Por favor espera mientras verificamos tu cuenta.</p>
          </div>

          <div v-else-if="verified" class="success-state">
            <i class="pi pi-check-circle success-icon"></i>
            <h3>¡Cuenta activada!</h3>
            <p>Tu cuenta ha sido verificada exitosamente.</p>
            <p class="sub-text">Ya puedes iniciar sesión con tu email y contraseña.</p>
            <Button 
              label="Iniciar Sesión" 
              @click="$router.push('/login')"
              class="action-button"
            />
          </div>

          <div v-else class="error-state">
            <i class="pi pi-times-circle error-icon"></i>
            <h3>Error de verificación</h3>
            <p>{{ errorMessage }}</p>
            <Button 
              label="Volver al Login" 
              severity="secondary"
              @click="$router.push('/login')"
              class="action-button"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const verified = ref(false)
const errorMessage = ref('')

const verifyEmail = async () => {
  const token = route.query.token as string
  
  if (!token) {
    errorMessage.value = 'Token de verificación no válido'
    loading.value = false
    return
  }

  try {
    const response = await fetch(`https://auth.cloudcentinel.com/api/v1/auth/verify-email/${token}`)
    
    if (response.ok) {
      verified.value = true
    } else {
      const errorData = await response.json()
      errorMessage.value = errorData.message || 'Token inválido o expirado'
    }
  } catch (error) {
    errorMessage.value = 'Error de conexión. Inténtalo más tarde.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<style scoped>
.verify-email-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.verify-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.verify-content {
  text-align: center;
  padding: 2rem;
}

.loading-state,
.success-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-icon {
  font-size: 4rem;
  color: var(--green-500);
}

.error-icon {
  font-size: 4rem;
  color: var(--red-500);
}

.verify-content h3 {
  margin: 0;
  color: var(--text-color);
}

.verify-content p {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.sub-text {
  font-size: 0.9rem;
  margin-top: 0.5rem !important;
}

.action-button {
  margin-top: 1rem;
}
</style>