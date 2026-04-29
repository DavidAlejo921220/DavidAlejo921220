// Utilidad para obtener el token de autenticación de forma segura
export const getAuthToken = () => {
  try {
    const item = sessionStorage.getItem('token');
    if (!item) return null;
    return JSON.parse(decodeURIComponent(atob(item)));
  } catch {
    try {
      return JSON.parse(sessionStorage.getItem('token'));
    } catch {
      return sessionStorage.getItem('token');
    }
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
