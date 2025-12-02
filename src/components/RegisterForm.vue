<template>
  <Card class="register-form">
    <template #title>
      <h2>Registro</h2>
    </template>
    <template #content>
      <form @submit.prevent="handleSubmit" class="form-container">
        <div class="field">
          <label for="firstName">Nombre</label>
          <InputText
            id="firstName"
            v-model="form.first_name"
            :class="{ 'p-invalid': errors.first_name }"
            placeholder="Ingresa tu nombre"
          />
          <small v-if="errors.first_name" class="p-error">{{ errors.first_name }}</small>
        </div>

        <div class="field">
          <label for="lastName">Apellido</label>
          <InputText
            id="lastName"
            v-model="form.last_name"
            :class="{ 'p-invalid': errors.last_name }"
            placeholder="Ingresa tu apellido"
          />
          <small v-if="errors.last_name" class="p-error">{{ errors.last_name }}</small>
        </div>

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

        <div class="field">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            :class="{ 'p-invalid': errors.confirmPassword }"
            placeholder="Confirma tu contraseña"
            :feedback="false"
            toggleMask
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <Button type="submit" label="Registrarse" :loading="loading" class="submit-button" />

        <div class="login-link">
          <span>¿Ya tienes cuenta? </span>
          <Button link label="Inicia sesión" @click="$emit('switchToLogin')" />
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

interface RegisterForm {
  first_name: string
  last_name: string
  email: string
  password: string
  confirmPassword: string
}

interface RegisterErrors {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const emit = defineEmits<{
  switchToLogin: []
  register: [data: Omit<RegisterForm, 'confirmPassword'>]
}>()

const form = reactive<RegisterForm>({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive<RegisterErrors>({})
const loading = ref(false)

const validateForm = (): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key as keyof RegisterErrors])

  if (!form.first_name.trim()) {
    errors.first_name = 'El nombre es requerido'
  }

  if (!form.last_name.trim()) {
    errors.last_name = 'El apellido es requerido'
  }

  if (!form.email.trim()) {
    errors.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email no es válido'
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
  } else if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
  }

  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const { confirmPassword, ...registerData } = form
    emit('register', registerData)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-form {
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

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.p-error {
  color: var(--red-500);
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
