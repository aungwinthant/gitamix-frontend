import { Mic2, Drum, Guitar, Keyboard, Speaker, Music2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ChannelStripProps {
    name: string;
    volume: number;
    muted: boolean;
    soloed: boolean;
    onVolumeChange: (val: number) => void;
    onMuteToggle: () => void;
    onSoloToggle: () => void;
}

const ICONS: Record<string, any> = {
    vocals: Mic2,
    drums: Drum,
    guitar: Guitar,
    bass: Music2,
    piano: Keyboard,
    other: Speaker,
};

export const ChannelStrip = ({
    name,
    volume,
    muted,
    soloed,
    onVolumeChange,
    onMuteToggle,
    onSoloToggle
}: ChannelStripProps) => {
    const Icon = ICONS[name] || Music2;

    return (
        <div className="flex flex-col items-center bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl p-4 w-24 gap-4 transition-all hover:border-gray-700">
            {/* Icon & Label */}
            <div className="flex flex-col items-center gap-2 mb-2">
                <div className={twMerge(
                    "p-3 rounded-full transition-colors duration-300",
                    soloed ? "bg-yellow-500/20 text-yellow-500" : "bg-gray-800 text-gray-400"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400 truncate w-full text-center">
                    {name}
                </span>
            </div>

            {/* Volume Slider */}
            <div className="h-32 flex items-center justify-center py-2">
                <input
                    type="range"
                    min="-60"
                    max="6"
                    step="1"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="h-full -rotate-90 w-32 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:mt-[-6px]"
                    style={{ width: '8rem' }} // Width becomes height due to rotation
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2 w-full">
                <button
                    onClick={onMuteToggle}
                    className={twMerge(
                        "w-full py-1.5 rounded text-xs font-bold transition-all",
                        muted ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    )}
                >
                    M
                </button>
                <button
                    onClick={onSoloToggle}
                    className={twMerge(
                        "w-full py-1.5 rounded text-xs font-bold transition-all",
                        soloed ? "bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)]" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    )}
                >
                    S
                </button>
            </div>

            {/* Value Display */}
            <div className="text-[10px] text-gray-500 font-mono mt-1">
                {volume.toFixed(0)} dB
            </div>
        </div>
    );
};
