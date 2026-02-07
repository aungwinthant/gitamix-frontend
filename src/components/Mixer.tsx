import { useState } from 'react';
import { Play, Pause, Loader2, RefreshCcw, SkipBack, SkipForward, Download, Music, FileText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { ChannelStrip } from './ChannelStrip';
import type { StemsInfo, Metadata } from '../types/api';
import { twMerge } from 'tailwind-merge';
import { api } from '../lib/api';

interface MixerProps {
    stems: StemsInfo;
    jobId: string;
    metadata?: Metadata;
    onReset: () => void;
}

export const Mixer = ({ stems, jobId, metadata, onReset }: MixerProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentMetadata, setCurrentMetadata] = useState<Metadata | undefined>(metadata);
    const [showLyrics, setShowLyrics] = useState(false);
    const [showChords, setShowChords] = useState(false);

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

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await api.exportStems(jobId, currentMetadata?.title);
        } catch (error) {
            console.error('Failed to export stems:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await api.generateLyricsAndChords(jobId);
            setCurrentMetadata(prev => ({
                ...prev,
                lyrics: result.lyrics || prev?.lyrics,
                chords: result.chords || prev?.chords,
            }));
            // Auto-expand panels if content was generated
            if (result.lyrics) setShowLyrics(true);
            if (result.chords) setShowChords(true);
        } catch (error) {
            console.error('Failed to generate lyrics and chords:', error);
        } finally {
            setIsGenerating(false);
        }
    };

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
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 space-y-4">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                <h2 className="text-xl font-semibold text-white">Loading Stems...</h2>
                <p className="text-gray-400">Preparing audio engine buffers</p>
            </div>
        );
    }

    // Define channel order for consistent UI
    const ORDER = ['vocals', 'drums', 'bass', 'guitar', 'piano', 'other'];
    const channelKeys = Object.keys(channels).sort((a, b) => {
        const idxA = ORDER.indexOf(a);
        const idxB = ORDER.indexOf(b);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Stems Grid (Top) */}
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden min-h-[400px]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

                <div className="flex flex-wrap justify-center gap-4 md:gap-6 relative z-10">
                    {channelKeys.map((name) => (
                        <ChannelStrip
                            key={name}
                            {...channels[name]}
                            onVolumeChange={(val) => setChannelVolume(name, val)}
                            onMuteToggle={() => toggleMute(name)}
                            onSoloToggle={() => toggleSolo(name)}
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
                            className="w-32 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full transition-all"
                        />
                    </div>

                    {/* Generate Lyrics & Chords Button */}
                    {(!currentMetadata?.lyrics || !currentMetadata?.chords) && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full sm:w-auto text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            <span>{isGenerating ? 'Generating...' : 'Generate Lyrics & Chords'}</span>
                        </button>
                    )}

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full sm:w-auto text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-full sm:w-auto text-xs text-gray-500 hover:text-white flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        <span>Reset Project</span>
                    </button>
                </div>
            </div>

            {/* Lyrics & Chords Panels */}
            {(currentMetadata?.lyrics || currentMetadata?.chords) && (
                <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl mt-6 space-y-4">
                    {/* Lyrics Panel */}
                    {currentMetadata?.lyrics && (
                        <div className="border border-gray-700/50 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setShowLyrics(!showLyrics)}
                                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="font-medium text-white">Lyrics</span>
                                </div>
                                {showLyrics ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                            {showLyrics && (
                                <div className="p-4 bg-black/30">
                                    <pre className="whitespace-pre-wrap text-gray-300 text-sm font-mono leading-relaxed max-h-80 overflow-y-auto">
                                        {currentMetadata.lyrics}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chords Panel */}
                    {currentMetadata?.chords && (
                        <div className="border border-gray-700/50 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setShowChords(!showChords)}
                                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <Music className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="font-medium text-white">Chord Progression</span>
                                </div>
                                {showChords ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                            {showChords && (
                                <div className="p-4 bg-black/30">
                                    <pre className="whitespace-pre-wrap text-gray-300 text-sm font-mono leading-relaxed max-h-80 overflow-y-auto">
                                        {currentMetadata.chords}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};
