const API_BASE_URL = import.meta.env.VITE_RESUME_API_URL || 'https://api.cloudcentinel.com/resume/api/v1/resume'

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export const resumeApi = {
  // Get user's resume list
  async getMyResumes() {
    const response = await fetch(`${API_BASE_URL}/my-resumes`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error ${response.status}: ${errorData.message || 'Failed to fetch resumes'}`)
    }
    return response.json()
  },

  // Get resume detail
  async getResumeDetail(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/${requestId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error ${response.status}: ${errorData.message || 'Failed to fetch resume detail'}`)
    }
    return response.json()
  },

  // Get resume versions
  async getResumeVersions(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/${requestId}/versions`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch versions')
    return response.json()
  },

  // Create new version
  async createVersion(requestId: string, structuredData: any, versionName?: string) {
    const response = await fetch(`${API_BASE_URL}/${requestId}/versions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        structured_data: structuredData,
        version_name: versionName || 'Nueva versión'
      })
    })
    if (!response.ok) throw new Error('Failed to create version')
    return response.json()
  },

  // Activate version
  async activateVersion(requestId: string, versionId: number) {
    const response = await fetch(`${API_BASE_URL}/${requestId}/versions/${versionId}/activate`, {
      method: 'PUT',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to activate version')
    return response.json()
  },

  // Get version detail
  async getVersionDetail(versionId: number) {
    const response = await fetch(`${API_BASE_URL}/versions/${versionId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch version detail')
    return response.json()
  }
}