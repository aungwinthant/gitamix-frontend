import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface WaveformTrackProps {
    name: string;
    waveformUrl?: string;
    volume: number;
    muted: boolean;
    soloed: boolean;
    currentTime: number;
    duration: number;
    onVolumeChange: (value: number) => void;
    onMuteToggle: () => void;
    onSoloToggle: () => void;
}

// Stem color palette with vibrant colors
const stemColors: Record<string, { bg: string; accent: string; text: string; gradient: string }> = {
    vocals: { bg: 'bg-purple-500/10', accent: 'bg-purple-500', text: 'text-purple-400', gradient: 'from-purple-600 via-purple-400 to-purple-600' },
    drums: { bg: 'bg-orange-500/10', accent: 'bg-orange-500', text: 'text-orange-400', gradient: 'from-orange-600 via-orange-400 to-orange-600' },
    bass: { bg: 'bg-cyan-500/10', accent: 'bg-cyan-500', text: 'text-cyan-400', gradient: 'from-cyan-600 via-cyan-400 to-cyan-600' },
    other: { bg: 'bg-emerald-500/10', accent: 'bg-emerald-500', text: 'text-emerald-400', gradient: 'from-emerald-600 via-emerald-400 to-emerald-600' },
    // Fallbacks just in case
    guitar: { bg: 'bg-yellow-500/10', accent: 'bg-yellow-500', text: 'text-yellow-400', gradient: 'from-yellow-600 via-yellow-400 to-yellow-600' },
    piano: { bg: 'bg-pink-500/10', accent: 'bg-pink-500', text: 'text-pink-400', gradient: 'from-pink-600 via-pink-400 to-pink-600' },
};

export const WaveformTrack = ({
    name,
    waveformUrl,
    volume,
    muted,
    soloed,
    currentTime,
    duration,
    onVolumeChange,
    onMuteToggle,
    onSoloToggle,
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
            {/* 1. Control Panel Container (Distinct Box) */}
            <div className={twMerge(
                "w-48 h-20 rounded-xl border flex items-center px-4 justify-between shrink-0 relative overflow-hidden",
                colors.bg,
                "border-white/10 bg-zinc-900" // Base styling
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
                <div className="w-20 pl-4 border-l border-white/5 z-10 flex items-center h-12">
                    <input
                        type="range"
                        min="-60"
                        max="6"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    />
                </div>
            </div>

            {/* 2. Waveform Container (Distinct Box) */}
            <div className="flex-1 h-20 rounded-xl border border-white/10 bg-zinc-900 relative overflow-hidden flex items-center justify-center p-1.5">
                {/* Background Tint */}
                <div className={twMerge("absolute inset-0 opacity-5 pointer-events-none", colors.bg)} />

                <div className="w-full h-full relative flex items-center justify-center px-4">
                    {/* Loading State or Fallback */}
                    {!imageLoaded && !imageError && (
                        <div className={twMerge("absolute inset-0 flex items-center justify-center mx-4", colors.accent, "opacity-20 animate-pulse")}>
                            <div className="w-full h-1 bg-current rounded-full" />
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
                            <div
                                className={twMerge(
                                    "w-full h-full transition-opacity duration-300",
                                    colors.accent, // Sets background color (e.g. bg-purple-500)
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
                                style={{
                                    maskImage: `url(${waveformUrl})`,
                                    maskSize: '100% 100%',
                                    maskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskImage: `url(${waveformUrl})`,
                                    WebkitMaskSize: '100% 100%',
                                    WebkitMaskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                }}
                            />
                        </>
                    ) : (
                        /* Simple bar fallback */
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className={twMerge("h-full w-1/2 animate-pulse", colors.accent)} />
                        </div>
                    )}
                </div>

                {/* Playhead Line */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 pointer-events-none"
                    style={{ left: `${playheadPosition}%` }}
                />
            </div>
        </div>
    );
};
