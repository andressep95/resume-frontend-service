<template>
  <Card class="resume-upload-form">
    <template #title>
      <h2>Procesar CV</h2>
    </template>
    <template #content>
      <form @submit.prevent="handleSubmit" class="form-container">
        <div class="field">
          <label for="file">Archivo CV *</label>
          <FileUpload
            mode="basic"
            name="file"
            accept=".pdf,.txt,.docx"
            :maxFileSize="10000000"
            @select="onFileSelect"
            :auto="false"
            chooseLabel="Seleccionar archivo"
            class="file-upload"
          />
          <small class="help-text">Formatos permitidos: PDF, TXT, DOCX (máx. 10MB)</small>
          <small v-if="errors.file" class="p-error">{{ errors.file }}</small>
        </div>

        <div class="field">
          <label for="language">Idioma</label>
          <Dropdown
            id="language"
            v-model="form.language"
            :options="languageOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar idioma"
            class="language-dropdown"
          />
        </div>

        <div class="field">
          <label for="instructions">Instrucciones (opcional)</label>
          <small class="help-text">Puede ingresar hasta {{ remainingChars }} caracteres en este campo</small>
          <Textarea
            id="instructions"
            v-model="form.instructions"
            rows="4"
            placeholder="Ej: Extraer experiencia laboral de los últimos 5 años"
            class="instructions-textarea"
            :maxlength="500"
            v-tooltip="isAtMaxLimit ? 'Ha alcanzado el máximo de caracteres permitidos en este campo' : ''"
          />
          <small :class="['char-counter', { 'at-limit': isAtMaxLimit }]">
            {{ remainingChars }} caracteres restantes
          </small>
        </div>

        <Button
          type="submit"
          label="Procesar CV"
          :loading="loading"
          :disabled="!selectedFile"
          class="submit-button"
        />
      </form>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import Card from 'primevue/card'
import FileUpload from 'primevue/fileupload'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

interface ResumeForm {
  language: string
  instructions: string
}

interface ResumeErrors {
  file?: string
}

const emit = defineEmits<{
  upload: [data: { file: File; language: string; instructions: string }]
}>()

const form = reactive<ResumeForm>({
  language: 'es',
  instructions: ''
})

const errors = reactive<ResumeErrors>({})
const loading = ref(false)
const selectedFile = ref<File | null>(null)

const remainingChars = computed(() => 500 - form.instructions.length)
const isAtMaxLimit = computed(() => form.instructions.length >= 500)

const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt' },
  { label: 'Français', value: 'fr' }
]

const onFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    selectedFile.value = file
    errors.file = undefined
  }
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof ResumeErrors])

  if (!selectedFile.value) {
    errors.file = 'Debe seleccionar un archivo'
    return false
  }

  const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(selectedFile.value.type)) {
    errors.file = 'Formato no permitido. Use PDF, TXT o DOCX'
    return false
  }

  if (selectedFile.value.size > 10000000) {
    errors.file = 'El archivo debe ser menor a 10MB'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    emit('upload', {
      file: selectedFile.value!,
      language: form.language,
      instructions: form.instructions
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.resume-upload-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.help-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.file-upload {
  width: 100%;
}

.language-dropdown {
  width: 100%;
}

.instructions-textarea {
  width: 100%;
  resize: vertical;
}

.submit-button {
  margin-top: 1rem;
  align-self: flex-start;
}

.p-error {
  color: var(--red-500);
}

.char-counter {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
  text-align: right;
  transition: color 0.2s ease;
}

.char-counter.at-limit {
  color: var(--red-500);
  font-weight: 600;
}
</style>