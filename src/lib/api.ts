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
            API_KEY?: string;
        };
    }
}

const API_BASE_URL = window._env_?.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1';

// Get base URL without the /api/v1 suffix for resolving relative paths
const getBaseUrl = (): string => {
    return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
};

// Resolve a relative stem URL to an absolute URL that Tone.js can fetch
export const resolveStemUrl = (relativeUrl: string): string => {
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl; // Already absolute
    }
    return `${getBaseUrl()}${relativeUrl}`;
};

const client = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add auth token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Add X-API-KEY header if set in environment (prefer runtime config over build-time)
    const apiKey = window._env_?.API_KEY || import.meta.env.VITE_API_KEY;
    if (apiKey) {
        config.headers['X-API-KEY'] = apiKey;
    }
    return config;
});

// Fetch a stem audio file as a blob URL (goes through axios with auth headers)
export const fetchStemAsBlob = async (stemUrl: string): Promise<string> => {
    // If it's already a full URL (like Supabase public URLs), return as-is
    if (stemUrl.startsWith('http://') || stemUrl.startsWith('https://')) {
        return stemUrl;
    }

    // For relative API paths, fetch through axios to include auth headers
    const response = await client.get(stemUrl.replace(/^\/api\/v1/, ''), {
        responseType: 'blob'
    });

    return URL.createObjectURL(response.data);
};

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
        const response = await client.get<any>('/library', {
            params: { limit, offset }
        });

        // Handle both direct array and paginated response formats
        if (Array.isArray(response.data)) {
            return response.data;
        }

        // Check for common pagination wrappers
        if (response.data && Array.isArray(response.data.jobs)) {
            return response.data.jobs;
        }
        if (response.data && Array.isArray(response.data.items)) {
            return response.data.items;
        }

        console.warn('Unexpected library response format:', response.data);
        return [];
    },

    resumeJob: async (jobId: string): Promise<void> => {
        await client.patch(`/jobs/${jobId}/resume`);
    },

    pauseJob: async (jobId: string): Promise<void> => {
        await client.patch(`/jobs/${jobId}/pause`);
    },

    deleteJob: async (jobId: string): Promise<void> => {
        await client.delete(`/jobs/${jobId}`);
    },



    exportStems: async (jobId: string, filename?: string): Promise<void> => {
        const response = await client.get(`/jobs/${jobId}/export`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename ? `${filename}-stems.zip` : `stems-${jobId}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};
