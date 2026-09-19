import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Tasks API
export const getTasks = (params) => api.get('/tasks', { params });
export const getTaskDetail = (taskId) => api.get(`/tasks/${taskId}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);
export const dragDropTask = (taskId, data) => api.patch(`/tasks/${taskId}/drag-drop`, data);
export const completeTaskEarly = (taskId) => api.post(`/tasks/${taskId}/complete-early`);

// Calendar API
export const getWeeklyCalendar = (startDate) => api.get('/calendar/weekly', { params: { start_date: startDate } });

// Pomodoro API
export const startPomodoro = (taskId, durationMinutes = 25) => api.post('/pomodoro/start', { task_id: taskId, duration_minutes: durationMinutes });
export const completePomodoro = (sessionId) => api.post(`/pomodoro/${sessionId}/complete`);
export const cancelPomodoro = (sessionId) => api.post(`/pomodoro/${sessionId}/cancel`);

export default api;
