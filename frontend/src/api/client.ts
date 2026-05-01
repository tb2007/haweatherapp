import axios from 'axios';

const client = axios.create({ withCredentials: true });

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export type HAState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
};

export type HistoryPoint = { t: number; v: number };

export type WebcamConfig = { type: 'hls' | 'mjpeg' | 'youtube' | 'disabled'; url: string };

export const api = {
  login: (username: string, password: string) =>
    client.post('/api/auth/login', { username, password }),

  logout: () => client.post('/api/auth/logout'),

  me: () => client.get<{ username: string }>('/api/auth/me'),

  states: (ids: string) =>
    client.get<Record<string, HAState>>(`/api/weather/states?ids=${ids}`),

  history: (entityId: string, hours: number) =>
    client.get<HistoryPoint[]>(`/api/weather/history/${entityId}?hours=${hours}`),

  webcam: () => client.get<WebcamConfig>('/api/weather/webcam'),
};
