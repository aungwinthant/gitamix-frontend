export type JobStatus = 'pending' | 'uploading' | 'separating' | 'completed' | 'failed' | 'paused';

export interface ProcessResponse {
    job_id: string;
    status: JobStatus;
    message?: string;
}

export interface JobStatusResponse {
    job_id: string;
    filename?: string;
    status: JobStatus;
    error?: string;
    created_at?: string;
    completed_at?: string;
}

export interface StemsInfo {
    vocals: string;
    drums: string;
    drums_2?: string; // Sometimes 4 stems include drums
    bass: string;
    guitar?: string;
    piano?: string;
    other: string;
}

export interface Metadata {
    title?: string;
    artist?: string;
    duration?: number;
    lyrics?: string;
    chords?: string;
}

export interface WaveformsInfo {
    vocals?: string;
    drums?: string;
    bass?: string;
    guitar?: string;
    piano?: string;
    other?: string;
}

export interface ResultResponse {
    job_id: string;
    status: JobStatus;
    stems: StemsInfo;
    metadata: Metadata;
    waveforms?: WaveformsInfo;
}

export interface User {
    id: string;
    email: string;
    name: string;
    tier: 'guest' | 'verified' | 'pro';
    created_at: string;
}

export interface UsageInfo {
    used: number;
    limit: number;
    month_year: string;
}

export interface UserResponse {
    user: User;
    can_process: boolean;
    usage: UsageInfo;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ErrorResponse {
    error: string;
    code?: string;
    details?: string;
}

export interface RateLimitResponse {
    error: string;
    code: 'rate_limit_exceeded';
    tier: 'guest' | 'verified' | 'pro';
    used: number;
    limit: number;
    month_year: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface LibraryResponse {
    jobs: JobStatusResponse[];
    total: number;
    page: number;
    limit: number;
}
