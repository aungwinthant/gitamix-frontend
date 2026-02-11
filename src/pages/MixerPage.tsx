import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mixer } from '../components/Mixer';
import { Header } from '../components/layout/Header';
import { AlertCircle } from 'lucide-react';
import { MixerSkeleton } from '../components/ui/SkeletonLoader';

export const MixerPage = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    // Protect route
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate('/');
        }
    }, [isAuthLoading, isAuthenticated, navigate]);

    const { data: result, isLoading, error } = useQuery({
        queryKey: ['jobResult', jobId],
        queryFn: () => api.getJobResult(jobId!),
        enabled: !!jobId && isAuthenticated,
        staleTime: Infinity, // Prevent refetching when page becomes active
        refetchOnWindowFocus: false, // Disable refetch on window focus
    });

    if (isAuthLoading || isLoading) {
        return (
            <>
                <Header showNewUploadButton={true} onNewUpload={() => navigate('/')} />
                <MixerSkeleton />
            </>
        );
    }

    if (error || !result) {
        return (
            <>
                <Header showNewUploadButton={true} onNewUpload={() => navigate('/')} />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to load mix</h2>
                    <p className="text-gray-400 mb-8 max-w-md">
                        {(error as Error)?.message || "The requested mix could not be found or there was an error loading it."}
                    </p>
                    <button
                        onClick={() => navigate('/library')}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                    >
                        Back to Library
                    </button>
                </div>
            </>
        );
    }

    if (result) {
        console.log('Job Result:', result);
        console.log('Stem URLs:', result.stems);
        if (result.waveforms) console.log('Waveform URLs:', result.waveforms);
    }

    return (
        <>
            <Header showNewUploadButton={true} onNewUpload={() => navigate('/')} />
            <main className="flex-1 flex flex-col items-center justify-center">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8 flex items-center justify-between">
                        <button
                            onClick={() => navigate('/library')}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            ← Back to Library
                        </button>
                    </div>

                    <div className="mb-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                            {result.metadata?.title || 'Untitled Track'}
                        </h1>
                        {result.metadata?.artist && (
                            <p className="text-gray-400 text-lg">{result.metadata.artist}</p>
                        )}
                    </div>

                    <Mixer key={jobId} stems={result.stems} jobId={jobId!} metadata={result.metadata} waveforms={result.waveforms} onReset={() => navigate('/')} />
                </div>
            </main>
        </>
    );
};
