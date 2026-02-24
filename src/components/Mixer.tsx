import { useRef, useEffect, useState, useCallback, memo } from 'react';
import Playlist from 'waveform-playlist';
import type { StemsInfo, Metadata, WaveformsInfo } from '../types/api';
import 'waveform-playlist/styles/playlist.css';
import './Mixer.css'; // Custom overrides
import { MixerSkeleton } from './ui/SkeletonLoader';

// Helper for formatting time
const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours().toString().padStart(2, '0');
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${hh}:${mm}:${ss}.${ms}`;
};

// Isolated Time Display component to prevent full Mixer re-renders
const TimeDisplay = memo(({ ee }: { ee: any }) => {
    const [currentTime, setCurrentTime] = useState('00:00:00.000');

    useEffect(() => {
        if (!ee) return;
        const handleTimeUpdate = (time: number) => {
            setCurrentTime(formatTime(time));
        };
        ee.on('timeupdate', handleTimeUpdate);
        return () => ee.off('timeupdate', handleTimeUpdate);
    }, [ee]);

    return (
        <div className="font-mono text-xl text-cyan-400 min-w-[140px] text-center bg-black/50 rounded px-2 py-1 border border-white/10">
            {currentTime}
        </div>
    );
});

TimeDisplay.displayName = 'TimeDisplay';

// Isolated Volume Control component
const VolumeControl = memo(({ volume, onVolumeChange, ee }: { volume: number, onVolumeChange: (val: number) => void, ee: any }) => {
    return (
        <div className="flex items-center gap-3 text-sm text-gray-400 bg-black/30 px-3 py-1.5 rounded border border-white/5">
            <span className="font-medium">Master Volume</span>
            <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onVolumeChange(val);
                    ee?.emit('mastervolumechange', val);
                }}
                className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>
    );
});

VolumeControl.displayName = 'VolumeControl';

interface MixerProps {
    stems: StemsInfo;
    jobId: string;
    metadata?: Metadata;
    waveforms?: WaveformsInfo;
    onReset: () => void;
}

// Uniform soft peak color for all stems
const STEM_COLORS: Record<string, string> = {
    vocals: '#cbd5e1',
    drums: '#cbd5e1',
    bass: '#cbd5e1',
    other: '#cbd5e1',
    guitar: '#cbd5e1',
    piano: '#cbd5e1',
};

export const Mixer = ({ stems, metadata }: MixerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playlistRef = useRef<any>(null);

    // Filtered state - only what's needed for the top-level
    const [masterVolume, setMasterVolume] = useState(100);
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const recordingStream = useRef<MediaStream | null>(null);
    const draggedIndex = useRef<number | null>(null);
    const [eventEmitter, setEventEmitter] = useState<any>(null);

    // Sync auto-scroll state with playlist
    useEffect(() => {
        if (playlistRef.current) {
            playlistRef.current.getEventEmitter().emit('automaticscroll', isAutoScroll);
        }
    }, [isAutoScroll]);

    useEffect(() => {
        if (!containerRef.current || playlistRef.current) return;

        const playlist = Playlist({
            samplesPerPixel: 3000,
            waveHeight: 140,
            container: containerRef.current,
            state: 'cursor',
            colors: {
                waveOutlineColor: 'white',
                timeColor: 'white',
                fadeColor: 'black'
            },
            controls: {
                show: true,
                width: 200,
                widgets: {
                    muteOrSolo: true,
                    volume: true,
                    stereoPan: true,
                    collapse: true,
                    remove: true
                }
            },
            zoomLevels: [1000, 3000, 5000, 10000],
            timescale: true,
            isAutomaticScroll: isAutoScroll
        });

        playlistRef.current = playlist;

        playlist.getEventEmitter().emit('automaticscroll', isAutoScroll);

        const loadStemsAndInit = async () => {
            try {
                const stemEntries = Object.entries(stems);

                const trackPromises = stemEntries.map(async ([name, url]) => {
                    const blobUrl = await import('../lib/api').then(m => m.fetchStemAsBlob(url));
                    return {
                        src: blobUrl,
                        name: name,
                        waveOutlineColor: STEM_COLORS[name] || '#ffffff',
                        customClass: `stem-${name}`
                    };
                });

                const loadedTracks = await Promise.all(trackPromises);

                playlist.load(loadedTracks).then(() => {
                    console.log('Playlist loaded');
                    playlist.getEventEmitter().emit('mastervolumechange', 100);
                    updateTrackWidth();
                    setIsLoading(false);
                });
            } catch (error) {
                console.error("Failed to load stems:", error);
            }
        };

        const styleTag = document.createElement('style');
        styleTag.id = 'mixer-scrolling-fix';
        document.head.appendChild(styleTag);

        const updateTrackWidth = () => {
            if (!playlist) return;
            const p = playlist as any;
            const spp = p.samplesPerPixel || 1000;
            const sr = p.sampleRate || 44100;
            const dur = p.duration || 0;

            const wavePixels = Math.ceil(dur * sr / spp);

            // The CSS now handles Flex/Sticky layout. 
            // We only need to ensure the waveform has explicit pixels for scroll overflow.
            styleTag.textContent = `
                .playlist .waveform { 
                    width: ${wavePixels}px !important; 
                }
            `;
            console.log(`[Mixer] Waveform width set: ${wavePixels}px`);
        };

        const ee = playlist.getEventEmitter();
        setEventEmitter(ee);

        ee.on('zoomin', () => setTimeout(updateTrackWidth, 50));
        ee.on('zoomout', () => setTimeout(updateTrackWidth, 50));

        loadStemsAndInit();

        if (metadata) {
            console.log(`Loaded stems for ${metadata.title} by ${metadata.artist}`);
        }

        return () => {
            if (playlist) playlist.stop();
            styleTag.remove();
            if (recordingStream.current) {
                recordingStream.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [stems, metadata]);

    // Memoized Toolbar handlers
    const handlePlay = useCallback(() => playlistRef.current?.play(), []);
    const handlePause = useCallback(() => playlistRef.current?.pause(), []);
    const handleStop = useCallback(() => playlistRef.current?.stop(), []);
    const handleZoomIn = useCallback(() => playlistRef.current?.getEventEmitter().emit('zoomin'), []);
    const handleZoomOut = useCallback(() => playlistRef.current?.getEventEmitter().emit('zoomout'), []);

    const handleRecord = useCallback(async () => {
        if (!playlistRef.current) return;

        if (isRecording) {
            playlistRef.current.getEventEmitter().emit('stop');
            if (recordingStream.current) {
                recordingStream.current.getTracks().forEach(track => track.stop());
                recordingStream.current = null;
            }
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                recordingStream.current = stream;
                playlistRef.current.initRecorder(stream);
                playlistRef.current.getEventEmitter().emit('record');
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone access denied:", err);
                alert("Please allow microphone access to record.");
            }
        }
    }, [isRecording]);

    // Drag and Drop Handlers for Reordering
    const handleDragStart = (e: React.DragEvent) => {
        const target = (e.target as HTMLElement).closest('.channel-wrapper');
        if (!target || !containerRef.current || !playlistRef.current) return;

        const allTracks = Array.from(containerRef.current.querySelectorAll('.channel-wrapper'));
        const index = allTracks.indexOf(target);
        if (index !== -1) {
            draggedIndex.current = index;
            target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const target = (e.target as HTMLElement).closest('.channel-wrapper');
        if (!target || draggedIndex.current === null) return;

        // Visual feedback - clear others first
        if (containerRef.current) {
            containerRef.current.querySelectorAll('.channel-wrapper').forEach(t => t.classList.remove('drag-over'));
        }
        target.classList.add('drag-over');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const target = (e.target as HTMLElement).closest('.channel-wrapper');
        if (target) target.classList.remove('drag-over');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const target = (e.target as HTMLElement).closest('.channel-wrapper');
        if (!target || !containerRef.current || !playlistRef.current || draggedIndex.current === null) return;

        target.classList.remove('drag-over');
        const allTracks = Array.from(containerRef.current.querySelectorAll('.channel-wrapper'));
        const dropIndex = allTracks.indexOf(target);

        if (dropIndex !== -1 && dropIndex !== draggedIndex.current) {
            const tracks = playlistRef.current.tracks;
            const item = tracks.splice(draggedIndex.current, 1)[0];
            tracks.splice(dropIndex, 0, item);

            // Force internal redraw of the library
            playlistRef.current.draw(playlistRef.current.render());
        }

        allTracks.forEach(t => t.classList.remove('dragging', 'drag-over'));
        draggedIndex.current = null;
    };

    const handleDragEnd = () => {
        if (!containerRef.current) return;
        const allTracks = Array.from(containerRef.current.querySelectorAll('.channel-wrapper'));
        allTracks.forEach(t => t.classList.remove('dragging', 'drag-over'));
        draggedIndex.current = null;
    };

    // Just-in-time Draggable attribute setting
    const handleMouseOver = (e: React.MouseEvent) => {
        const target = (e.target as HTMLElement).closest('.channel-wrapper');
        if (target && target.getAttribute('draggable') !== 'true') {
            target.setAttribute('draggable', 'true');
        }
    };

    // Spacebar play/pause toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                if (playlistRef.current) {
                    if (playlistRef.current.isPlaying()) {
                        playlistRef.current.pause();
                    } else {
                        playlistRef.current.play();
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden bg-gray-950">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-50">
                    <MixerSkeleton />
                </div>
            )}

            <div className={`flex flex-col h-full w-full text-white transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {/* Toolbar matching Stem Tracks Example */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900 border-b border-gray-800 shadow-lg">

                    {/* Transport Controls */}
                    <div className="flex gap-1">
                        <button onClick={handlePlay} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold uppercase transition-colors shadow-sm">Play</button>
                        <button onClick={handlePause} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold uppercase transition-colors shadow-sm">Pause</button>
                        <button onClick={handleStop} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold uppercase transition-colors shadow-sm">Stop</button>
                    </div>

                    {/* Record Control */}
                    <div>
                        <button
                            onClick={handleRecord}
                            className={`group px-4 py-2 rounded text-sm font-bold uppercase transition-all shadow-sm flex items-center gap-2 ${isRecording
                                ? 'bg-red-600 hover:bg-red-500 animate-pulse'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                            {isRecording ? 'Stop Recording' : 'Record'}
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex gap-1">
                        <button onClick={handleZoomIn} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold uppercase transition-colors shadow-sm">Zoom In</button>
                        <button onClick={handleZoomOut} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold uppercase transition-colors shadow-sm">Zoom Out</button>
                    </div>

                    {/* Time Display - Isolated for performance */}
                    <TimeDisplay ee={eventEmitter} />

                    {/* Master Volume - Isolated */}
                    <VolumeControl
                        volume={masterVolume}
                        onVolumeChange={setMasterVolume}
                        ee={eventEmitter}
                    />

                    {/* Auto Scroll */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            id="autoscroll"
                            checked={isAutoScroll}
                            onChange={(e) => {
                                setIsAutoScroll(e.target.checked);
                                // If library supports automaticScroll option update, we'd do it here.
                                // Otherwise this is just visual state for now unless we wrap the internal scroll logic.
                                // waveform-playlist defaults to auto-scroll usually.
                            }}
                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                        />
                        <label htmlFor="autoscroll" className="cursor-pointer font-medium">Automatic Scroll</label>
                    </div>
                </div>

                <div className="relative flex-grow overflow-hidden">

                    {/* Playlist Container - Height managed to fill remaining space */}
                    <div
                        ref={containerRef}
                        className="playlist-container w-full h-full overflow-hidden bg-gray-900 shadow-inner relative"
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        onMouseOver={handleMouseOver}
                    >
                        {/* Background texture or pattern could go here if supported via CSS on container */}
                    </div>
                </div>
            </div>
        </div>
    );
};
