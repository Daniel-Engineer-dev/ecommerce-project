import { API_BASE_URL } from './config';

const TOKEN_KEY = 'adminToken';
const REFRESH_TOKEN_KEY = 'adminRefreshToken';
const USER_KEY = 'adminUser';

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const redirectToLogin = () => {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearSession();
    redirectToLogin();
    return null;
  }

  const data = await res.json();
  const accessToken = data.accessToken || data.token;
  if (!accessToken || !data.refreshToken) {
    clearSession();
    redirectToLogin();
    return null;
  }

  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return accessToken;
};

export const apiFetch = async (url, options = {}, retry = true) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status !== 401 || !retry) return res;

  const nextToken = await refreshAccessToken();
  if (!nextToken) return res;

  const retryHeaders = new Headers(options.headers || {});
  retryHeaders.set('Authorization', `Bearer ${nextToken}`);
  return fetch(url, { ...options, headers: retryHeaders });
};

export const apiJson = async (url, options = {}) => {
  const res = await apiFetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
};
