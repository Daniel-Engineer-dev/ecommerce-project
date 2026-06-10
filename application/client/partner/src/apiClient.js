import { API_BASE_URL } from './config';

const TOKEN_KEY = 'partnerToken';
const REFRESH_TOKEN_KEY = 'partnerRefreshToken';
const USER_KEY = 'partnerUser';

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const redirectToLogin = () => {
  window.location.href = '/';
};

const endSession = (message) => {
  if (message) sessionStorage.setItem('partnerSessionMessage', message);
  clearSession();
  redirectToLogin();
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
    const data = await res.json().catch(() => ({}));
    endSession(data.message || 'Phiên đăng nhập không còn hợp lệ.');
    return null;
  }

  const data = await res.json();
  const accessToken = data.accessToken || data.token;
  if (!accessToken || !data.refreshToken) {
    endSession('Phiên đăng nhập không còn hợp lệ.');
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
