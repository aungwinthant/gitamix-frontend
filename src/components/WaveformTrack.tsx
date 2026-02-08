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

// Stem color palette with gradient values for waveform simulation (Monochrome / High Contrast)
const stemColors: Record<string, { bg: string; accent: string; text: string; gradient: string }> = {
    vocals: { bg: 'bg-zinc-900', accent: 'bg-white', text: 'text-zinc-300', gradient: 'from-zinc-500 via-zinc-300 to-zinc-500' },
    drums: { bg: 'bg-zinc-900', accent: 'bg-white', text: 'text-zinc-300', gradient: 'from-zinc-500 via-zinc-300 to-zinc-500' },
    bass: { bg: 'bg-zinc-900', accent: 'bg-white', text: 'text-zinc-300', gradient: 'from-zinc-500 via-zinc-300 to-zinc-500' },
    guitar: { bg: 'bg-zinc-900', accent: 'bg-white', text: 'text-zinc-300', gradient: 'from-zinc-500 via-zinc-300 to-zinc-500' },
    piano: { bg: 'bg-zinc-900', accent: 'bg-white', text: 'text-zinc-300', gradient: 'from-zinc-500 via-zinc-300 to-zinc-500' },
    other: { bg: 'bg-zinc-900', accent: 'bg-white', text: 'text-zinc-300', gradient: 'from-zinc-500 via-zinc-300 to-zinc-500' },
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
            muted ? "opacity-30 border-gray-800 bg-black/40" : `border-gray-800 ${colors.bg}`,
            soloed && !muted && "ring-1 ring-white"
        )}>
            {/* Track Label */}
            <div className="w-16 md:w-20 flex-shrink-0">
                <span className={twMerge("text-xs md:text-sm font-semibold capitalize truncate", colors.text)}>
                    {name}
                </span>
            </div>

            {/* Waveform Container */}
            <div className="flex-1 relative h-24 md:h-32 bg-black rounded-lg overflow-hidden border border-white/5">
                {/* Waveform Image or Gradient Fallback */}
                {showWaveformImage ? (
                    <>
                        {/* Loading placeholder */}
                        {!imageLoaded && (
                            <div className={twMerge(
                                "absolute inset-0 bg-gradient-to-r opacity-10 animate-pulse",
                                colors.gradient
                            )} />
                        )}
                        <img
                            src={waveformUrl}
                            alt={`${name} waveform`}
                            className={twMerge(
                                "w-full h-full object-fill transition-opacity duration-300", // object-fill to stretch vertically
                                imageLoaded ? "opacity-100" : "opacity-0"
                            )}
                            style={{
                                filter: 'grayscale(100%) contrast(1.2) brightness(1.5)',
                                mixBlendMode: 'screen'
                            }}
                            crossOrigin="anonymous"
                            onLoad={() => {
                                setImageLoaded(true);
                            }}
                            onError={(e) => {
                                console.error(`Failed to load waveform for ${name}:`, waveformUrl, e);
                                setImageError(true);
                            }}
                        />
                    </>
                ) : (
                    /* Smooth gradient bar as fallback */
                    <div className="w-full h-full flex items-center justify-center px-2">
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-600 w-1/2 animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Progress overlay - shows played portion - INVERTED for white-on-black effect if needed, 
                    OR standard overlay. Let's make it a simple white playhead line and maybe slightly dim the passed part?
                    Actually, standard DAW behavior: playback cursor moves.
                    Let's just use the playhead line for clarity in B&W.
                */}
                <div
                    className="absolute inset-0 bg-black/50 pointer-events-none transition-all duration-75"
                    style={{
                        // reveal content as it plays? or cover? 
                        // "clip-path: inset(0 X% 0 0)" cuts off the right side.
                        // We want to darken the COMING part? Or darken the PLAYED part?
                        // Let's just keep the simple playhead line for clean look.
                        // But user requested "restart" visibility.
                        // Let's keep the overlay style but make it subtle.
                        clipPath: `inset(0 ${100 - playheadPosition}% 0 0)`,
                    }}
                />

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{
                        left: `${playheadPosition}%`,
                    }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                {/* Mute Button */}
                <button
                    onClick={onMuteToggle}
                    className={twMerge(
                        "p-1.5 rounded-lg transition-all duration-200 border border-transparent",
                        muted ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-white hover:border-white/10"
                    )}
                    title="Mute"
                >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Volume Slider - styled to be minimal/white */}
                <input
                    type="range"
                    min="-60"
                    max="6"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-12 md:w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                    disabled={muted}
                />

                {/* Solo Button - minimal */}
                <button
                    onClick={onSoloToggle}
                    className={twMerge(
                        "px-2 py-1 text-xs font-bold rounded border transition-all duration-200",
                        soloed ? "bg-white text-black border-white" : "bg-transparent text-zinc-500 border-zinc-700 hover:text-white hover:border-zinc-500"
                    )}
                    title="Solo"
                >
                    S
                </button>
            </div>
        </div>
    );
};
