import { API_BASE_URL } from "./config";

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const redirectToLogin = () => {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
  return accessToken;
};

export const apiFetch = async (url, options = {}, retry = true) => {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status !== 401 || !retry) return res;

  const nextToken = await refreshAccessToken();
  if (!nextToken) return res;

  const retryHeaders = new Headers(options.headers || {});
  retryHeaders.set("Authorization", `Bearer ${nextToken}`);
  return fetch(url, { ...options, headers: retryHeaders });
};

export { clearSession, refreshAccessToken };
