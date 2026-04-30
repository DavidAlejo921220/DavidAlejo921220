// Utilidad para obtener el token de autenticación
export const getAuthToken = () => {
  try {
    const item = localStorage.getItem('token');
    if (!item) return null;
    return JSON.parse(item);
  } catch {
    return localStorage.getItem('token');
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
