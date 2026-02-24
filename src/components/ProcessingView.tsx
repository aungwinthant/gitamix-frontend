import type { JobStatus } from '../types/api';
import { Loader2, Music, CheckCircle2, XCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ProcessingViewProps {
    status: JobStatus;
    progress: number;
    error: Error | null;
    onRetry?: () => void;
}

export const ProcessingView = ({ status, progress, error, onRetry }: ProcessingViewProps) => {
    const steps = [
        { id: 'uploading', label: 'Preparing task...', icon: Loader2 },
        { id: 'downloading', label: 'Downloading YouTube audio...', icon: Loader2 },
        { id: 'pending', label: 'Queued for separation', icon: Loader2 },
        { id: 'separating', label: 'AI separating stems...', icon: Music },
        { id: 'completed', label: 'Ready to mix', icon: CheckCircle2 },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === (status === 'failed' ? 'separating' : status));

    if (status === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Processing Failed</h2>
                <p className="text-red-400 mb-8 max-w-md">{error?.message || "An unexpected error occurred while processing your file."}</p>
                <button
                    onClick={onRetry || (() => window.location.reload())}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 max-w-xl mx-auto w-full">
            <div className="w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Processing Audio</h2>
                    <p className="text-gray-400">Please wait while our AI separates your track</p>
                </div>

                {/* Progress Bar (Mock visualizer) */}
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-cyan-500 transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${status === 'completed' ? 100 : Math.max(5, progress)}%` }}
                    />
                    {status === 'separating' && (
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    )}
                </div>

                {/* Status Steps */}
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const isCurrent = step.id === status;
                        const isCompleted = index < currentStepIndex || status === 'completed';
                        const isPending = !isCurrent && !isCompleted;

                        // Determine which icon to show:
                        // - Completed: CheckCircle2
                        // - Current: Loader2 (spinning)
                        // - Pending: Original step icon
                        const IconToShow = isCompleted ? CheckCircle2 : (isCurrent ? Loader2 : step.icon);

                        return (
                            <div
                                key={step.id}
                                className={twMerge(
                                    "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                                    isCurrent ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-transparent",
                                    isPending && "opacity-50"
                                )}
                            >
                                <div className={twMerge(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    isCurrent ? "bg-cyan-500 text-white" : "bg-gray-800 text-gray-400",
                                    isCompleted && "bg-green-500/20 text-green-400"
                                )}>
                                    <IconToShow className={twMerge("w-5 h-5", isCurrent && "animate-spin")} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={twMerge(
                                        "font-medium",
                                        isCurrent && status !== 'completed' ? "text-cyan-400" : "text-gray-300"
                                    )}>
                                        {isCompleted && step.id !== 'completed' ? step.label.replace('...', '') + ' ✓' : step.label}
                                    </h4>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
