<template>
  <div class="resume-detail-view">
    <div class="detail-header">
      <div class="header-left">
        <Button
          icon="pi pi-arrow-left"
          label="Volver"
          severity="secondary"
          @click="$router.push('/my-resumes')"
          class="back-button"
        />
      </div>
      <div class="header-right" v-if="resume">
        <Tag 
          :value="`Versión ${currentVersionNumber || 1}`" 
          severity="info" 
          class="version-tag"
        />
        <Button
          icon="pi pi-history"
          label="Ver Versiones"
          severity="secondary"
          @click="loadVersions"
          :loading="loadingVersions"
          class="versions-button"
        />
      </div>
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
                <div class="cv-cert-right editable-field" @click="openEditModal(`certification_${index}_date`, cert.dateObtained, 'Fecha')">
                  {{ cert.dateObtained || 'Fecha no especificada' }}
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

    <!-- Versions Dialog -->
    <Dialog 
      v-model:visible="showVersionsDialog" 
      header="Historial de Versiones" 
      modal 
      :style="{ width: isMobile ? '95vw' : '700px' }"
      class="versions-dialog"
    >
      <!-- Desktop Table -->
      <DataTable 
        v-if="!isMobile"
        :value="versions" 
        :loading="loadingVersions"
        class="versions-table"
      >
        <Column field="version_number" header="Versión" sortable>
          <template #body="{ data }">
            <Tag 
              :value="`v${data.version_number}`" 
              :severity="data.is_active ? 'success' : 'secondary'"
            />
          </template>
        </Column>
        <Column field="version_name" header="Nombre" sortable />
        <Column field="created_by" header="Creado por" sortable>
          <template #body="{ data }">
            <Tag 
              :value="data.created_by === 'system' ? 'Sistema' : 'Usuario'" 
              :severity="data.created_by === 'system' ? 'info' : 'warning'"
            />
          </template>
        </Column>
        <Column field="created_at" header="Fecha" sortable>
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
        </Column>
        <Column header="Acciones">
          <template #body="{ data }">
            <div class="version-actions">
              <Button
                icon="pi pi-eye"
                severity="info"
                text
                @click="viewVersion(data.id)"
                v-tooltip="'Ver versión'"
              />
              <Button
                v-if="!data.is_active"
                icon="pi pi-check"
                severity="success"
                text
                @click="activateVersion(data.id)"
                v-tooltip="'Activar versión'"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Mobile Cards -->
      <div v-else class="versions-mobile">
        <div v-if="loadingVersions" class="loading-versions">
          <ProgressSpinner size="small" />
          <span>Cargando versiones...</span>
        </div>
        <div v-else-if="versions.length === 0" class="no-versions">
          <i class="pi pi-info-circle"></i>
          <span>No hay versiones disponibles</span>
        </div>
        <div v-else class="version-cards">
          <Card v-for="version in versions" :key="version.id" class="version-card">
            <template #content>
              <div class="version-card-header">
                <div class="version-info">
                  <Tag 
                    :value="`v${version.version_number}`" 
                    :severity="version.is_active ? 'success' : 'secondary'"
                    class="version-number"
                  />
                  <h4 class="version-name">{{ version.version_name || 'Sin nombre' }}</h4>
                </div>
                <div class="version-actions-mobile">
                  <Button
                    icon="pi pi-eye"
                    severity="info"
                    size="small"
                    @click="viewVersion(version.id)"
                    v-tooltip="'Ver versión'"
                  />
                  <Button
                    v-if="!version.is_active"
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    @click="activateVersion(version.id)"
                    v-tooltip="'Activar versión'"
                  />
                </div>
              </div>
              <div class="version-meta">
                <div class="meta-item">
                  <span class="meta-label">Creado por:</span>
                  <Tag 
                    :value="version.created_by === 'system' ? 'Sistema' : 'Usuario'" 
                    :severity="version.created_by === 'system' ? 'info' : 'warning'"
                    size="small"
                  />
                </div>
                <div class="meta-item">
                  <span class="meta-label">Fecha:</span>
                  <span class="meta-value">{{ formatDate(version.created_at) }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { resumeApi } from '../services/resumeApi'

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
const loadingVersions = ref(false)
const showVersionsDialog = ref(false)
const versions = ref<any[]>([])
const currentVersionNumber = ref<number>(1)
const editableData = reactive({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const isMobile = computed(() => {
  return window.innerWidth <= 768
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
    console.log('🔄 Cargando detalle del CV con ID:', requestId)
    resume.value = await resumeApi.getResumeDetail(requestId as string)
    console.log('✅ Respuesta del detalle del CV:', resume.value)
    
    // Populate editable data
    editableData.name = resume.value.structured_data?.header?.name || ''
    editableData.email = resume.value.structured_data?.header?.contact?.email || ''
    editableData.phone = resume.value.structured_data?.header?.contact?.phone || ''
    editableData.address = resume.value.structured_data?.header?.contact?.address || ''
    
    console.log('📝 Datos editables poblados:', editableData)
  } catch (error) {
    console.error('❌ Error loading resume detail:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'Error al cargar el detalle del CV',
      life: 8000
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

const saveEdit = async () => {
  // Clone current structured data
  let updatedStructuredData = JSON.parse(JSON.stringify(resume.value.structured_data))
  
  // Update based on field type
  const field = currentField.value
  const value = currentValue.value
  
  if (field === 'name') {
    editableData.name = value
    updatedStructuredData.header = updatedStructuredData.header || {}
    updatedStructuredData.header.name = value
  } else if (field === 'email') {
    editableData.email = value
    updatedStructuredData.header = updatedStructuredData.header || {}
    updatedStructuredData.header.contact = updatedStructuredData.header.contact || {}
    updatedStructuredData.header.contact.email = value
  } else if (field === 'phone') {
    editableData.phone = value
    updatedStructuredData.header = updatedStructuredData.header || {}
    updatedStructuredData.header.contact = updatedStructuredData.header.contact || {}
    updatedStructuredData.header.contact.phone = value
  } else if (field === 'address') {
    editableData.address = value
    updatedStructuredData.header = updatedStructuredData.header || {}
    updatedStructuredData.header.contact = updatedStructuredData.header.contact || {}
    updatedStructuredData.header.contact.address = value
  } else if (field.startsWith('skill_')) {
    const parts = field.split('_')
    const index = parseInt(parts[1] || '0')
    updatedStructuredData.technicalSkills = updatedStructuredData.technicalSkills || { skills: [] }
    updatedStructuredData.technicalSkills.skills[index] = value
  } else if (field.startsWith('experience_')) {
    const parts = field.split('_')
    const expIndex = parseInt(parts[1] || '0')
    const fieldType = parts[2]
    
    if (!fieldType) return
    
    updatedStructuredData.professionalExperience = updatedStructuredData.professionalExperience || []
    if (fieldType === 'position') {
      updatedStructuredData.professionalExperience[expIndex].position = value
    } else if (fieldType === 'company') {
      updatedStructuredData.professionalExperience[expIndex].company = value
    } else if (fieldType.startsWith('resp')) {
      const respIndex = parseInt(parts[3] || '0')
      updatedStructuredData.professionalExperience[expIndex].responsibilities[respIndex] = value
    }
  } else if (field.startsWith('education_')) {
    const parts = field.split('_')
    const eduIndex = parseInt(parts[1] || '0')
    const fieldType = parts[2]
    
    if (!fieldType) return
    
    updatedStructuredData.education = updatedStructuredData.education || []
    if (fieldType === 'institution') {
      updatedStructuredData.education[eduIndex].institution = value
    } else if (fieldType === 'degree') {
      updatedStructuredData.education[eduIndex].degree = value
    }
  } else if (field.startsWith('certification_')) {
    const parts = field.split('_')
    const certIndex = parseInt(parts[1] || '0')
    const fieldType = parts[2]
    
    if (!fieldType) return
    
    updatedStructuredData.certifications = updatedStructuredData.certifications || []
    if (fieldType === 'name') {
      updatedStructuredData.certifications[certIndex].name = value
    } else if (fieldType === 'issuer') {
      updatedStructuredData.certifications[certIndex].issuer = value
    }
  }
  
  // Create new version with updated data
  try {
    console.log('🔄 Creando nueva versión con datos:', updatedStructuredData)
    
    const versionData = {
      structured_data: updatedStructuredData,
      version_name: `Edición de ${currentFieldLabel.value}`
    }
    
    await resumeApi.createVersion(route.params.id as string, updatedStructuredData, `Edición de ${currentFieldLabel.value}`)
    
    // Update local data
    resume.value.structured_data = updatedStructuredData
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Nueva versión creada correctamente',
      life: 3000
    })
    
    // Reload resume to get updated version info
    await loadResumeDetail()
  } catch (error) {
    console.error('❌ Error creating version:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'Error al guardar los cambios',
      life: 5000
    })
  }
  
  closeEditModal()
}

const loadVersions = async () => {
  if (!route.params.id) return
  
  loadingVersions.value = true
  try {
    const response = await resumeApi.getResumeVersions(route.params.id as string)
    versions.value = response.versions || []
    showVersionsDialog.value = true
  } catch (error) {
    console.error('Error loading versions:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar las versiones',
      life: 5000
    })
  } finally {
    loadingVersions.value = false
  }
}

const viewVersion = async (versionId: number) => {
  try {
    const versionData = await resumeApi.getVersionDetail(versionId)
    // Update the current view with version data
    resume.value = {
      ...resume.value,
      structured_data: versionData.structured_data
    }
    
    // Update editable data
    editableData.name = versionData.structured_data?.header?.name || ''
    editableData.email = versionData.structured_data?.header?.contact?.email || ''
    editableData.phone = versionData.structured_data?.header?.contact?.phone || ''
    editableData.address = versionData.structured_data?.header?.contact?.address || ''
    
    currentVersionNumber.value = versionData.version_number
    showVersionsDialog.value = false
    
    toast.add({
      severity: 'info',
      summary: 'Versión cargada',
      detail: `Mostrando versión ${versionData.version_number}`,
      life: 3000
    })
  } catch (error) {
    console.error('Error viewing version:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar la versión',
      life: 5000
    })
  }
}

const activateVersion = async (versionId: number) => {
  if (!route.params.id) return
  
  try {
    await resumeApi.activateVersion(route.params.id as string, versionId)
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Versión activada correctamente',
      life: 3000
    })
    
    // Reload versions and resume
    await Promise.all([
      loadVersions(),
      loadResumeDetail()
    ])
  } catch (error) {
    console.error('Error activating version:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al activar la versión',
      life: 5000
    })
  }
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

/* Version Management */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.version-tag {
  font-weight: 600;
}

.versions-table {
  margin-top: 1rem;
}

.version-actions {
  display: flex;
  gap: 0.5rem;
}

/* Mobile Versions Styles */
.versions-dialog .p-dialog-content {
  padding: 1rem;
}

.versions-mobile {
  max-height: 60vh;
  overflow-y: auto;
}

.loading-versions,
.no-versions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.version-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.version-card {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.version-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.version-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.version-info {
  flex: 1;
}

.version-number {
  margin-bottom: 0.5rem;
}

.version-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.version-actions-mobile {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.version-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.meta-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.meta-value {
  font-size: 0.875rem;
  color: var(--text-color);
  text-align: right;
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
  
  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: space-between;
  }
  
  .versions-button {
    font-size: 0.875rem;
  }
}
</style>