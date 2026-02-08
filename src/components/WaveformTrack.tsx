import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from './ui/SkeletonLoader';

interface WaveformTrackProps {
    name: string;
    waveformUrl?: string;
    volume: number;
    muted: boolean;
    soloed: boolean;
    currentTime: number;
    duration: number;
    zoom?: number;
    onVolumeChange: (value: number) => void;
    onMuteToggle: () => void;
    onSoloToggle: () => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    scrollRef?: React.RefObject<HTMLDivElement>;
}

// Stem color palette matching the user's reference
const stemColors: Record<string, { bg: string; active: string; inactive: string; text: string }> = {
    vocals: {
        bg: 'bg-[#2D1B2E]',
        active: 'bg-[#D94689]',
        inactive: 'bg-[#683458]',
        text: 'text-pink-400'
    },
    drums: {
        bg: 'bg-[#2E241B]',
        active: 'bg-[#D98C28]',
        inactive: 'bg-[#6D4C25]',
        text: 'text-orange-400'
    },
    bass: {
        bg: 'bg-[#1B242E]',
        active: 'bg-[#3E72A8]',
        inactive: 'bg-[#2A425E]',
        text: 'text-blue-400'
    },
    other: {
        bg: 'bg-[#1B2D2E]',
        active: 'bg-[#46D9C8]',
        inactive: 'bg-[#2C6661]',
        text: 'text-teal-400'
    },
    // Fallbacks
    guitar: {
        bg: 'bg-[#2E2B1B]',
        active: 'bg-[#D9C428]',
        inactive: 'bg-[#6D6325]',
        text: 'text-yellow-400'
    },
    piano: {
        bg: 'bg-[#2D1B25]',
        active: 'bg-[#D94668]',
        inactive: 'bg-[#683444]',
        text: 'text-pink-400'
    },
};

export const WaveformTrack = ({
    name,
    waveformUrl,
    volume,
    muted,
    soloed,
    currentTime,
    duration,
    zoom = 1,
    onVolumeChange,
    onMuteToggle,
    onSoloToggle,
    onScroll,
    scrollRef,
}: WaveformTrackProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const colors = stemColors[name] || stemColors.other;
    const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

    const showWaveformImage = waveformUrl && !imageError;

    return (
        <div className={twMerge(
            "flex items-center gap-3 transition-opacity duration-300",
            muted && "opacity-60 grayscale-[0.5]"
        )}>
            {/* 1. Control Panel (Flex Item, Fixed Width) */}
            {/* 1. Control Panel (Flex Item, Fixed Width) */}
            <div className={twMerge(
                "w-48 h-32 rounded-xl border flex items-center px-4 justify-between shrink-0 shadow-xl",
                colors.bg,
                "border-white/5"
            )}>
                {/* Background Tint */}
                <div className={twMerge("absolute inset-0 opacity-10 pointer-events-none", colors.bg)} />

                {/* Title & Mute/Solo */}
                <div className="flex flex-col justify-center gap-1.5 z-10">
                    <span className={twMerge("text-xs font-bold uppercase tracking-wider truncate", colors.text)}>
                        {name}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onMuteToggle}
                            className={twMerge(
                                "p-1.5 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center border border-transparent hover:border-white/10",
                                muted ? "text-red-400 bg-white/5" : "text-gray-400 hover:text-white"
                            )}
                            title="Mute"
                        >
                            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={onSoloToggle}
                            className={twMerge(
                                "px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors flex items-center justify-center",
                                soloed ? "bg-yellow-500 text-black border-yellow-500" : "text-gray-500 border-gray-700 hover:text-gray-300 hover:border-gray-500"
                            )}
                            title="Solo"
                        >
                            S
                        </button>
                    </div>
                </div>

                {/* Volume Slider - Vertical or small horizontal */}
                <div className="w-20 pl-4 border-l border-white/5 z-10 flex items-center h-24">
                    <input
                        type="range"
                        min="-60"
                        max="6"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="h-full w-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all -rotate-180"
                        style={{ writingMode: 'vertical-lr' }}
                    />
                </div>
            </div>

            {/* 2. Waveform Viewport (Flex Item, Scrollable) */}
            <div
                ref={scrollRef}
                onScroll={onScroll}
                className={twMerge(
                    "flex-1 h-32 rounded-xl border border-white/5 relative overflow-x-auto flex items-center p-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]",
                    colors.bg
                )}
            >
                {/* Inner Content (Scalable Width) */}
                <div
                    className="w-full h-full relative flex items-center justify-center px-4"
                >
                    {/* Loading State or Fallback */}
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 flex items-center justify-center mx-4">
                            <Skeleton className={twMerge("w-full h-full rounded-lg opacity-20", colors.active)} />
                        </div>
                    )}

                    {showWaveformImage ? (
                        <>
                            {/* Hidden Image for loading logic */}
                            <img
                                src={waveformUrl}
                                className="hidden"
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                                crossOrigin="anonymous"
                                alt=""
                            />

                            {/* Colorized Waveform using Mask */}
                            <div className="relative w-full h-full">
                                {/* Base Layer: Inactive/Future (Dimmer) */}
                                <div
                                    className={twMerge(
                                        "absolute inset-0 transition-opacity duration-300",
                                        colors.inactive,
                                        imageLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                    style={{
                                        maskImage: `url(${waveformUrl})`,
                                        maskSize: '100% 400%',
                                        maskRepeat: 'no-repeat',
                                        maskPosition: 'center',
                                        WebkitMaskImage: `url(${waveformUrl})`,
                                        WebkitMaskSize: '100% 400%',
                                        WebkitMaskRepeat: 'no-repeat',
                                        WebkitMaskPosition: 'center',
                                        transform: 'translateZ(0)', // GPU acceleration
                                    }}
                                />

                                {/* Overlay Layer: Active/Past (Bright) */}
                                <div
                                    className={twMerge(
                                        "absolute inset-0 transition-opacity duration-300 will-change-[clip-path]",
                                        colors.active,
                                        imageLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                    style={{
                                        maskImage: `url(${waveformUrl})`,
                                        maskSize: '100% 400%',
                                        maskRepeat: 'no-repeat',
                                        maskPosition: 'center',
                                        WebkitMaskImage: `url(${waveformUrl})`,
                                        WebkitMaskSize: '100% 400%',
                                        WebkitMaskRepeat: 'no-repeat',
                                        WebkitMaskPosition: 'center',
                                        clipPath: `inset(0 ${100 - playheadPosition}% 0 0)`,
                                        transform: 'translateZ(0)', // GPU acceleration
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        /* Simple bar fallback */
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className={twMerge("h-full w-1/2 animate-pulse", colors.active)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
