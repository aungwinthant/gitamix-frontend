import axios from 'axios';
import type {
    ProcessResponse,
    JobStatusResponse,
    ResultResponse,
    UserResponse,
    AuthResponse
} from '../types/api';

// Basic type for runtime config
declare global {
    interface Window {
        _env_?: {
            BACKEND_URL?: string;
        };
    }
}

const API_BASE_URL = window._env_?.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1';

const client = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add auth token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Add X-API-KEY header if set in environment
    if (import.meta.env.VITE_API_KEY) {
        config.headers['X-API-KEY'] = import.meta.env.VITE_API_KEY;
    }
    return config;
});

export const api = {
    // Auth Endpoints
    getGoogleAuthUrl: async (): Promise<string> => {
        const response = await client.get<{ url: string }>('/auth/google/url');
        return response.data.url;
    },

    loginWithGoogle: async (code: string): Promise<AuthResponse> => {
        const response = await client.post<AuthResponse>('/auth/google', { code });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    getCurrentUser: async (): Promise<UserResponse> => {
        const response = await client.get<UserResponse>('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    // Processing Endpoints
    uploadAudio: async (file: File, stemMode: 'htdemucs' | 'htdemucs_6s' | 'two-stems' = 'htdemucs_6s', onProgress?: (progress: number) => void): Promise<ProcessResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('stem_mode', stemMode);

        const response = await client.post<ProcessResponse>('/process', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
        return response.data;
    },

    getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
        const response = await client.get<JobStatusResponse>(`/jobs/${jobId}`);
        return response.data;
    },

    getJobResult: async (jobId: string): Promise<ResultResponse> => {
        const response = await client.get<ResultResponse>(`/jobs/${jobId}/result`);
        return response.data;
    },

    getLibrary: async (limit: number = 20, offset: number = 0): Promise<JobStatusResponse[]> => {
        const response = await client.get<JobStatusResponse[]>('/library', {
            params: { limit, offset }
        });
        return response.data;
    },
};
