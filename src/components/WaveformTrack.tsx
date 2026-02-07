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

// Stem color palette for visual distinction
const stemColors: Record<string, { bg: string; accent: string; text: string }> = {
    vocals: { bg: 'bg-purple-500/20', accent: 'bg-purple-500', text: 'text-purple-400' },
    drums: { bg: 'bg-orange-500/20', accent: 'bg-orange-500', text: 'text-orange-400' },
    bass: { bg: 'bg-blue-500/20', accent: 'bg-blue-500', text: 'text-blue-400' },
    guitar: { bg: 'bg-green-500/20', accent: 'bg-green-500', text: 'text-green-400' },
    piano: { bg: 'bg-pink-500/20', accent: 'bg-pink-500', text: 'text-pink-400' },
    other: { bg: 'bg-gray-500/20', accent: 'bg-gray-500', text: 'text-gray-400' },
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
    const colors = stemColors[name] || stemColors.other;
    const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={twMerge(
            "flex items-center gap-3 p-3 rounded-xl border transition-all",
            muted ? "opacity-50 border-gray-800 bg-gray-900/50" : `border-gray-700/50 ${colors.bg}`,
            soloed && !muted && "ring-2 ring-yellow-500/50"
        )}>
            {/* Track Label */}
            <div className="w-20 flex-shrink-0">
                <span className={twMerge("text-sm font-semibold capitalize", colors.text)}>
                    {name}
                </span>
            </div>

            {/* Waveform Container */}
            <div className="flex-1 relative h-16 bg-black/40 rounded-lg overflow-hidden">
                {/* Waveform Image */}
                {waveformUrl ? (
                    <img
                        src={waveformUrl}
                        alt={`${name} waveform`}
                        className="w-full h-full object-cover opacity-80"
                        style={{ filter: muted ? 'grayscale(100%)' : 'none' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className={twMerge("h-1 w-full", colors.accent, "opacity-30")} />
                    </div>
                )}

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/50 z-10 transition-all duration-100"
                    style={{ left: `${playheadPosition}%` }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onMuteToggle}
                        className={twMerge(
                            "p-1.5 rounded-lg transition-colors",
                            muted ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-gray-400"
                        )}
                    >
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                        type="range"
                        min="-60"
                        max="6"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        disabled={muted}
                    />
                </div>

                {/* Solo Button */}
                <button
                    onClick={onSoloToggle}
                    className={twMerge(
                        "px-2 py-1 text-xs font-bold rounded transition-colors",
                        soloed ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    )}
                >
                    S
                </button>
            </div>
        </div>
    );
};
