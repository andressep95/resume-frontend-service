<template>
  <div class="my-resumes-view">
    <Card>
      <template #title>
        <div class="card-header">
          <h3>Mis CVs Procesados</h3>
          <Button
            icon="pi pi-refresh"
            label="Actualizar"
            @click="loadResumes"
            :loading="loading"
          />
        </div>
      </template>
      
      <template #content>
        <DataTable
          :value="resumes"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          class="resumes-table"
        >
          <Column field="id" header="ID" sortable>
            <template #body="{ data }">
              <span class="resume-id">{{ data.id.substring(0, 8) }}...</span>
            </template>
          </Column>
          
          <Column field="filename" header="Archivo" sortable>
            <template #body="{ data }">
              <div class="filename-cell">
                <i class="pi pi-file-pdf" v-if="data.filename?.endsWith('.pdf')"></i>
                <i class="pi pi-file-word" v-else-if="data.filename?.endsWith('.docx')"></i>
                <i class="pi pi-file" v-else></i>
                <span>{{ data.filename || 'Sin nombre' }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="status" header="Estado" sortable>
            <template #body="{ data }">
              <Tag
                :value="getStatusLabel(data.status)"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>
          
          <Column field="language" header="Idioma" sortable>
            <template #body="{ data }">
              <span class="language-badge">{{ getLanguageLabel(data.language) }}</span>
            </template>
          </Column>
          
          <Column field="created_at" header="Fecha" sortable>
            <template #body="{ data }">
              <span>{{ formatDate(data.created_at) }}</span>
            </template>
          </Column>
          
          <Column header="Acciones">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-eye"
                  severity="info"
                  text
                  @click="viewDetails(data.id)"
                  v-tooltip="'Ver detalles'"
                />
                <Button
                  icon="pi pi-download"
                  severity="success"
                  text
                  @click="downloadResume(data.id)"
                  v-tooltip="'Descargar'"
                  :disabled="data.status !== 'completed'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
        
        <div v-if="!loading && resumes.length === 0" class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <h4>No hay CVs procesados</h4>
          <p>Sube tu primer CV para comenzar</p>
          <Button
            label="Procesar CV"
            icon="pi pi-upload"
            @click="$router.push('/')"
          />
        </div>
      </template>
    </Card>
    
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'

const router = useRouter()
const toast = useToast()
const resumes = ref([])
const loading = ref(false)

const loadResumes = async () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    const apiUrl = import.meta.env.VITE_RESUME_API_URL || 'https://api.cloudcentinel.com/resume/api/v1/resume'
    const response = await fetch(`${apiUrl}/my-resumes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      resumes.value = data.resumes || []
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los CVs',
        life: 5000
      })
    }
  } catch (error) {
    console.error('Error loading resumes:', error)
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

const viewDetails = (id: string) => {
  router.push(`/resume/${id}`)
}

const downloadResume = (id: string) => {
  // Implementar descarga
  toast.add({
    severity: 'info',
    summary: 'Información',
    detail: 'Función de descarga en desarrollo',
    life: 3000
  })
}

const getStatusLabel = (status: string) => {
  const labels = {
    'pending': 'Pendiente',
    'processing': 'Procesando',
    'completed': 'Completado',
    'failed': 'Fallido'
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string) => {
  const severities = {
    'pending': 'warning',
    'processing': 'info',
    'completed': 'success',
    'failed': 'danger'
  }
  return severities[status] || 'secondary'
}

const getLanguageLabel = (language: string) => {
  const labels = {
    'es': 'Español',
    'en': 'English',
    'pt': 'Português',
    'fr': 'Français'
  }
  return labels[language] || language
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadResumes()
})
</script>

<style scoped>
.my-resumes-view {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
}

.resumes-table {
  margin-top: 1rem;
}

.resume-id {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.filename-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filename-cell i {
  color: var(--primary-color);
}

.language-badge {
  padding: 0.25rem 0.5rem;
  background: var(--surface-100);
  border-radius: 4px;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color-secondary);
}

.empty-icon {
  font-size: 3rem;
  color: var(--surface-400);
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--text-color);
}

.empty-state p {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>