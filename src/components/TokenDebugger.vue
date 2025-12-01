<template>
  <div class="token-debugger">
    <h3>Debug de Autenticación</h3>
    
    <div class="debug-section">
      <h4>Tokens en LocalStorage:</h4>
      <div class="token-item">
        <strong>Access Token:</strong>
        <pre v-if="accessToken">{{ accessToken }}</pre>
        <span v-else class="no-token">No encontrado</span>
      </div>
      <div class="token-item">
        <strong>Refresh Token:</strong>
        <pre v-if="refreshToken">{{ refreshToken }}</pre>
        <span v-else class="no-token">No encontrado</span>
      </div>
    </div>

    <div v-if="decodedToken" class="debug-section">
      <h4>Token Decodificado:</h4>
      <pre>{{ JSON.stringify(decodedToken, null, 2) }}</pre>
    </div>

    <div class="debug-section">
      <h4>Estado del Token:</h4>
      <p><strong>Válido:</strong> {{ isTokenValid ? 'Sí' : 'No' }}</p>
      <p v-if="decodedToken?.exp"><strong>Expira:</strong> {{ new Date(decodedToken.exp * 1000).toLocaleString() }}</p>
      <p v-if="decodedToken?.iat"><strong>Emitido:</strong> {{ new Date(decodedToken.iat * 1000).toLocaleString() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const accessToken = ref<string | null>(null)
const refreshToken = ref<string | null>(null)
const decodedToken = ref<any>(null)

const isTokenValid = computed(() => {
  if (!decodedToken.value?.exp) return false
  const now = Math.floor(Date.now() / 1000)
  return decodedToken.value.exp > now
})

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decodificando token:', error)
    return null
  }
}

const loadTokens = () => {
  accessToken.value = localStorage.getItem('authToken')
  refreshToken.value = localStorage.getItem('refreshToken')
  
  if (accessToken.value) {
    decodedToken.value = decodeJWT(accessToken.value)
  }
}

onMounted(() => {
  loadTokens()
})

defineExpose({
  loadTokens
})
</script>

<style scoped>
.token-debugger {
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  background: #f8f9fa;
}

.debug-section {
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.token-item {
  margin: 0.5rem 0;
}

.no-token {
  color: #dc3545;
  font-style: italic;
}

pre {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  max-height: 200px;
  overflow-y: auto;
}

h3 {
  color: #007bff;
  margin-top: 0;
}

h4 {
  color: #495057;
  margin: 0.5rem 0;
}
</style>