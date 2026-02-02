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
        <Tag :value="`Versión ${currentVersionNumber || 1}`" severity="info" class="version-tag" />
        <Tag
          v-if="hasPendingChanges"
          value="Cambios sin guardar"
          severity="warning"
          icon="pi pi-exclamation-triangle"
          class="pending-changes-tag"
        />
        <Button
          v-if="hasPendingChanges"
          icon="pi pi-save"
          label="Guardar Cambios"
          severity="warning"
          @click="saveAllChanges"
          class="save-button pulse-animation"
        />
        <Button
          icon="pi pi-download"
          label="Descargar PDF"
          severity="success"
          @click="downloadPDF"
          :loading="downloadingPDF"
          class="download-button"
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
            <h1
              class="cv-name editable-field"
              @click="openEditModal('name', editableData.name, 'Nombre')"
            >
              {{ editableData.name || 'Nombre no disponible' }}
            </h1>
            <div class="cv-contact">
              <span
                v-if="editableData.email"
                class="editable-field"
                @click="openEditModal('email', editableData.email, 'Email')"
              >
                {{ editableData.email }}
              </span>
              <span
                v-if="editableData.phone"
                class="editable-field"
                @click="openEditModal('phone', editableData.phone, 'Teléfono')"
              >
                • {{ editableData.phone }}
              </span>
              <span
                v-if="editableData.address"
                class="editable-field"
                @click="openEditModal('address', editableData.address, 'Dirección')"
              >
                • {{ editableData.address }}
              </span>
            </div>
          </div>

          <!-- Education -->
          <div v-if="resume.structured_data?.education?.length" class="cv-section">
            <div class="cv-section-header">
              <h2 class="cv-section-title">Educación</h2>
              <Button
                icon="pi pi-plus"
                severity="secondary"
                text
                rounded
                size="small"
                @click="openAddDialog('education')"
                v-tooltip="'Agregar educación'"
                class="add-section-button"
              />
            </div>
            <div class="cv-divider"></div>
            <div
              v-for="(edu, index) in resume.structured_data.education"
              :key="index"
              class="cv-education atomic-block item-editable-wrapper"
              @click="openEditDialog('education', index)"
            >
              <div class="cv-edu-header">
                <div class="cv-edu-left">
                  <h3>{{ edu.institution || 'Institución no especificada' }}</h3>
                  <h4>{{ edu.degree || 'Título no especificado' }}</h4>
                </div>
                <div class="cv-edu-right">
                  {{ edu.graduationDate || 'Presente' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Technical Skills -->
          <div v-if="resume.structured_data?.technicalSkills?.skills?.length" class="cv-section">
            <div class="cv-section-header">
              <h2 class="cv-section-title">Habilidades Técnicas</h2>
              <Button
                icon="pi pi-plus"
                severity="secondary"
                text
                rounded
                size="small"
                @click="openAddDialog('skill')"
                v-tooltip="'Agregar habilidad'"
                class="add-section-button"
              />
            </div>
            <div class="cv-divider"></div>
            <div class="cv-skills-grid">
              <span
                v-for="(skill, index) in resume.structured_data.technicalSkills.skills"
                :key="index"
                class="cv-skill-item item-editable-wrapper"
                @click="openEditDialog('skill', index)"
              >
                • {{ skill }}
              </span>
            </div>
          </div>

          <!-- Professional Experience -->
          <div v-if="resume.structured_data?.professionalExperience?.length" class="cv-section">
            <div class="cv-section-header">
              <h2 class="cv-section-title">Experiencia Profesional</h2>
              <Button
                icon="pi pi-plus"
                severity="secondary"
                text
                rounded
                size="small"
                @click="openAddDialog('experience')"
                v-tooltip="'Agregar experiencia'"
                class="add-section-button"
              />
            </div>
            <div class="cv-divider"></div>
            <div
              v-for="(exp, index) in resume.structured_data.professionalExperience"
              :key="index"
              class="cv-experience atomic-block item-editable-wrapper"
              @click="openEditDialog('experience', index)"
            >
              <div class="cv-exp-header">
                <div class="cv-exp-left">
                  <h3>{{ exp.position || 'Posición no especificada' }}</h3>
                </div>
                <div class="cv-exp-right">
                  {{ exp.period?.start || 'Fecha inicio' }} - {{ exp.period?.end || 'Presente' }}
                </div>
              </div>
              <ul v-if="exp.responsibilities?.length" class="cv-responsibilities">
                <li v-for="(resp, i) in exp.responsibilities" :key="i">
                  {{ resp }}
                </li>
              </ul>
              <div class="cv-company">{{ exp.company || 'Empresa no especificada' }}</div>
            </div>
          </div>

          <!-- Certifications -->
          <div v-if="resume.structured_data?.certifications?.length" class="cv-section">
            <div class="cv-section-header">
              <h2 class="cv-section-title">Certificaciones</h2>
              <Button
                icon="pi pi-plus"
                severity="secondary"
                text
                rounded
                size="small"
                @click="openAddDialog('certification')"
                v-tooltip="'Agregar certificación'"
                class="add-section-button"
              />
            </div>
            <div class="cv-divider"></div>
            <div
              v-for="(cert, index) in resume.structured_data.certifications"
              :key="index"
              class="cv-certification atomic-block item-editable-wrapper"
              @click="openEditDialog('certification', index)"
            >
              <div class="cv-cert-header">
                <div class="cv-cert-left">
                  <h3>{{ cert.name || 'Certificación' }}</h3>
                  <span v-if="cert.issuer" class="cv-cert-issuer">{{ cert.issuer }}</span>
                </div>
                <div class="cv-cert-right">
                  {{ cert.dateObtained || 'Fecha no especificada' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Projects -->
          <div v-if="resume.structured_data?.projects?.length" class="cv-section">
            <div class="cv-section-header">
              <h2 class="cv-section-title">Proyectos</h2>
              <Button
                icon="pi pi-plus"
                severity="secondary"
                text
                rounded
                size="small"
                @click="openAddDialog('project')"
                v-tooltip="'Agregar proyecto'"
                class="add-section-button"
              />
            </div>
            <div class="cv-divider"></div>
            <div
              v-for="(project, index) in resume.structured_data.projects"
              :key="index"
              class="cv-project atomic-block item-editable-wrapper"
              @click="openEditDialog('project', index)"
            >
              <h3>{{ project.name || 'Proyecto' }}</h3>
              <p v-if="project.description" class="cv-project-description">
                {{ project.description }}
              </p>
              <p v-if="project.technologies" class="cv-project-tech">
                Technologies:
                {{
                  Array.isArray(project.technologies)
                    ? project.technologies.join(', ')
                    : project.technologies
                }}
              </p>
            </div>
          </div>

          <!-- Languages -->
          <div v-if="resume.structured_data?.languages?.length" class="cv-section">
            <h2 class="cv-section-title">Idiomas</h2>
            <div class="cv-divider"></div>
            <div class="cv-languages">
              <div
                v-for="(lang, index) in resume.structured_data.languages"
                :key="index"
                class="cv-language"
              >
                <strong
                  class="editable-field"
                  @click="openEditModal(`language_${index}_name`, lang.language, 'Idioma')"
                  >{{ lang.language || 'Idioma' }}</strong
                >
                <span
                  v-if="lang.proficiency"
                  class="editable-field"
                  @click="
                    openEditModal(
                      `language_${index}_proficiency`,
                      lang.proficiency,
                      'Nivel de Dominio',
                    )
                  "
                >
                  - {{ lang.proficiency }}</span
                >
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
            <Button label="Volver a Mis CVs" @click="$router.push('/my-resumes')" />
          </div>
        </template>
      </Card>
    </div>

    <!-- Edit Modal -->
    <Dialog
      v-model:visible="showEditModal"
      :header="`Editar ${currentFieldLabel}`"
      modal
      dismissableMask
      :style="{ width: '400px' }"
    >
      <div class="edit-modal-content">
        <label :for="currentField">{{ currentFieldLabel }}</label>
        <InputText
          v-if="!isTextarea"
          :id="currentField"
          v-model="currentValue"
          class="edit-input"
          :placeholder="
            currentField.includes('period')
              ? 'Ej: 10 2024 - 02 2025 o 10 2024 - Presente'
              : currentField.includes('technologies')
                ? 'Ej: Java, Spring Boot, Docker'
                : ''
          "
          @keyup.enter="saveEdit"
        />
        <Textarea
          v-else
          :id="currentField"
          v-model="currentValue"
          rows="3"
          class="edit-input"
          :placeholder="currentField.includes('description') ? 'Descripción del proyecto...' : ''"
        />
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="closeEditModal" />
        <Button label="Guardar" @click="saveEdit" />
      </template>
    </Dialog>

    <!-- Add/Edit Item Dialog -->
    <Dialog
      v-model:visible="showAddDialog"
      :header="
        isEditMode
          ? addDialogType === 'education'
            ? 'Editar Educación'
            : addDialogType === 'skill'
              ? 'Editar Habilidad'
              : addDialogType === 'experience'
                ? 'Editar Experiencia'
                : addDialogType === 'certification'
                  ? 'Editar Certificación'
                  : 'Editar Proyecto'
          : addDialogType === 'education'
            ? 'Agregar Educación'
            : addDialogType === 'skill'
              ? 'Agregar Habilidad'
              : addDialogType === 'experience'
                ? 'Agregar Experiencia'
                : addDialogType === 'certification'
                  ? 'Agregar Certificación'
                  : 'Agregar Proyecto'
      "
      modal
      dismissableMask
      :style="{
        width: addDialogType === 'experience' || addDialogType === 'project' ? '500px' : '400px',
      }"
    >
      <div class="add-modal-content">
        <!-- Education Fields -->
        <template v-if="addDialogType === 'education'">
          <div class="field">
            <label for="institution">Institución *</label>
            <InputText id="institution" v-model="newItemData.institution" class="w-full" />
          </div>
          <div class="field">
            <label for="degree">Título *</label>
            <InputText id="degree" v-model="newItemData.degree" class="w-full" />
          </div>
          <div class="field">
            <label>Fecha de Graduación</label>
            <div class="graduation-date-row">
              <Checkbox
                v-model="newItemData.isPresente"
                :binary="true"
                inputId="isPresente"
                @update:modelValue="onPresenteToggle"
              />
              <label for="isPresente" class="presente-checkbox-label">Presente (cursando actualmente)</label>
            </div>
            <DatePicker
              v-if="!newItemData.isPresente"
              v-model="newItemData.graduationDateRaw"
              view="month"
              dateFormat="mm/yy"
              :maxDate="new Date()"
              placeholder="Seleccione mes y año"
              class="w-full"
              showIcon
              :manualInput="false"
              @update:modelValue="onGraduationDateChange"
            />
          </div>
        </template>

        <!-- Skill Field -->
        <template v-if="addDialogType === 'skill'">
          <div class="field">
            <label for="skill">Habilidad *</label>
            <InputText id="skill" v-model="newItemData.skill" class="w-full" />
          </div>
        </template>

        <!-- Experience Fields -->
        <template v-if="addDialogType === 'experience'">
          <div class="field">
            <label for="position">Posición *</label>
            <InputText id="position" v-model="newItemData.position" class="w-full" />
          </div>
          <div class="field">
            <label for="company">Empresa *</label>
            <InputText id="company" v-model="newItemData.company" class="w-full" />
          </div>
          <div class="field-row field-row-aligned">
            <div class="field">
              <div class="label-row">
                <label>Inicio</label>
              </div>
              <DatePicker
                v-model="newItemData.periodStartRaw"
                view="month"
                dateFormat="mm/yy"
                :maxDate="new Date()"
                placeholder="Seleccione mes y año"
                class="w-full"
                showIcon
                :manualInput="false"
                @update:modelValue="onPeriodStartChange"
              />
            </div>
            <div class="field">
              <div class="label-row">
                <label>Fin</label>
                <div class="inline-checkbox">
                  <Checkbox
                    v-model="newItemData.isPeriodEndPresente"
                    :binary="true"
                    inputId="isPeriodEndPresente"
                    @update:modelValue="onPeriodEndPresenteToggle"
                  />
                  <label for="isPeriodEndPresente" class="presente-checkbox-label">Presente</label>
                </div>
              </div>
              <DatePicker
                v-if="!newItemData.isPeriodEndPresente"
                v-model="newItemData.periodEndRaw"
                view="month"
                dateFormat="mm/yy"
                :maxDate="new Date()"
                placeholder="Seleccione mes y año"
                class="w-full"
                showIcon
                :manualInput="false"
                @update:modelValue="onPeriodEndChange"
              />
            </div>
          </div>
          <div class="field">
            <div class="responsibilities-header">
              <label>Responsabilidades</label>
              <Button
                icon="pi pi-plus"
                label="Agregar"
                size="small"
                @click="addResponsibility"
                class="add-responsibility-btn"
              />
            </div>
            <div class="responsibilities-list">
              <div
                v-for="(resp, index) in responsibilities"
                :key="index"
                class="responsibility-item"
              >
                <InputText
                  v-model="responsibilities[index]"
                  placeholder="Descripción de la responsabilidad"
                  class="responsibility-input"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  @click="removeResponsibility(index)"
                  :disabled="responsibilities.length === 1"
                  class="remove-responsibility-btn"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Certification Fields -->
        <template v-if="addDialogType === 'certification'">
          <div class="field">
            <label for="certName">Nombre *</label>
            <InputText id="certName" v-model="newItemData.name" class="w-full" />
          </div>
          <div class="field">
            <label for="issuer">Emisor</label>
            <InputText id="issuer" v-model="newItemData.issuer" class="w-full" />
          </div>
          <div class="field">
            <label>Fecha de Obtención</label>
            <DatePicker
              v-model="newItemData.dateObtainedRaw"
              view="month"
              dateFormat="mm/yy"
              :maxDate="new Date()"
              placeholder="Seleccione mes y año"
              class="w-full"
              showIcon
              :manualInput="false"
              @update:modelValue="onDateObtainedChange"
            />
          </div>
        </template>

        <!-- Project Fields -->
        <template v-if="addDialogType === 'project'">
          <div class="field">
            <label for="projectName">Nombre *</label>
            <InputText id="projectName" v-model="newItemData.name" class="w-full" />
          </div>
          <div class="field">
            <label for="description">Descripción</label>
            <Textarea id="description" v-model="newItemData.description" rows="3" class="w-full" />
          </div>
          <div class="field">
            <label for="technologies">Tecnologías (separadas por comas)</label>
            <InputText
              id="technologies"
              v-model="newItemData.technologies"
              placeholder="Java, Spring Boot, Docker"
              class="w-full"
            />
          </div>
        </template>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <Button
              v-if="isEditMode"
              label="Eliminar"
              severity="danger"
              icon="pi pi-trash"
              @click="deleteItem"
            />
          </div>
          <div class="footer-right">
            <Button label="Cancelar" severity="secondary" @click="closeAddDialog" />
            <Button :label="isEditMode ? 'Actualizar' : 'Agregar'" @click="saveNewItem" />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Versions Dialog -->
    <Dialog
      v-model:visible="showVersionsDialog"
      header="Historial de Versiones"
      modal
      dismissableMask
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
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                @click="deleteVersion(data.id)"
                v-tooltip="'Eliminar versión'"
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
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    @click="deleteVersion(version.id)"
                    v-tooltip="'Eliminar versión'"
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
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
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
const downloadingPDF = ref(false)
const editableData = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
})
const hasPendingChanges = ref(false)
const pendingStructuredData = ref<any>(null)
const showAddDialog = ref(false)
const addDialogType = ref('')
const newItemData = reactive<any>({})
const isEditMode = ref(false)
const editingIndex = ref(-1)
const responsibilities = ref<string[]>([])

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

    // Initialize pending data with current structured data
    pendingStructuredData.value = JSON.parse(JSON.stringify(resume.value.structured_data))
    hasPendingChanges.value = false

    // Update current version number from active version
    if (resume.value.active_version) {
      currentVersionNumber.value = resume.value.active_version.version_number || 1
    } else {
      currentVersionNumber.value = 1
    }

    console.log('📝 Datos editables poblados:', editableData)
    console.log('📌 Versión actual:', currentVersionNumber.value)
  } catch (error) {
    console.error('❌ Error loading resume detail:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'Error al cargar el detalle del CV',
      life: 8000,
    })
  } finally {
    loading.value = false
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido',
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
  }
  return severities[status] || 'secondary'
}

const getLanguageLabel = (language: string) => {
  const labels: Record<string, string> = {
    es: 'Español',
    en: 'English',
    pt: 'Português',
    fr: 'Français',
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
    minute: '2-digit',
  })
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
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

const openAddDialog = (type: string) => {
  isEditMode.value = false
  editingIndex.value = -1
  addDialogType.value = type
  // Reset newItemData based on type
  switch (type) {
    case 'education':
      Object.assign(newItemData, { institution: '', degree: '', graduationDate: '', graduationDateRaw: null, isPresente: false })
      break
    case 'skill':
      Object.assign(newItemData, { skill: '' })
      break
    case 'experience':
      Object.assign(newItemData, {
        position: '',
        company: '',
        periodStart: '',
        periodEnd: '',
        periodStartRaw: null,
        periodEndRaw: null,
        isPeriodEndPresente: false,
      })
      responsibilities.value = ['']
      break
    case 'certification':
      Object.assign(newItemData, { name: '', issuer: '', dateObtained: '', dateObtainedRaw: null })
      break
    case 'project':
      Object.assign(newItemData, { name: '', description: '', technologies: '' })
      break
  }
  showAddDialog.value = true
}

const openEditDialog = (type: string, index: number) => {
  isEditMode.value = true
  editingIndex.value = index
  addDialogType.value = type

  // Load existing data based on type
  switch (type) {
    case 'education':
      const edu = pendingStructuredData.value.education[index]
      const isPresente = (edu.graduationDate || '').toLowerCase() === 'presente'
      Object.assign(newItemData, {
        institution: edu.institution || '',
        degree: edu.degree || '',
        graduationDate: edu.graduationDate || '',
        graduationDateRaw: isPresente ? null : parseGraduationDate(edu.graduationDate || ''),
        isPresente,
      })
      break
    case 'skill':
      const skill = pendingStructuredData.value.technicalSkills.skills[index]
      Object.assign(newItemData, { skill: skill || '' })
      break
    case 'experience':
      const exp = pendingStructuredData.value.professionalExperience[index]
      const isPeriodEndPresente = (exp.period?.end || '').toLowerCase() === 'presente'
      Object.assign(newItemData, {
        position: exp.position || '',
        company: exp.company || '',
        periodStart: exp.period?.start || '',
        periodEnd: exp.period?.end || '',
        periodStartRaw: parseGraduationDate(exp.period?.start || ''),
        periodEndRaw: isPeriodEndPresente ? null : parseGraduationDate(exp.period?.end || ''),
        isPeriodEndPresente,
      })
      responsibilities.value =
        exp.responsibilities && exp.responsibilities.length > 0 ? [...exp.responsibilities] : ['']
      break
    case 'certification':
      const cert = pendingStructuredData.value.certifications[index]
      Object.assign(newItemData, {
        name: cert.name || '',
        issuer: cert.issuer || '',
        dateObtained: cert.dateObtained || '',
        dateObtainedRaw: parseGraduationDate(cert.dateObtained || ''),
      })
      break
    case 'project':
      const proj = pendingStructuredData.value.projects[index]
      Object.assign(newItemData, {
        name: proj.name || '',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
      })
      break
  }
  showAddDialog.value = true
}

const closeAddDialog = () => {
  showAddDialog.value = false
  addDialogType.value = ''
  isEditMode.value = false
  editingIndex.value = -1
  responsibilities.value = []
  Object.keys(newItemData).forEach((key) => delete newItemData[key])
}

const onGraduationDateChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  const date = value instanceof Date ? value : null
  if (!date) {
    newItemData.graduationDate = ''
    return
  }
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  newItemData.graduationDate = `${month} ${year}`
}

const onPresenteToggle = (checked: boolean) => {
  if (checked) {
    newItemData.graduationDate = 'Presente'
    newItemData.graduationDateRaw = null
  } else {
    newItemData.graduationDate = ''
  }
}

const formatDateFromPicker = (value: Date | Date[] | (Date | null)[] | null | undefined): string => {
  const date = value instanceof Date ? value : null
  if (!date) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${month} ${date.getFullYear()}`
}

const onPeriodStartChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  newItemData.periodStart = formatDateFromPicker(value)
}

const onPeriodEndChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  newItemData.periodEnd = formatDateFromPicker(value)
}

const onPeriodEndPresenteToggle = (checked: boolean) => {
  if (checked) {
    newItemData.periodEnd = 'Presente'
    newItemData.periodEndRaw = null
  } else {
    newItemData.periodEnd = ''
  }
}

const onDateObtainedChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  newItemData.dateObtained = formatDateFromPicker(value)
}

const parseGraduationDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.toLowerCase() === 'presente') {
    return dateStr?.toLowerCase() === 'presente' ? new Date() : null
  }
  const parts = dateStr.trim().split(/\s+/)
  if (parts.length === 2) {
    const month = parseInt(parts[0]!) - 1
    const year = parseInt(parts[1]!)
    if (!isNaN(month) && !isNaN(year)) {
      return new Date(year, month, 1)
    }
  }
  return null
}

const addResponsibility = () => {
  responsibilities.value.push('')
}

const removeResponsibility = (index: number) => {
  if (responsibilities.value.length > 1) {
    responsibilities.value.splice(index, 1)
  }
}

const saveNewItem = () => {
  const type = addDialogType.value

  // Validate required fields
  if (type === 'education' && (!newItemData.institution || !newItemData.degree)) {
    toast.add({
      severity: 'error',
      summary: 'Campos Requeridos',
      detail: 'Institución y Título son campos obligatorios',
      life: 3000,
    })
    return
  }

  if (type === 'skill' && !newItemData.skill) {
    toast.add({
      severity: 'error',
      summary: 'Campo Requerido',
      detail: 'La habilidad es un campo obligatorio',
      life: 3000,
    })
    return
  }

  if (type === 'experience' && (!newItemData.position || !newItemData.company)) {
    toast.add({
      severity: 'error',
      summary: 'Campos Requeridos',
      detail: 'Posición y Empresa son campos obligatorios',
      life: 3000,
    })
    return
  }

  if (type === 'certification' && !newItemData.name) {
    toast.add({
      severity: 'error',
      summary: 'Campo Requerido',
      detail: 'El nombre de la certificación es obligatorio',
      life: 3000,
    })
    return
  }

  if (type === 'project' && !newItemData.name) {
    toast.add({
      severity: 'error',
      summary: 'Campo Requerido',
      detail: 'El nombre del proyecto es obligatorio',
      life: 3000,
    })
    return
  }

  // Edit or Add item to pending data
  if (isEditMode.value) {
    // Edit existing item
    switch (type) {
      case 'education':
        pendingStructuredData.value.education[editingIndex.value] = {
          institution: newItemData.institution,
          degree: newItemData.degree,
          graduationDate: newItemData.graduationDate || 'Presente',
        }
        break

      case 'skill':
        pendingStructuredData.value.technicalSkills.skills[editingIndex.value] = newItemData.skill
        break

      case 'experience':
        const filteredResponsibilities = responsibilities.value.filter((r: string) => r.trim())
        pendingStructuredData.value.professionalExperience[editingIndex.value] = {
          position: newItemData.position,
          company: newItemData.company,
          period: {
            start: newItemData.periodStart || 'Fecha inicio',
            end: newItemData.periodEnd || 'Presente',
          },
          responsibilities: filteredResponsibilities,
        }
        break

      case 'certification':
        pendingStructuredData.value.certifications[editingIndex.value] = {
          name: newItemData.name,
          issuer: newItemData.issuer || '',
          dateObtained: newItemData.dateObtained || '',
        }
        break

      case 'project':
        const techArray = newItemData.technologies
          ? newItemData.technologies.split(',').map((tech: string) => tech.trim())
          : []
        pendingStructuredData.value.projects[editingIndex.value] = {
          name: newItemData.name,
          description: newItemData.description || '',
          technologies: techArray,
        }
        break
    }
  } else {
    // Add new item to pending data
    switch (type) {
      case 'education':
        pendingStructuredData.value.education = pendingStructuredData.value.education || []
        pendingStructuredData.value.education.push({
          institution: newItemData.institution,
          degree: newItemData.degree,
          graduationDate: newItemData.graduationDate || 'Presente',
        })
        break

      case 'skill':
        pendingStructuredData.value.technicalSkills = pendingStructuredData.value
          .technicalSkills || { skills: [] }
        pendingStructuredData.value.technicalSkills.skills.push(newItemData.skill)
        break

      case 'experience':
        pendingStructuredData.value.professionalExperience =
          pendingStructuredData.value.professionalExperience || []
        const newResponsibilities = responsibilities.value.filter((r: string) => r.trim())
        pendingStructuredData.value.professionalExperience.push({
          position: newItemData.position,
          company: newItemData.company,
          period: {
            start: newItemData.periodStart || 'Fecha inicio',
            end: newItemData.periodEnd || 'Presente',
          },
          responsibilities: newResponsibilities,
        })
        break

      case 'certification':
        pendingStructuredData.value.certifications =
          pendingStructuredData.value.certifications || []
        pendingStructuredData.value.certifications.push({
          name: newItemData.name,
          issuer: newItemData.issuer || '',
          dateObtained: newItemData.dateObtained || '',
        })
        break

      case 'project':
        pendingStructuredData.value.projects = pendingStructuredData.value.projects || []
        const techArray = newItemData.technologies
          ? newItemData.technologies.split(',').map((tech: string) => tech.trim())
          : []
        pendingStructuredData.value.projects.push({
          name: newItemData.name,
          description: newItemData.description || '',
          technologies: techArray,
        })
        break
    }
  }

  // Update resume display
  resume.value.structured_data = pendingStructuredData.value
  hasPendingChanges.value = true

  toast.add({
    severity: 'success',
    summary: isEditMode.value ? 'Elemento Actualizado' : 'Elemento Agregado',
    detail: 'Los cambios se guardarán cuando presiones "Guardar Cambios"',
    life: 3000,
  })

  closeAddDialog()
}

const deleteItem = () => {
  const type = addDialogType.value
  const index = editingIndex.value

  if (index < 0) return

  // Delete item from pending data
  switch (type) {
    case 'education':
      pendingStructuredData.value.education.splice(index, 1)
      break
    case 'skill':
      pendingStructuredData.value.technicalSkills.skills.splice(index, 1)
      break
    case 'experience':
      pendingStructuredData.value.professionalExperience.splice(index, 1)
      break
    case 'certification':
      pendingStructuredData.value.certifications.splice(index, 1)
      break
    case 'project':
      pendingStructuredData.value.projects.splice(index, 1)
      break
  }

  // Update resume display
  resume.value.structured_data = pendingStructuredData.value
  hasPendingChanges.value = true

  toast.add({
    severity: 'success',
    summary: 'Elemento Eliminado',
    detail: 'El elemento se eliminará cuando presiones "Guardar Cambios"',
    life: 3000,
  })

  closeAddDialog()
}

const saveEdit = () => {
  // Use pending structured data for edits
  let updatedStructuredData = pendingStructuredData.value

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

    updatedStructuredData.professionalExperience =
      updatedStructuredData.professionalExperience || []

    if (fieldType === 'period') {
      const input = value.trim()

      // Expresión Regular para el formato "MM YYYY - MM YYYY" o "MM YYYY - Presente/present"
      // Acepta mes numérico (01-12) o mes en texto (Jan, Feb, etc.)
      const periodRegex =
        /^(?:(?:0?[1-9]|1[0-2])\s\d{4}|[A-Za-z]{3}\s\d{4})\s-\s(?:(?:0?[1-9]|1[0-2])\s\d{4}|[A-Za-z]{3}\s\d{4}|presente|present)$/i

      // 1. **VALIDACIÓN** del formato
      if (!periodRegex.test(input)) {
        toast.add({
          severity: 'error',
          summary: 'Formato Inválido',
          detail:
            'Use el formato: "MM YYYY - MM YYYY" o "MM YYYY - Presente" (ej: "10 2024 - 02 2025")',
          life: 6000,
        })
        return
      }

      const [start, end] = input.split(' - ').map((s) => s.trim())

      // Aseguramos que 'end' sea 'Presente' si el usuario ingresó 'present' o 'presente' (insensible a mayúsculas)
      const normalizedEnd =
        end?.toLowerCase() === 'presente' || end?.toLowerCase() === 'present' ? 'Presente' : end

      updatedStructuredData.professionalExperience[expIndex].period = {
        start: start,
        end: normalizedEnd,
      }
    } else if (fieldType === 'position') {
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
    } else if (fieldType === 'graduationDate') {
      updatedStructuredData.education[eduIndex].graduationDate = value
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
    } else if (fieldType === 'date') {
      updatedStructuredData.certifications[certIndex].dateObtained = value
    }
  } else if (field.startsWith('project_')) {
    const parts = field.split('_')
    const projectIndex = parseInt(parts[1] || '0')
    const fieldType = parts[2]

    if (!fieldType) return

    updatedStructuredData.projects = updatedStructuredData.projects || []
    if (fieldType === 'name') {
      updatedStructuredData.projects[projectIndex].name = value
    } else if (fieldType === 'description') {
      updatedStructuredData.projects[projectIndex].description = value
    } else if (fieldType === 'technologies') {
      // Convertir string separado por comas a array
      const techArray = value
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0)
      updatedStructuredData.projects[projectIndex].technologies = techArray
    }
  }

  // Update local data and mark as pending
  resume.value.structured_data = updatedStructuredData
  pendingStructuredData.value = updatedStructuredData
  hasPendingChanges.value = true

  toast.add({
    severity: 'info',
    summary: 'Cambio Realizado',
    detail: 'El cambio se guardará cuando presiones "Guardar Cambios"',
    life: 3000,
  })

  closeEditModal()
}

const saveAllChanges = async () => {
  if (!hasPendingChanges.value) {
    toast.add({
      severity: 'info',
      summary: 'Sin Cambios',
      detail: 'No hay cambios pendientes por guardar',
      life: 3000,
    })
    return
  }

  try {
    console.log('🔄 Creando nueva versión con todos los cambios:', pendingStructuredData.value)

    await resumeApi.createVersion(
      route.params.id as string,
      pendingStructuredData.value,
      'Edición manual del CV',
    )

    hasPendingChanges.value = false

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Nueva versión creada correctamente con todos los cambios',
      life: 3000,
    })

    // Reload resume to get updated version info
    await loadResumeDetail()
  } catch (error) {
    console.error('❌ Error creating version:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'Error al guardar los cambios',
      life: 5000,
    })
  }
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
      life: 5000,
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
      structured_data: versionData.structured_data,
    }

    // Update editable data
    editableData.name = versionData.structured_data?.header?.name || ''
    editableData.email = versionData.structured_data?.header?.contact?.email || ''
    editableData.phone = versionData.structured_data?.header?.contact?.phone || ''
    editableData.address = versionData.structured_data?.header?.contact?.address || ''

    // Reset pending changes when viewing a different version
    pendingStructuredData.value = JSON.parse(JSON.stringify(versionData.structured_data))
    hasPendingChanges.value = false

    currentVersionNumber.value = versionData.version_number
    showVersionsDialog.value = false

    toast.add({
      severity: 'info',
      summary: 'Versión cargada',
      detail: `Mostrando versión ${versionData.version_number}`,
      life: 3000,
    })
  } catch (error) {
    console.error('Error viewing version:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar la versión',
      life: 5000,
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
      life: 3000,
    })

    // Reload versions and resume
    await Promise.all([loadVersions(), loadResumeDetail()])
  } catch (error) {
    console.error('Error activating version:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al activar la versión',
      life: 5000,
    })
  }
}

const deleteVersion = async (versionId: number) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta versión?')) return

  try {
    await resumeApi.deleteVersion(versionId)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Versión eliminada correctamente',
      life: 3000,
    })

    // Reload versions and resume
    await Promise.all([loadVersions(), loadResumeDetail()])
  } catch (error) {
    console.error('Error deleting version:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al eliminar la versión',
      life: 5000,
    })
  }
}

const downloadPDF = async () => {
  if (!resume.value) return

  downloadingPDF.value = true

  try {
    // Import html2pdf dynamically
    const html2pdf = (await import('html2pdf.js')).default

    // Get the CV container element
    const element = document.querySelector('.cv-container') as HTMLElement
    if (!element) {
      throw new Error('CV container not found')
    }

    // Add class to hide interactive elements during PDF generation
    element.classList.add('pdf-generating')

    // Generate filename
    const name = editableData.name || 'CV'
    const filename = `${name.replace(/\s+/g, '_')}_CV.pdf`

    // PDF options with page break control
    // Using larger top margin to match the visual appearance
    const options = {
      margin: [20, 15, 15, 15] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: '.atomic-block',
      },
    }

    // Generate and download PDF
    await html2pdf().set(options).from(element).save()

    // Remove the class after PDF generation
    element.classList.remove('pdf-generating')

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'PDF descargado correctamente',
      life: 3000,
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Make sure to remove the class even if there's an error
    const element = document.querySelector('.cv-container') as HTMLElement
    if (element) {
      element.classList.remove('pdf-generating')
    }
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al generar el PDF',
      life: 5000,
    })
  } finally {
    downloadingPDF.value = false
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

.cv-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.cv-section-title {
  font-size: 12pt;
  font-weight: bold;
  color: #000;
  margin: 0;
}

.add-section-button {
  opacity: 0.3;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.add-section-button:hover {
  opacity: 1;
  transform: scale(1.1);
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
  margin-bottom: 1.5rem;
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

/* Editable Fields - Removed individual field editing */

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

/* Add Modal Styles */
.add-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.9rem;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.w-full {
  width: 100%;
}

.graduation-date-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 1.75rem;
}

.inline-checkbox {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.field-row-aligned > .field {
  display: flex;
  flex-direction: column;
}

.field-row-aligned > .field > .label-row {
  flex-shrink: 0;
}

.presente-checkbox-label {
  font-weight: normal !important;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--text-color);
}

/* Responsibilities List Styles */
.responsibilities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.responsibilities-header label {
  margin-bottom: 0;
}

.add-responsibility-btn {
  font-size: 0.85rem;
}

.responsibilities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.responsibility-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.responsibility-input {
  flex: 1;
}

.remove-responsibility-btn {
  flex-shrink: 0;
}

/* Item Editable Wrapper Styles */
.item-editable-wrapper {
  cursor: pointer;
  transition: all 0.25s ease;
  border-radius: 6px;
  position: relative;
  padding: 8px;
  margin: -8px;
}

.item-editable-wrapper:hover {
  background-color: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.item-editable-wrapper:active {
  transform: translateY(0);
  background-color: rgba(59, 130, 246, 0.12);
}

.item-editable-wrapper:hover::before {
  content: '\f040';
  font-family: 'primeicons';
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 16px;
  color: rgba(59, 130, 246, 0.8);
  opacity: 1;
  z-index: 1;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .item-editable-wrapper {
    padding: 12px;
    margin: -12px;
  }

  .item-editable-wrapper:hover::before {
    font-size: 18px;
    top: 16px;
    right: 16px;
  }
}

/* Dialog Footer Styles */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-left {
  display: flex;
  gap: 0.5rem;
}

.footer-right {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
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

/* PDF Generation Styles */
.atomic-block {
  page-break-inside: avoid;
  break-inside: avoid;
}

.page-break-before {
  page-break-before: always;
  break-before: page;
}

.page-break-after {
  page-break-after: always;
  break-after: page;
}

/* Save Changes Button and Tag Styles */
.save-button {
  font-weight: 600;
}

.pending-changes-tag {
  font-weight: 600;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

/* PDF Generation - Hide interactive elements */
.cv-container.pdf-generating {
  padding: 0 !important;
}

.cv-container.pdf-generating .add-section-button {
  display: none !important;
}

.cv-container.pdf-generating .item-editable-wrapper {
  cursor: default !important;
  padding: 0 !important;
  margin: 0 !important;
}

.cv-container.pdf-generating .item-editable-wrapper:hover {
  background-color: transparent !important;
  box-shadow: none !important;
  transform: none !important;
}

.cv-container.pdf-generating .item-editable-wrapper:hover::before {
  display: none !important;
}

/* Preserve specific spacing for CV sections during PDF generation */
.cv-container.pdf-generating .cv-experience {
  margin-bottom: 1.5rem !important;
  padding: 0 !important;
}

.cv-container.pdf-generating .cv-education {
  margin-bottom: 0.8rem !important;
  padding: 0 !important;
}

.cv-container.pdf-generating .cv-certification {
  margin-bottom: 0.8rem !important;
  padding: 0 !important;
}

.cv-container.pdf-generating .cv-project {
  margin-bottom: 1rem !important;
  padding: 0 !important;
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

  .atomic-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Hide add buttons and edit indicators in print */
  .add-section-button {
    display: none !important;
  }

  .item-editable-wrapper {
    cursor: default !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .item-editable-wrapper:hover {
    background-color: transparent !important;
    box-shadow: none !important;
    transform: none !important;
  }

  .item-editable-wrapper:hover::before {
    display: none !important;
  }

  /* Preserve specific spacing for CV sections in print */
  .cv-experience {
    margin-bottom: 1.5rem !important;
    padding: 0 !important;
  }

  .cv-education {
    margin-bottom: 0.8rem !important;
    padding: 0 !important;
  }

  .cv-certification {
    margin-bottom: 0.8rem !important;
    padding: 0 !important;
  }

  .cv-project {
    margin-bottom: 1rem !important;
    padding: 0 !important;
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
