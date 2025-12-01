<template>
  <div class="home-view">
    <ResumeUploadForm @upload="handleUpload" />
    
    <div v-if="uploadResponse" class="upload-response">
      <h3>Resultado:</h3>
      <pre>{{ JSON.stringify(uploadResponse, null, 2) }}</pre>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      <h3>Error:</h3>
      <p>{{ errorMessage }}</p>
    </div>
    
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import ResumeUploadForm from '../components/ResumeUploadForm.vue'
import Toast from 'primevue/toast'

const router = useRouter()
const toast = useToast()
const uploadResponse = ref<any>(null)
const errorMessage = ref('')

// Verificar autenticación básica
const checkAuth = () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/login')
    return
  }
  
  // Verificar si el token sigue siendo válido
  import('../utils/auth').then(({ isTokenValid, clearAuthAndRedirect }) => {
    if (!isTokenValid(token)) {
      clearAuthAndRedirect()
    }
  })
}

// Manejar upload de CV
const handleUpload = async (data: { file: File; language: string; instructions: string }) => {
  const token = localStorage.getItem('authToken')
  errorMessage.value = ''
  uploadResponse.value = null
  
  if (!token) {
    errorMessage.value = 'No hay token de autenticación'
    return
  }
  
  try {
    const apiUrl = import.meta.env.VITE_RESUME_API_URL || 'https://api.cloudcentinel.com/resume/api/v1/resume'
    
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('language', data.language)
    if (data.instructions) {
      formData.append('instructions', data.instructions)
    }
    
    console.log('📤 Enviando CV:', {
      fileName: data.file.name,
      fileSize: data.file.size,
      language: data.language,
      instructions: data.instructions
    })
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    console.log('📡 Respuesta HTTP status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      uploadResponse.value = result
      
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'CV enviado para procesamiento',
        life: 5000
      })
    } else {
      const error = await response.json()
      errorMessage.value = error.message || 'Error al procesar CV'
      
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al procesar CV',
        life: 5000
      })
    }
  } catch (error) {
    console.error('❌ Error en upload:', error)
    errorMessage.value = `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error de conexión. Intenta nuevamente.',
      life: 5000
    })
  }
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



.upload-response, .error-message {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 4px;
}

.upload-response {
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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
