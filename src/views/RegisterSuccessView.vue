<template>
  <div class="register-success-view">
    <Card class="success-card">
      <template #content>
        <div class="success-content">
          <i class="pi pi-envelope success-icon"></i>
          <h2>¡Registro exitoso!</h2>
          <p>Hemos enviado un enlace de verificación a tu correo electrónico.</p>
          <p class="email-display">{{ email }}</p>
          <p class="instructions">Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
          
          <div class="actions">
            <Button 
              label="Ir al Login" 
              @click="$router.push('/login')"
              class="login-button"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()
const email = route.query.email as string

onMounted(() => {
  if (!email) {
    router.push('/login')
  }
})
</script>

<style scoped>
.register-success-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.success-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.success-content {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  font-size: 4rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.success-content h2 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.success-content p {
  margin: 0 0 1rem 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.email-display {
  font-weight: 600;
  color: var(--primary-color);
  background: var(--primary-50);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.instructions {
  font-size: 0.9rem;
  margin-bottom: 2rem !important;
}

.actions {
  margin-top: 2rem;
}

.login-button {
  width: 100%;
}
</style>