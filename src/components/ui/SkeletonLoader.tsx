import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

const Shimmer = ({ className, width, height, borderRadius }: SkeletonProps) => {
    return (
        <div
            className={twMerge("relative overflow-hidden bg-gray-800/40", className)}
            style={{ width, height, borderRadius }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
};

export const MixerSkeleton = () => {
    return (
        <div className="flex flex-col h-full w-full bg-gray-950 text-white animate-in fade-in duration-500">
            {/* Toolbar Skeleton */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900 border-b border-gray-800">
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => <Shimmer key={i} className="h-9 w-20 rounded" />)}
                </div>
                <div className="flex gap-1">
                    {[1, 2].map(i => <Shimmer key={i} className="h-9 w-24 rounded" />)}
                </div>
                <Shimmer className="h-9 w-36 rounded" />
                <Shimmer className="h-9 w-48 rounded" />
            </div>

            {/* Tracks Skeleton - Matching Mixer Layout */}
            <div className="flex-grow w-full overflow-hidden flex flex-col p-4 space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex w-full h-[140px] bg-gray-900/40 border border-gray-800 rounded overflow-hidden">
                        {/* Controls Left Panel */}
                        <div className="w-[200px] flex-shrink-0 border-r border-gray-800 p-2 flex flex-col items-center justify-center gap-2 bg-gray-900">
                            <Shimmer className="h-4 w-24 rounded mb-2" />
                            <div className="flex gap-2">
                                <Shimmer className="h-6 w-12 rounded" />
                                <Shimmer className="h-6 w-12 rounded" />
                            </div>
                            <div className="w-full px-2 mt-2">
                                <Shimmer className="h-4 w-full rounded" />
                            </div>
                            <div className="w-full px-2">
                                <Shimmer className="h-4 w-full rounded" />
                            </div>
                        </div>

                        {/* Waveform Area */}
                        <div className="flex-grow relative p-4 flex items-center">
                            <Shimmer className="w-full h-16 rounded opacity-30" />
                            {/* Simulate detailed waveform lines */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 gap-1">
                                {[...Array(20)].map((_, j) => (
                                    <div key={j} style={{ height: `${Math.random() * 80 + 20}%` }} className="w-2 bg-white/20 rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
