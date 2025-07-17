import axios from "axios";

// Fix the logic - REACT_APP_ENV should take priority
const isProduction = process.env.REACT_APP_ENV === 'production';

const API_BASE_URL = isProduction
    ? "/api"  // Production: Nginx proxy
    : process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const todoAPI = {
    getTodos: () => api.get("/todos"),
    createTodo: (title) => api.post("/todos", { title }),
    updateTodo: (id, data) => api.put(`/todos/${id}`, data),
    deleteTodo: (id) => api.delete(`/todos/${id}`),
};

export const userAPI = {
    getUsers: () => api.get("/users"),
};

export const statsAPI = {
    getStats: () => api.get("/stats"),
    healthCheck: () => api.get("/health"),
};

export default api;