import { API_BASE_URL } from './config';

export const createRealtimeSource = () => {
  const token = localStorage.getItem('adminToken');
  if (!token || typeof EventSource === 'undefined') return null;
  return new EventSource(`${API_BASE_URL}/api/events?token=${encodeURIComponent(token)}`);
};
