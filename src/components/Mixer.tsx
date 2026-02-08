import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Loader2, RefreshCcw, SkipBack, SkipForward, Download, Music } from 'lucide-react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { WaveformTrack } from './WaveformTrack';
import { PremiumModal } from './PremiumModal';
import { useAuth } from '../contexts/AuthContext';
import type { StemsInfo, Metadata, WaveformsInfo } from '../types/api';
import { twMerge } from 'tailwind-merge';
import { api } from '../lib/api';
import { MixerSkeleton } from './ui/SkeletonLoader';

interface MixerProps {
    stems: StemsInfo;
    jobId: string;
    metadata?: Metadata;
    waveforms?: WaveformsInfo;
    onReset: () => void;
}

export const Mixer = ({ stems, jobId, metadata, waveforms, onReset }: MixerProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [zoom, setZoom] = useState(1);
    const { user } = useAuth();
    const trackRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const isScrollingRef = useRef(false);

    const isPremium = user?.tier === 'pro';

    const {
        isLoaded,
        loadError,
        isPlaying,
        togglePlayback,
        bpm,
        setBpm,
        channels,
        setChannelVolume,
        toggleMute,
        toggleSolo,
        duration,
        currentTime,
        seek
    } = useAudioEngine(stems, 120);

    // Synchronized scrolling
    const handleTrackScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (isScrollingRef.current) return;

        isScrollingRef.current = true;
        const target = e.target as HTMLDivElement;
        const scrollLeft = target.scrollLeft;

        trackRefs.current.forEach((ref) => {
            if (ref && ref !== target) {
                ref.scrollLeft = scrollLeft;
            }
        });

        // Small timeout to reset lock
        requestAnimationFrame(() => {
            isScrollingRef.current = false;
        });
    }, []);

    // Auto-scroll logic (Applied to all tracks)
    useEffect(() => {
        if (!duration || duration === 0) return;

        const refs = Array.from(trackRefs.current.values());
        if (refs.length === 0) return;

        // Use first track to calculate dimensions (assuming consistent sizing)
        const container = refs[0];
        const percent = currentTime / duration;
        const totalWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;

        const targetScroll = (totalWidth * percent) - (clientWidth / 2);

        // Sync all tracks
        // Temporarily lock sync listener to avoid loops triggered by auto-scroll
        isScrollingRef.current = true;
        refs.forEach(ref => {
            if (ref) ref.scrollLeft = targetScroll;
        });
        requestAnimationFrame(() => {
            isScrollingRef.current = false;
        });

    }, [currentTime, duration, zoom]);

    const handleExport = async () => {
        if (!isPremium) {
            setShowPremiumModal(true);
            return;
        }

        setIsExporting(true);
        try {
            await api.exportStems(jobId, metadata?.title);
        } catch (error) {
            console.error('Failed to export stems:', error);
        } finally {
            setIsExporting(false);
        }
    };



    // Keyboard controls
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayback();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                seek(Math.max(0, currentTime - 5));
                break;
            case 'ArrowRight':
                e.preventDefault();
                seek(Math.min(duration, currentTime + 5));
                break;
            case 'Home':
                e.preventDefault();
                seek(0);
                break;
        }
    }, [togglePlayback, seek, currentTime, duration]);

    // Register keyboard event listener
    useEffect(() => {
        if (!isLoaded) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLoaded, handleKeyDown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Show error state if loading failed
    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">Failed to Load Stems</h2>
                <p className="text-gray-400 max-w-md">{loadError}</p>
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
                    >
                        Retry
                    </button>
                    <button
                        onClick={onReset}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return <MixerSkeleton />;
    }

    // Define channel order for consistent UI (Limited to 4 primary stems)
    const ORDER = ['vocals', 'drums', 'bass', 'other'];
    const channelKeys = Object.keys(channels)
        .filter(key => ORDER.includes(key)) // Filter out non-primary stems like piano/guitar
        .sort((a, b) => {
            const idxA = ORDER.indexOf(a);
            const idxB = ORDER.indexOf(b);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Waveform Tracks */}
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-3xl p-4 md:p-6 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

                <div className="relative z-10 space-y-3 pb-2">
                    {channelKeys.map((name) => (
                        <WaveformTrack
                            key={name}
                            name={name}
                            waveformUrl={waveforms?.[name as keyof WaveformsInfo]}
                            volume={channels[name]?.volume ?? 0}
                            muted={channels[name]?.muted ?? false}
                            soloed={channels[name]?.soloed ?? false}
                            currentTime={currentTime}
                            duration={duration}
                            zoom={zoom}
                            onVolumeChange={(val) => setChannelVolume(name, val)}
                            onMuteToggle={() => toggleMute(name)}
                            onSoloToggle={() => toggleSolo(name)}
                            onScroll={handleTrackScroll}
                            // @ts-ignore - allowing function ref for map management
                            scrollRef={(el: HTMLDivElement | null) => {
                                if (el) trackRefs.current.set(name, el);
                                else trackRefs.current.delete(name);
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Player Controls (Bottom) */}
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">

                {/* Progress Bar */}
                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                    />
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-between gap-4 md:gap-6">

                    {/* Transport */}
                    <div className="flex items-center gap-6">
                        <button
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            onClick={() => seek(Math.max(0, currentTime - 10))}
                        >
                            <SkipBack className="w-6 h-6" />
                        </button>

                        <button
                            onClick={togglePlayback}
                            className={twMerge(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95",
                                isPlaying ? "bg-white text-black" : "bg-cyan-600 text-white shadow-cyan-500/20"
                            )}
                        >
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>

                        <button
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            onClick={() => seek(Math.min(duration, currentTime + 10))}
                        >
                            <SkipForward className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* BPM Control */}
                        <div className="flex items-center gap-4 bg-black/30 p-3 rounded-xl border border-white/5">
                            <div className="flex flex-col items-end min-w-[50px]">
                                <span className="text-xl font-bold text-cyan-400 font-mono">{Math.round(bpm)}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">BPM</span>
                            </div>
                            <input
                                type="range"
                                min="60"
                                max="180"
                                value={bpm}
                                onChange={(e) => setBpm(parseFloat(e.target.value))}
                                className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full transition-all"
                            />
                        </div>

                        {/* Zoom Control */}
                        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                            <div className="flex flex-col items-end min-w-[40px]">
                                <span className="text-sm font-bold text-violet-400 font-mono">{Math.round(zoom * 100)}%</span>
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Zoom</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="4"
                                step="0.5"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full transition-all"
                            />
                        </div>
                    </div>



                    {/* Export Button */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex-1 sm:flex-none text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span>{isExporting ? 'Exporting...' : 'Export Stems'}</span>
                        </button>

                        <button
                            onClick={onReset}
                            className="flex-1 sm:flex-none text-xs text-gray-500 hover:text-white flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
        </div>
    );
};
