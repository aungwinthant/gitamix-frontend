import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { JobStatusResponse } from '../types/api';
import { Loader2, Play, AlertCircle, Calendar, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LibraryView() {
    const [jobs, setJobs] = useState<JobStatusResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    if (isLoading && jobs.length === 0) {
        return (
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="h-8 w-48 bg-gray-800 rounded-lg animate-pulse mb-6" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-lg bg-gray-800" />
                                <div className="space-y-2 flex-1 max-w-[300px]">
                                    <div className="h-5 bg-gray-800 rounded w-3/4" />
                                    <div className="h-3 bg-gray-800 rounded w-1/2" />
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
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {job.status === 'completed' ? <Play className="w-5 h-5 fill-current" /> :
                                        job.status === 'failed' ? <AlertCircle className="w-5 h-5" /> :
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
                                        {['pending', 'uploading', 'separating'].includes(job.status) && <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap capitalize text-[10px] sm:text-xs">{job.status}</span>}
                                        {job.status === 'failed' && <span className="bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap text-[10px] sm:text-xs">Failed</span>}
                                    </div>
                                </div>
                            </div>

                            {job.status === 'completed' && (
                                <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-full sm:w-auto flex-shrink-0">
                                    <button className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg font-medium transition-colors">
                                        Open Mixer
                                    </button>
                                </div>
                            )}
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
