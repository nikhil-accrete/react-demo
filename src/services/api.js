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
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Enhanced Todo API with user assignment
export const todoAPI = {
    getTodos: () => api.get("/todos"),
    createTodo: (title, user_id = null) => api.post("/todos", { title, user_id }),
    updateTodo: (id, data) => api.put(`/todos/${id}`, data),
    deleteTodo: (id) => api.delete(`/todos/${id}`),
};

// Enhanced User API with full CRUD operations
export const userAPI = {
    getUsers: () => api.get("/users"),
    getUser: (id) => api.get(`/users/${id}`),
    createUser: (userData) => api.post("/users", userData),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

export const statsAPI = {
    getStats: () => api.get("/stats"),
    healthCheck: () => api.get("/health"),
};

export default api;