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

// Stem color palette with gradient values for waveform simulation
const stemColors: Record<string, { bg: string; accent: string; text: string; gradient: string }> = {
    vocals: { bg: 'bg-purple-500/20', accent: 'bg-purple-500', text: 'text-purple-400', gradient: 'from-purple-600 via-purple-400 to-purple-600' },
    drums: { bg: 'bg-orange-500/20', accent: 'bg-orange-500', text: 'text-orange-400', gradient: 'from-orange-600 via-orange-400 to-orange-600' },
    bass: { bg: 'bg-blue-500/20', accent: 'bg-blue-500', text: 'text-blue-400', gradient: 'from-blue-600 via-blue-400 to-blue-600' },
    guitar: { bg: 'bg-green-500/20', accent: 'bg-green-500', text: 'text-green-400', gradient: 'from-green-600 via-green-400 to-green-600' },
    piano: { bg: 'bg-pink-500/20', accent: 'bg-pink-500', text: 'text-pink-400', gradient: 'from-pink-600 via-pink-400 to-pink-600' },
    other: { bg: 'bg-gray-500/20', accent: 'bg-gray-500', text: 'text-gray-400', gradient: 'from-gray-600 via-gray-400 to-gray-600' },
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
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
            muted ? "opacity-40 border-gray-800 bg-gray-900/50" : `border-gray-700/50 ${colors.bg}`,
            soloed && !muted && "ring-2 ring-yellow-400/60"
        )}>
            {/* Track Label */}
            <div className="w-16 md:w-20 flex-shrink-0">
                <span className={twMerge("text-xs md:text-sm font-semibold capitalize truncate", colors.text)}>
                    {name}
                </span>
            </div>

            {/* Waveform Container */}
            <div className="flex-1 relative h-12 md:h-14 bg-black/50 rounded-lg overflow-hidden">
                {/* Waveform Image or Gradient Fallback */}
                {showWaveformImage ? (
                    <>
                        {/* Loading placeholder */}
                        {!imageLoaded && (
                            <div className={twMerge(
                                "absolute inset-0 bg-gradient-to-r opacity-30 animate-pulse",
                                colors.gradient
                            )} />
                        )}
                        <img
                            src={waveformUrl}
                            alt={`${name} waveform`}
                            className={twMerge(
                                "w-full h-full object-fill transition-opacity duration-300",
                                imageLoaded ? "opacity-90" : "opacity-0"
                            )}
                            style={{ filter: muted ? 'grayscale(100%) brightness(0.6)' : 'none' }}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />
                    </>
                ) : (
                    /* Smooth gradient bar as fallback */
                    <div className="w-full h-full flex items-center justify-center px-2">
                        <div className={twMerge(
                            "h-1.5 w-full rounded-full bg-gradient-to-r opacity-40",
                            colors.gradient
                        )} />
                    </div>
                )}

                {/* Progress overlay - shows played portion */}
                <div
                    className="absolute inset-0 bg-black/30 pointer-events-none transition-all duration-75"
                    style={{
                        clipPath: `inset(0 ${100 - playheadPosition}% 0 0)`,
                    }}
                />

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10"
                    style={{
                        left: `${playheadPosition}%`,
                        boxShadow: '0 0 8px rgba(255,255,255,0.6)'
                    }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                {/* Mute Button */}
                <button
                    onClick={onMuteToggle}
                    className={twMerge(
                        "p-1.5 rounded-lg transition-all duration-200",
                        muted ? "bg-red-500/30 text-red-400" : "hover:bg-white/10 text-gray-400 hover:text-white"
                    )}
                >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Volume Slider */}
                <input
                    type="range"
                    min="-60"
                    max="6"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-12 md:w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                    disabled={muted}
                />

                {/* Solo Button */}
                <button
                    onClick={onSoloToggle}
                    className={twMerge(
                        "px-2 py-1 text-xs font-bold rounded transition-all duration-200",
                        soloed ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    )}
                >
                    S
                </button>
            </div>
        </div>
    );
};
