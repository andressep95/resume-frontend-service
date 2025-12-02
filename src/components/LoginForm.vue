<template>
  <Card class="login-form">
    <template #title>
      <h2>Iniciar Sesión</h2>
    </template>
    <template #content>
      <form @submit.prevent="handleSubmit" class="form-container">
        <div class="field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            :class="{ 'p-invalid': errors.email }"
            placeholder="usuario@ejemplo.com"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <Password
            id="password"
            v-model="form.password"
            :class="{ 'p-invalid': errors.password }"
            placeholder="Ingresa tu contraseña"
            :feedback="false"
            toggleMask
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <Button type="submit" label="Iniciar Sesión" :loading="loading" class="submit-button" />

        <div class="forgot-password-link">
          <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
        </div>

        <div class="register-link">
          <span>¿No tienes cuenta? </span>
          <Button link label="Regístrate" @click="$emit('switchToRegister')" />
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

interface LoginForm {
  email: string
  password: string
}

interface LoginErrors {
  email?: string
  password?: string
}

const emit = defineEmits<{
  switchToRegister: []
  login: [data: LoginForm & { app_id: string }]
}>()

const form = reactive<LoginForm>({
  email: '',
  password: '',
})

const errors = reactive<LoginErrors>({})
const loading = ref(false)

const validateForm = (): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key as keyof LoginErrors])

  if (!form.email.trim()) {
    errors.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email no es válido'
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
  }

  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const appId = import.meta.env.VITE_APP_ID || '00000000-0000-0000-0000-000000000000'
    emit('login', {
      ...form,
      app_id: appId,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: var(--text-color);
}

.submit-button {
  margin-top: 1rem;
}

.forgot-password-link {
  text-align: center;
  margin-top: 0.5rem;
}

.forgot-password-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.p-error {
  color: var(--red-500);
}
</style>
