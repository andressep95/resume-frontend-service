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
      <div class="harvard-cv-full">
        <div class="cv-container">
          <!-- Header -->
          <div class="cv-header">
            <h1 class="cv-name editable-field" @click="openEditModal('name', editableData.name, 'Nombre')">
              {{ editableData.name || 'Nombre no disponible' }}
            </h1>
            <div class="cv-contact">
              <span v-if="editableData.email" class="editable-field" @click="openEditModal('email', editableData.email, 'Email')">
                {{ editableData.email }}
              </span>
              <span v-if="editableData.phone" class="editable-field" @click="openEditModal('phone', editableData.phone, 'Teléfono')">
                 • {{ editableData.phone }}
              </span>
              <span v-if="editableData.address" class="editable-field" @click="openEditModal('address', editableData.address, 'Dirección')">
                 • {{ editableData.address }}
              </span>
            </div>
          </div>

          <!-- Education -->
          <div v-if="resume.structured_data?.education?.length" class="cv-section">
            <h2 class="cv-section-title">Educación</h2>
            <div class="cv-divider"></div>
            <div v-for="(edu, index) in resume.structured_data.education" :key="index" class="cv-education">
              <div class="cv-edu-header">
                <div class="cv-edu-left">
                  <h3 class="editable-field" @click="openEditModal(`education_${index}_institution`, edu.institution, 'Institución')">{{ edu.institution || 'Institución no especificada' }}</h3>
                  <h4 class="editable-field" @click="openEditModal(`education_${index}_degree`, edu.degree, 'Título')">{{ edu.degree || 'Título no especificado' }}</h4>
                </div>
                <div class="cv-edu-right editable-field" @click="openEditModal(`education_${index}_period`, edu.period?.end, 'Fecha')">
                  {{ edu.period?.end || 'Presente' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Technical Skills -->
          <div v-if="resume.structured_data?.technicalSkills?.skills?.length" class="cv-section">
            <h2 class="cv-section-title">Habilidades Técnicas</h2>
            <div class="cv-divider"></div>
            <div class="cv-skills-grid">
              <span v-for="(skill, index) in resume.structured_data.technicalSkills.skills" :key="index" class="cv-skill-item editable-field" @click="openEditModal(`skill_${index}`, skill, 'Habilidad')">
                • {{ skill }}
              </span>
            </div>
          </div>

          <!-- Professional Experience -->
          <div v-if="resume.structured_data?.professionalExperience?.length" class="cv-section">
            <h2 class="cv-section-title">Experiencia Profesional</h2>
            <div class="cv-divider"></div>
            <div v-for="(exp, index) in resume.structured_data.professionalExperience" :key="index" class="cv-experience">
              <div class="cv-exp-header">
                <div class="cv-exp-left">
                  <h3 class="editable-field" @click="openEditModal(`experience_${index}_position`, exp.position, 'Posición')">{{ exp.position || 'Posición no especificada' }}</h3>
                </div>
                <div class="cv-exp-right editable-field" @click="openEditModal(`experience_${index}_period`, `${exp.period?.start} - ${exp.period?.end}`, 'Período')">
                  {{ exp.period?.start || 'Fecha inicio' }} - {{ exp.period?.end || 'Presente' }}
                </div>
              </div>
              <ul v-if="exp.responsibilities?.length" class="cv-responsibilities">
                <li v-for="(resp, i) in exp.responsibilities" :key="i" class="editable-field" @click="openEditModal(`experience_${index}_resp_${i}`, resp, 'Responsabilidad')">{{ resp }}</li>
              </ul>
              <div class="cv-company editable-field" @click="openEditModal(`experience_${index}_company`, exp.company, 'Empresa')">{{ exp.company || 'Empresa no especificada' }}</div>
            </div>
          </div>

          <!-- Certifications -->
          <div v-if="resume.structured_data?.certifications?.length" class="cv-section">
            <h2 class="cv-section-title">Certificaciones</h2>
            <div class="cv-divider"></div>
            <div v-for="(cert, index) in resume.structured_data.certifications" :key="index" class="cv-certification">
              <div class="cv-cert-header">
                <div class="cv-cert-left">
                  <h3 class="editable-field" @click="openEditModal(`certification_${index}_name`, cert.name, 'Certificación')">{{ cert.name || 'Certificación' }}</h3>
                  <span v-if="cert.issuer" class="cv-cert-issuer editable-field" @click="openEditModal(`certification_${index}_issuer`, cert.issuer, 'Emisor')">{{ cert.issuer }}</span>
                </div>
                <div class="cv-cert-right editable-field" @click="openEditModal(`certification_${index}_date`, cert.date, 'Fecha')">
                  {{ cert.date || 'Fecha no especificada' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Projects -->
          <div v-if="resume.structured_data?.projects?.length" class="cv-section">
            <h2 class="cv-section-title">Proyectos</h2>
            <div class="cv-divider"></div>
            <div v-for="(project, index) in resume.structured_data.projects" :key="index" class="cv-project">
              <h3 class="editable-field" @click="openEditModal(`project_${index}_name`, project.name, 'Nombre del Proyecto')">{{ project.name || 'Proyecto' }}</h3>
              <p v-if="project.description" class="cv-project-description editable-field" @click="openEditModal(`project_${index}_description`, project.description, 'Descripción del Proyecto')">{{ project.description }}</p>
              <p v-if="project.technologies" class="cv-project-tech editable-field" @click="openEditModal(`project_${index}_technologies`, project.technologies, 'Tecnologías')">Technologies: {{ project.technologies }}</p>
            </div>
          </div>

          <!-- Languages -->
          <div v-if="resume.structured_data?.languages?.length" class="cv-section">
            <h2 class="cv-section-title">Idiomas</h2>
            <div class="cv-divider"></div>
            <div class="cv-languages">
              <div v-for="(lang, index) in resume.structured_data.languages" :key="index" class="cv-language">
                <strong class="editable-field" @click="openEditModal(`language_${index}_name`, lang.language, 'Idioma')">{{ lang.language || 'Idioma' }}</strong>
                <span v-if="lang.proficiency" class="editable-field" @click="openEditModal(`language_${index}_proficiency`, lang.proficiency, 'Nivel de Dominio')"> - {{ lang.proficiency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

    <!-- Edit Modal -->
    <Dialog 
      v-model:visible="showEditModal" 
      :header="`Editar ${currentFieldLabel}`" 
      modal 
      :style="{ width: '400px' }"
    >
      <div class="edit-modal-content">
        <label :for="currentField">{{ currentFieldLabel }}</label>
        <InputText 
          v-if="!isTextarea"
          :id="currentField"
          v-model="currentValue" 
          class="edit-input"
          @keyup.enter="saveEdit"
        />
        <Textarea 
          v-else
          :id="currentField"
          v-model="currentValue" 
          rows="3"
          class="edit-input"
        />
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="closeEditModal" />
        <Button label="Guardar" @click="saveEdit" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
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
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const resume = ref<any>(null)
const loading = ref(false)
const showEditModal = ref(false)
const currentField = ref('')
const currentFieldLabel = ref('')
const currentValue = ref('')
const isTextarea = ref(false)
const editableData = reactive({
  name: '',
  email: '',
  phone: '',
  address: ''
})

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
      // Populate editable data
      editableData.name = resume.value.structured_data?.header?.name || ''
      editableData.email = resume.value.structured_data?.header?.contact?.email || ''
      editableData.phone = resume.value.structured_data?.header?.contact?.phone || ''
      editableData.address = resume.value.structured_data?.header?.contact?.address || ''
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

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const openEditModal = (field: string, value: string, label: string) => {
  currentField.value = field
  currentFieldLabel.value = label
  currentValue.value = value || ''
  isTextarea.value = field.includes('resp') || field.includes('description')
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  currentField.value = ''
  currentValue.value = ''
}

const saveEdit = () => {
  // Update the editable data based on field
  if (currentField.value === 'name') {
    editableData.name = currentValue.value
  } else if (currentField.value === 'email') {
    editableData.email = currentValue.value
  } else if (currentField.value === 'phone') {
    editableData.phone = currentValue.value
  } else if (currentField.value === 'address') {
    editableData.address = currentValue.value
  }
  // Here you would normally send the update to the backend
  closeEditModal()
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

/* Harvard CV Full View Styles */
.harvard-cv-full {
  background: white;
  min-height: 100vh;
}

.cv-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Times New Roman', serif;
  line-height: 1.4;
  color: #000;
  font-size: 11pt;
}

.cv-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.cv-name {
  font-size: 18pt;
  font-weight: bold;
  margin: 0 0 0.3rem 0;
  color: #000;
}

.cv-contact {
  font-size: 11pt;
  color: #000;
}

.cv-section {
  margin-bottom: 1.5rem;
}

.cv-section-title {
  font-size: 12pt;
  font-weight: bold;
  color: #000;
  margin: 0 0 0.2rem 0;
}

.cv-divider {
  border-bottom: 1px solid #000;
  margin-bottom: 0.8rem;
  width: 100%;
}

/* Education */
.cv-education {
  margin-bottom: 0.8rem;
}

.cv-edu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.cv-edu-left h3 {
  font-size: 11pt;
  font-weight: bold;
  margin: 0;
  color: #000;
}

.cv-edu-left h4 {
  font-size: 11pt;
  font-weight: normal;
  margin: 0;
  color: #000;
}

.cv-edu-right {
  font-size: 11pt;
  color: #000;
  white-space: nowrap;
}

/* Skills */
.cv-skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem 1rem;
  font-size: 11pt;
}

.cv-skill-item {
  color: #000;
}

/* Experience */
.cv-experience {
  margin-bottom: 1.2rem;
}

.cv-exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.3rem;
}

.cv-exp-left h3 {
  font-size: 11pt;
  font-weight: bold;
  margin: 0;
  color: #000;
}

.cv-exp-right {
  font-size: 11pt;
  color: #000;
  white-space: nowrap;
}

.cv-responsibilities {
  margin: 0.3rem 0 0.5rem 1rem;
  padding: 0;
  font-size: 11pt;
}

.cv-responsibilities li {
  margin-bottom: 0.2rem;
  text-align: justify;
  color: #000;
}

.cv-company {
  font-size: 11pt;
  font-style: italic;
  color: #000;
  margin-top: 0.3rem;
}

/* Certifications */
.cv-certification {
  margin-bottom: 0.8rem;
}

.cv-cert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.cv-cert-left h3 {
  font-size: 11pt;
  font-weight: bold;
  margin: 0;
  color: #000;
}

.cv-cert-issuer {
  font-size: 11pt;
  color: #000;
  margin-top: 0.1rem;
}

.cv-cert-right {
  font-size: 11pt;
  color: #000;
  white-space: nowrap;
}

/* Projects */
.cv-project {
  margin-bottom: 1rem;
}

.cv-project h3 {
  font-size: 11pt;
  font-weight: bold;
  margin: 0 0 0.2rem 0;
  color: #000;
}

.cv-project-description {
  font-size: 11pt;
  margin: 0.2rem 0;
  text-align: justify;
  color: #000;
}

.cv-project-tech {
  font-size: 11pt;
  margin: 0.2rem 0;
  color: #000;
  font-style: italic;
}

/* Languages */
.cv-languages {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.3rem;
}

.cv-language {
  font-size: 11pt;
  color: #000;
}

/* Editable Fields */
.editable-field {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 3px;
  position: relative;
}

.editable-field:hover {
  background-color: rgba(16, 185, 129, 0.1);
  transform: scale(1.02);
}

.editable-field:hover::after {
  content: '✏️';
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 10px;
  opacity: 0.7;
}

/* Edit Modal */
.edit-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-modal-content label {
  font-weight: 600;
  color: var(--text-color);
}

.edit-input {
  width: 100%;
}

@media print {
  .cv-container {
    padding: 1rem;
    font-size: 10pt;
  }
  
  .cv-name {
    font-size: 16pt;
  }
  
  .cv-section-title {
    font-size: 11pt;
  }
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
  
  .cv-container {
    padding: 1rem;
  }
  
  .cv-name {
    font-size: 2rem;
  }
  
  .cv-contact {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .cv-exp-header,
  .cv-edu-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cv-exp-period,
  .cv-edu-period {
    margin-top: 0.3rem;
  }
}
</style>