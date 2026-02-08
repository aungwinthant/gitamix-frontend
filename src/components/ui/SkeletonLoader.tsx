import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

export const Skeleton = ({ className, width, height, borderRadius }: SkeletonProps) => {
    return (
        <motion.div
            className={twMerge("bg-gray-800/50", className)}
            style={{ width, height, borderRadius }}
            animate={{
                opacity: [0.5, 1, 0.5],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
};

export const MixerSkeleton = () => {
    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Value Props / Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="flex gap-4">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
            </div>


            {/* Waveform Tracks Skeleton */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-4 md:p-6 mb-8 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        {/* Track Controls */}
                        <div className="w-24 flex flex-col gap-2">
                            <Skeleton className="h-4 w-16 rounded" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-8 rounded" />
                                <Skeleton className="h-6 w-8 rounded" />
                            </div>
                        </div>
                        {/* Waveform */}
                        <Skeleton className="flex-1 h-16 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* Player Controls Skeleton */}
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                <Skeleton className="w-full h-2 rounded-lg" />

                <div className="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-between gap-4 md:gap-6">
                    <div className="flex items-center gap-6">
                        <Skeleton className="w-6 h-6 rounded" />
                        <Skeleton className="w-14 h-14 rounded-full" />
                        <Skeleton className="w-6 h-6 rounded" />
                    </div>

                    <Skeleton className="w-48 h-12 rounded-xl" />

                    <div className="flex gap-2">
                        <Skeleton className="w-24 h-10 rounded-lg" />
                        <Skeleton className="w-24 h-10 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
};
