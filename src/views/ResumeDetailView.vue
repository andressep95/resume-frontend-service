<template>
  <div class="resume-detail-view">
    <div class="detail-header">
      <Button
        icon="pi pi-arrow-left"
        label="Volver"
        severity="secondary"
        @click="$router.push('/my-resumes')"
        class="back-button"
      />
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Cargando detalles del CV...</p>
    </div>

    <div v-else-if="resume" class="resume-content">
      <Card class="resume-info-card">
        <template #title>
          <div class="resume-header">
            <h2>{{ resume.filename || 'CV Sin Nombre' }}</h2>
            <Tag
              :value="getStatusLabel(resume.status)"
              :severity="getStatusSeverity(resume.status)"
              class="status-tag"
            />
          </div>
        </template>
        
        <template #content>
          <div class="resume-metadata">
            <div class="metadata-grid">
              <div class="metadata-item">
                <label>ID de Solicitud:</label>
                <span class="monospace">{{ resume.id }}</span>
              </div>
              <div class="metadata-item">
                <label>Idioma:</label>
                <span>{{ getLanguageLabel(resume.language) }}</span>
              </div>
              <div class="metadata-item">
                <label>Fecha de Procesamiento:</label>
                <span>{{ formatDate(resume.created_at) }}</span>
              </div>
              <div class="metadata-item" v-if="resume.instructions">
                <label>Instrucciones:</label>
                <span>{{ resume.instructions }}</span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="resume.extracted_data" class="extracted-data-card">
        <template #title>
          <h3>Datos Extraídos</h3>
        </template>
        
        <template #content>
          <TabView class="data-tabs">
            <TabPanel value="0" header="Información Personal">
              <div class="personal-info">
                <div class="info-grid">
                  <div class="info-item" v-if="resume.extracted_data.personal_info?.name">
                    <label>Nombre:</label>
                    <span>{{ resume.extracted_data.personal_info.name }}</span>
                  </div>
                  <div class="info-item" v-if="resume.extracted_data.personal_info?.email">
                    <label>Email:</label>
                    <span>{{ resume.extracted_data.personal_info.email }}</span>
                  </div>
                  <div class="info-item" v-if="resume.extracted_data.personal_info?.phone">
                    <label>Teléfono:</label>
                    <span>{{ resume.extracted_data.personal_info.phone }}</span>
                  </div>
                  <div class="info-item" v-if="resume.extracted_data.personal_info?.location">
                    <label>Ubicación:</label>
                    <span>{{ resume.extracted_data.personal_info.location }}</span>
                  </div>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="1" header="Experiencia Laboral">
              <div class="experience-section">
                <div v-if="resume.extracted_data.work_experience?.length" class="experience-list">
                  <Card v-for="(exp, index) in resume.extracted_data.work_experience" :key="index" class="experience-card">
                    <template #content>
                      <div class="experience-item">
                        <h4>{{ exp.position || 'Posición no especificada' }}</h4>
                        <p class="company">{{ exp.company || 'Empresa no especificada' }}</p>
                        <p class="period" v-if="exp.start_date || exp.end_date">
                          {{ exp.start_date || 'Fecha inicio no especificada' }} - 
                          {{ exp.end_date || 'Presente' }}
                        </p>
                        <p class="description" v-if="exp.description">{{ exp.description }}</p>
                      </div>
                    </template>
                  </Card>
                </div>
                <div v-else class="no-data">
                  <p>No se encontró información de experiencia laboral</p>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="2" header="Educación">
              <div class="education-section">
                <div v-if="resume.extracted_data.education?.length" class="education-list">
                  <Card v-for="(edu, index) in resume.extracted_data.education" :key="index" class="education-card">
                    <template #content>
                      <div class="education-item">
                        <h4>{{ edu.degree || 'Título no especificado' }}</h4>
                        <p class="institution">{{ edu.institution || 'Institución no especificada' }}</p>
                        <p class="period" v-if="edu.start_date || edu.end_date">
                          {{ edu.start_date || 'Fecha inicio no especificada' }} - 
                          {{ edu.end_date || 'Presente' }}
                        </p>
                      </div>
                    </template>
                  </Card>
                </div>
                <div v-else class="no-data">
                  <p>No se encontró información educativa</p>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="3" header="Habilidades">
              <div class="skills-section">
                <div v-if="resume.extracted_data.skills?.length" class="skills-list">
                  <Chip
                    v-for="(skill, index) in resume.extracted_data.skills"
                    :key="index"
                    :label="skill"
                    class="skill-chip"
                  />
                </div>
                <div v-else class="no-data">
                  <p>No se encontraron habilidades</p>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="4" header="Datos Completos">
              <div class="raw-data">
                <pre>{{ JSON.stringify(resume.extracted_data, null, 2) }}</pre>
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>

    <div v-else-if="!loading" class="error-state">
      <Card>
        <template #content>
          <div class="error-content">
            <i class="pi pi-exclamation-triangle error-icon"></i>
            <h3>CV no encontrado</h3>
            <p>No se pudo cargar la información del CV solicitado.</p>
            <Button
              label="Volver a Mis CVs"
              @click="$router.push('/my-resumes')"
            />
          </div>
        </template>
      </Card>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Chip from 'primevue/chip'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const resume = ref<any>(null)
const loading = ref(false)

const loadResumeDetail = async () => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/login')
    return
  }
  
  const requestId = route.params.id
  if (!requestId) {
    router.push('/my-resumes')
    return
  }
  
  loading.value = true
  try {
    const apiUrl = import.meta.env.VITE_RESUME_API_URL || 'https://api.cloudcentinel.com/resume/api/v1/resume'
    const response = await fetch(`${apiUrl}/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      resume.value = await response.json()
    } else if (response.status === 404) {
      toast.add({
        severity: 'error',
        summary: 'No encontrado',
        detail: 'El CV solicitado no existe',
        life: 5000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar el detalle del CV',
        life: 5000
      })
    }
  } catch (error) {
    console.error('Error loading resume detail:', error)
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

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'pending': 'Pendiente',
    'processing': 'Procesando',
    'completed': 'Completado',
    'failed': 'Fallido'
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    'pending': 'warning',
    'processing': 'info',
    'completed': 'success',
    'failed': 'danger'
  }
  return severities[status] || 'secondary'
}

const getLanguageLabel = (language: string) => {
  const labels: Record<string, string> = {
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadResumeDetail()
})
</script>

<style scoped>
.resume-detail-view {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 2rem;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-container p {
  margin-top: 1rem;
  color: var(--text-color-secondary);
}

.resume-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.resume-header h2 {
  margin: 0;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item label {
  font-weight: 600;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.monospace {
  font-family: monospace;
  font-size: 0.9rem;
}

.data-tabs {
  margin-top: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.experience-list,
.education-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.experience-card,
.education-card {
  border-left: 4px solid var(--primary-color);
}

.experience-item h4,
.education-item h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.company,
.institution {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.period {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.description {
  margin: 0;
  line-height: 1.5;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-chip {
  background: var(--primary-50);
  color: var(--primary-700);
}

.raw-data pre {
  background: var(--surface-50);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  max-height: 500px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--red-500);
  margin-bottom: 1rem;
}

.error-content h3 {
  margin: 1rem 0 0.5rem 0;
}

.error-content p {
  margin-bottom: 1.5rem;
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .resume-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .metadata-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>