import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      // Network unreachable — backend is down
      err.message = 'Cannot reach the API. Make sure the backend is running on port 5000.';
      err.isNetworkError = true;
    } else {
      // Normalise server error message so callers can always read err.message
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      if (serverMsg) err.message = serverMsg;
    }
    return Promise.reject(err);
  }
);

// ── Nodes ────────────────────────────────────────────────────────────────────

export const fetchNodes = () =>
  api.get('/nodes').then((r) => r.data);

export const createNode = (data) =>
  api.post('/nodes', data).then((r) => r.data);

export const updateNodeStatus = (id, status, latency) =>
  api.patch(`/nodes/${id}/status`, { status, latency }).then((r) => r.data);

export const deleteNode = (id) =>
  api.delete(`/nodes/${id}`).then((r) => r.data);

// ── Incidents ────────────────────────────────────────────────────────────────

export const fetchIncidents = () =>
  api.get('/incidents').then((r) => r.data);

export const createIncident = (data) =>
  api.post('/incidents', data).then((r) => r.data);

export const resolveIncident = (id) =>
  api.patch(`/incidents/${id}/resolve`).then((r) => r.data);

// ── Seed ─────────────────────────────────────────────────────────────────────

/** Idempotent — only seeds if DB is empty */
export const seedDatabase = () =>
  api.post('/seed').then((r) => r.data);

// ── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = () =>
  api.get('/health').then((r) => r.data);

export default api;
