import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { JobStatusResponse } from '../types/api';
import { Loader2, Play, AlertCircle, Calendar, Music, Pause, Trash2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from './ui/SkeletonLoader';

export function LibraryView() {
    const [jobs, setJobs] = useState<JobStatusResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadLibrary();
    }, []);

    const loadLibrary = async () => {
        try {
            setIsLoading(true);
            const data = await api.getLibrary(20, 0); // TODO: Implement pagination
            setJobs(data);
        } catch (err) {
            console.error('Failed to load library:', err);
            setError('Failed to load library');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJobClick = (jobId: string) => {
        navigate(`/library/${jobId}/mixer`);
    };

    const handlePause = async (e: React.MouseEvent, jobId: string) => {
        e.stopPropagation();
        setActionLoading(jobId);
        try {
            await api.pauseJob(jobId);
            setJobs(prev => prev.map(job =>
                job.job_id === jobId ? { ...job, status: 'paused' as const } : job
            ));
        } catch (err) {
            console.error('Failed to pause job:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResume = async (e: React.MouseEvent, jobId: string) => {
        e.stopPropagation();
        setActionLoading(jobId);
        try {
            await api.resumeJob(jobId);
            setJobs(prev => prev.map(job =>
                job.job_id === jobId ? { ...job, status: 'separating' as const } : job
            ));
        } catch (err) {
            console.error('Failed to resume job:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (e: React.MouseEvent, jobId: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this job?')) return;
        setActionLoading(jobId);
        try {
            await api.deleteJob(jobId);
            setJobs(prev => prev.filter(job => job.job_id !== jobId));
        } catch (err) {
            console.error('Failed to delete job:', err);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading && jobs.length === 0) {
        return (
            <div className="container mx-auto px-4 max-w-4xl">
                <Skeleton className="h-8 w-48 rounded-lg mb-6" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 w-full">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="space-y-2 flex-1 max-w-[300px]">
                                    <Skeleton className="h-5 w-3/4 rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 p-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Your Library</span>
            </h2>

            <div className="grid gap-4">
                {jobs.map((job) => (
                    <div
                        key={job.job_id}
                        onClick={() => job.status === 'completed' && handleJobClick(job.job_id)}
                        className={`
                            bg-gray-900/50 border border-gray-800 rounded-xl p-4 overflow-hidden
                            transition-all duration-200
                            ${job.status === 'completed' ? 'hover:bg-gray-800 hover:border-cyan-500/30 cursor-pointer group' : ''}
                        `}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full min-w-0">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${job.status === 'completed' ? 'bg-cyan-500/20 text-cyan-400' :
                                    job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                        job.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {job.status === 'completed' ? <Play className="w-5 h-5 fill-current" /> :
                                        job.status === 'failed' ? <AlertCircle className="w-5 h-5" /> :
                                            job.status === 'paused' ? <Pause className="w-5 h-5" /> :
                                                <Loader2 className="w-5 h-5 animate-spin" />}
                                </div>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <h3 className="font-medium text-white truncate" title={job.filename || `Job ${job.job_id}`}>
                                        {job.filename || `Job ${job.job_id.slice(0, 8)}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(job.created_at || '').toLocaleDateString()}</span>
                                        </div>
                                        {job.status === 'completed' && <span className="bg-gray-800 px-2 py-0.5 rounded-full whitespace-nowrap text-[10px] sm:text-xs">Ready</span>}
                                        {job.status === 'paused' && <span className="bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full whitespace-nowrap text-[10px] sm:text-xs">Paused</span>}
                                        {['pending', 'uploading', 'separating'].includes(job.status) && <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap capitalize text-[10px] sm:text-xs">{job.status}</span>}
                                        {job.status === 'failed' && <span className="bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap text-[10px] sm:text-xs">Failed</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Pause button - show for processing jobs */}
                                {['pending', 'uploading', 'separating'].includes(job.status) && (
                                    <button
                                        onClick={(e) => handlePause(e, job.job_id)}
                                        disabled={actionLoading === job.job_id}
                                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors disabled:opacity-50"
                                        title="Pause"
                                    >
                                        {actionLoading === job.job_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                                    </button>
                                )}

                                {/* Resume button - show for paused jobs */}
                                {job.status === 'paused' && (
                                    <button
                                        onClick={(e) => handleResume(e, job.job_id)}
                                        disabled={actionLoading === job.job_id}
                                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                                        title="Resume"
                                    >
                                        {actionLoading === job.job_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                    </button>
                                )}

                                {/* Open Mixer button - show for completed jobs */}
                                {job.status === 'completed' && (
                                    <button
                                        onClick={() => handleJobClick(job.job_id)}
                                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg font-medium transition-colors"
                                    >
                                        Open Mixer
                                    </button>
                                )}

                                {/* Delete button - always show */}
                                <button
                                    onClick={(e) => handleDelete(e, job.job_id)}
                                    disabled={actionLoading === job.job_id}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete"
                                >
                                    {actionLoading === job.job_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {!isLoading && jobs.length === 0 && (
                    <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                        <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No mixes yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Upload a song to start separating stems and creating your custom mixes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

