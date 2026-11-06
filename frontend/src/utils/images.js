// Cover images are stored by the backend as "/uploads/covers/xxx.jpg".
// In development the Vite proxy serves them from the same address; in production they come from the API server.
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const imageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBase}${path}`;
};

export const MAX_COVER_MB = 2;
export const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
