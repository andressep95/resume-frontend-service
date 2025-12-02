const API_BASE_URL = import.meta.env.VITE_RESUME_API_URL || 'https://api.cloudcentinel.com/resume/api/v1'

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
    const response = await fetch(`${API_BASE_URL}/resume/my-resumes`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch resumes')
    return response.json()
  },

  // Get resume detail
  async getResumeDetail(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/resume/${requestId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch resume detail')
    return response.json()
  },

  // Get resume versions
  async getResumeVersions(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/resume/${requestId}/versions`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch versions')
    return response.json()
  },

  // Create new version
  async createVersion(requestId: string, structuredData: any) {
    const response = await fetch(`${API_BASE_URL}/resume/${requestId}/versions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ structured_data: structuredData })
    })
    if (!response.ok) throw new Error('Failed to create version')
    return response.json()
  },

  // Activate version
  async activateVersion(requestId: string, versionId: number) {
    const response = await fetch(`${API_BASE_URL}/resume/${requestId}/versions/${versionId}/activate`, {
      method: 'PUT',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to activate version')
    return response.json()
  },

  // Get version detail
  async getVersionDetail(versionId: number) {
    const response = await fetch(`${API_BASE_URL}/resume/versions/${versionId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch version detail')
    return response.json()
  }
}