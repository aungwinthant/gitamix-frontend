import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ProcessResponse, JobStatusResponse } from '../types/api';

export const useSeparationJob = () => {
    // Initialize from localStorage if available
    const [jobId, setJobId] = useState<string | null>(() => {
        return localStorage.getItem('current_job_id');
    });
    const queryClient = useQueryClient();

    // Helper to update job ID and localStorage
    const handleSetJobId = useCallback((id: string | null) => {
        if (id) {
            localStorage.setItem('current_job_id', id);
        } else {
            localStorage.removeItem('current_job_id');
        }
        setJobId(id);
    }, []);

    // 1. Upload Mutation
    const uploadMutation = useMutation({
        mutationFn: (file: File) => api.uploadAudio(file),
        onSuccess: (data: ProcessResponse) => {
            handleSetJobId(data.job_id);
            // Invalidate/reset queries related to this new job if needed
            queryClient.invalidateQueries({ queryKey: ['jobStatus', data.job_id] });
        },
    });

    // 2. Poll Status
    const statusQuery = useQuery({
        queryKey: ['jobStatus', jobId],
        queryFn: () => api.getJobStatus(jobId!),
        enabled: !!jobId,
        refetchInterval: (query) => {
            const data = query.state.data as JobStatusResponse | undefined;
            if (data?.status === 'completed' || data?.status === 'failed') {
                return false; // Stop polling
            }
            return 3000; // Poll every 3 seconds
        },
    });

    // 3. Get Results (only when completed)
    const resultQuery = useQuery({
        queryKey: ['jobResult', jobId],
        queryFn: () => api.getJobResult(jobId!),
        enabled: !!jobId && statusQuery.data?.status === 'completed',
    });

    const reset = useCallback(() => {
        handleSetJobId(null);
        uploadMutation.reset();
        // optionally clear React Query cache for this job if we want a fresh start
    }, [uploadMutation, handleSetJobId]);

    return {
        jobId,
        upload: uploadMutation.mutate,
        isUploading: uploadMutation.isPending,
        uploadError: uploadMutation.error,
        status: statusQuery.data?.status || 'idle',
        statusError: statusQuery.error,
        progress: statusQuery.data?.status === 'separating' ? 50 : 0, // Mock progress if backend doesn't provide %
        result: resultQuery.data,
        resultError: resultQuery.error,
        reset,
        loadJob: handleSetJobId,
    };
};
