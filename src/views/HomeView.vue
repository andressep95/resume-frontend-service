<template>
  <div class="home-view">
    <h1>Dashboard - Prueba de Conexión</h1>
    
    <TokenDebugger ref="debuggerRef" />
    
    <div class="actions">
      <button @click="testConnection" class="test-btn">Probar Conexión API</button>
      <button @click="refreshTokenAction" class="refresh-btn">Refrescar Token</button>
      <button @click="logout" class="logout-btn">Cerrar Sesión</button>
    </div>
    
    <div v-if="apiResponse" class="api-response">
      <h3>Respuesta de la API:</h3>
      <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      <h3>Error:</h3>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TokenDebugger from '../components/TokenDebugger.vue'

const router = useRouter()
const debuggerRef = ref()
const apiResponse = ref<any>(null)
const errorMessage = ref('')

// Verificar autenticación básica
const checkAuth = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/login')
  }
}

// Probar conexión con la API
const testConnection = async () => {
  const token = localStorage.getItem('authToken')
  errorMessage.value = ''
  apiResponse.value = null
  
  if (!token) {
    errorMessage.value = 'No hay token disponible'
    return
  }
  
  try {
    const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'https://auth.cloudcentinel.com/api/v1/auth'
    
    // Intentar diferentes endpoints para probar la conexión
    const endpoints = ['/me', '/profile', '/user']
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Probando endpoint: ${apiUrl}${endpoint}`)
        const response = await fetch(`${apiUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.text()
        console.log(`Respuesta de ${endpoint}:`, { status: response.status, data })
        
        if (response.ok) {
          apiResponse.value = {
            endpoint,
            status: response.status,
            data: JSON.parse(data)
          }
          return
        }
      } catch (endpointError) {
        console.log(`Error en ${endpoint}:`, endpointError)
      }
    }
    
    errorMessage.value = 'No se pudo conectar con ningún endpoint de usuario'
  } catch (error) {
    console.error('Error general:', error)
    errorMessage.value = `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
  }
}

// Refrescar token
const refreshTokenAction = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken')
  
  if (!refreshTokenValue) {
    router.push('/login')
    return
  }
  
  try {
    const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'https://auth.cloudcentinel.com/api/v1/auth'
    const response = await fetch(`${apiUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshTokenValue })
    })
    
    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('authToken', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token)
      }
      // Recargar el debugger
      if (debuggerRef.value) {
        debuggerRef.value.loadTokens()
      }
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('Error refrescando token:', error)
    router.push('/login')
  }
}

// Logout
const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.home-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.actions {
  margin: 2rem 0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.test-btn, .refresh-btn, .logout-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.test-btn {
  background: #28a745;
  color: white;
}

.refresh-btn {
  background: #007bff;
  color: white;
}

.logout-btn {
  background: #dc3545;
  color: white;
}

.api-response, .error-message {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 4px;
}

.api-response {
  border: 1px solid #28a745;
  background: #f8fff9;
}

.error-message {
  border: 1px solid #dc3545;
  background: #fff8f8;
  color: #dc3545;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  max-height: 400px;
  overflow-y: auto;
}
</style>
