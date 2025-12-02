const API_BASE_URL = import.meta.env.VITE_RESUME_API_URL || 'https://api.cloudcentinel.com/resume/api/v1/resume'

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

const handleApiError = async (response: Response) => {
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }
  
  const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
  throw new Error(`Error ${response.status}: ${errorData.message || 'Error del servidor'}`)
}

export const resumeApi = {
  // Get user's resume list
  async getMyResumes() {
    const response = await fetch(`${API_BASE_URL}/my-resumes`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      await handleApiError(response)
    }
    return response.json()
  },

  // Get resume detail
  async getResumeDetail(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/${requestId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      await handleApiError(response)
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
  },

  // Delete version
  async deleteVersion(versionId: number) {
    const response = await fetch(`${API_BASE_URL}/versions/${versionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete version')
    return response.json()
  }
}