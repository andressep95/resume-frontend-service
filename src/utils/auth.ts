// Función para decodificar JWT
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

// Verificar si el token es válido
export const isTokenValid = (token: string): boolean => {
  const decoded = decodeJWT(token)
  if (!decoded?.exp) return false
  
  const now = Math.floor(Date.now() / 1000)
  return decoded.exp > now
}

// Limpiar tokens y redirigir al login
export const clearAuthAndRedirect = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/login'
}