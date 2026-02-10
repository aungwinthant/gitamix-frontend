import { useRef, useEffect, useState } from 'react';
import Playlist from 'waveform-playlist';
import type { StemsInfo, Metadata, WaveformsInfo } from '../types/api';
import 'waveform-playlist/styles/playlist.css';
import './Mixer.css'; // Custom overrides

interface MixerProps {
    stems: StemsInfo;
    jobId: string;
    metadata?: Metadata;
    waveforms?: WaveformsInfo;
    onReset: () => void;
}

export const Mixer = ({ stems, metadata }: MixerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playlistRef = useRef<any>(null);

    // Toolbar state
    const [currentTime, setCurrentTime] = useState('00:00:00.000');
    const [masterVolume, setMasterVolume] = useState(100);
    const [isAutoScroll, setIsAutoScroll] = useState(true);

    // Sync auto-scroll state with playlist
    useEffect(() => {
        if (playlistRef.current) {
            playlistRef.current.getEventEmitter().emit('automaticscroll', isAutoScroll);
        }
    }, [isAutoScroll]);

    useEffect(() => {
        if (!containerRef.current || playlistRef.current) return;

        const playlist = Playlist({
            samplesPerPixel: 1000,
            waveHeight: 140, // Increased to fit controls with padding
            container: containerRef.current,
            state: 'cursor',
            colors: {
                waveOutlineColor: 'transparent',
                timeColor: '#9CA3AF',
                fadeColor: 'black'
            },
            controls: {
                show: true,
                width: 200 // Width of the control panel on the left
            },
            zoomLevels: [500, 1000, 3000, 5000],
            isAutomaticScroll: isAutoScroll // Attempt to set initial state if supported
        });

        playlistRef.current = playlist;

        // Ensure autoscroll is set correctly after initialization
        playlist.getEventEmitter().emit('automaticscroll', isAutoScroll);

        // Vibrant colors for stems
        // Vibrant colors for stems (with opacity for Landr-like feel)
        // Retro-themed colors for stems
        const COMPONENT_COLORS: Record<string, string> = {
            vocals: '#FF6B6B', // Retro Red/Coral
            drums: '#4ECDC4',  // Retro Teal
            drums_2: '#45B7D1', // Retro Blue
            bass: '#FFE66D',   // Retro Yellow
            other: '#9D65C9',  // Retro Purple
            guitar: '#FF9F43', // Retro Orange
            piano: '#88D8B0',  // Retro Green
        };
        const DEFAULT_COLOR = '#ffffff';

        // Load tracks
        // Pre-fetch stems as blobs to handle authentication
        const loadStemsAndInit = async () => {
            try {
                // Remove filter to include guitar and piano
                const stemEntries = Object.entries(stems);

                const trackPromises = stemEntries.map(async ([name, url]) => {
                    // Use the api utility to fetch with auth headers if needed
                    const blobUrl = await import('../lib/api').then(m => m.fetchStemAsBlob(url));
                    return {
                        src: blobUrl,
                        name: name,
                        waveOutlineColor: COMPONENT_COLORS[name] || DEFAULT_COLOR
                    };
                });

                const loadedTracks = await Promise.all(trackPromises);

                playlist.load(loadedTracks).then(() => {
                    console.log('Playlist loaded');
                    playlist.getEventEmitter().emit('mastervolumechange', 100);
                });
            } catch (error) {
                console.error("Failed to load stems:", error);
            }
        };

        loadStemsAndInit();

        if (metadata) {
            console.log(`Loaded stems for ${metadata.title} by ${metadata.artist}`);
        }

        const ee = playlist.getEventEmitter();
        ee.on('timeupdate', (time: number) => {
            setCurrentTime(formatTime(time));
        });

        // Clean up on unmount
        return () => {
            // playlist.destroy() if available or just let ref cleanup
        };

    }, [stems, metadata]);

    // Handle sticky controls via JS transform to work around waveform-playlist DOM structure
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let animationFrameId: number;

        const handleScroll = () => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const scrollLeft = container.scrollLeft;
                // Select all controls within this container and apply transform
                // This effectively pins them to the left edge of the visible area
                const controls = container.querySelectorAll('.controls');
                controls.forEach((el) => {
                    (el as HTMLElement).style.transform = `translateX(${scrollLeft}px)`;
                });
            });
        };

        container.addEventListener('scroll', handleScroll);
        // Initial sync in case of restored scroll position
        handleScroll();

        return () => {
            container.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }); // Run on every render/update to ensure new controls are caught?
    // Actually, controls are created by playlist.load().
    // We should probably depend on something that changes when playlist re-renders.
    // But since handleScroll is event-driven, it catches elements that exist at that moment.
    // If elements are replaced, they lose the transform until next scroll.
    // To be safe, we can trigger handleScroll() inside the loadStemsAndInit completion or rely on user scroll.
    // Adding no dependency array might be too frequent if other state updates.
    // Let's use empty dependency array but add a MutationObserver if needed.
    // For now, let's try with empty dependency array and see if it works for scrolling.
    // If zooming re-renders, user usually scrolls/pans which triggers scroll event.


    // Format time helper
    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours().toString().padStart(2, '0');
        const mm = date.getUTCMinutes().toString().padStart(2, '0');
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
        return `${hh}:${mm}:${ss}.${ms}`;
    };

    // Toolbar handlers
    const handlePlay = () => playlistRef.current && playlistRef.current.play();
    const handlePause = () => playlistRef.current && playlistRef.current.pause();
    const handleStop = () => playlistRef.current && playlistRef.current.stop();
    const handleZoomIn = () => playlistRef.current && playlistRef.current.getEventEmitter().emit('zoomin');
    const handleZoomOut = () => playlistRef.current && playlistRef.current.getEventEmitter().emit('zoomout');

    return (
        <div className="flex flex-col h-full w-full bg-gray-950 text-white">
            {/* Toolbar matching Stem Tracks Example */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900 border-b border-gray-800 shadow-lg">

                {/* Transport Controls */}
                <div className="flex gap-1">
                    <button onClick={handlePlay} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold uppercase transition-colors shadow-sm">Play</button>
                    <button onClick={handlePause} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold uppercase transition-colors shadow-sm">Pause</button>
                    <button onClick={handleStop} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold uppercase transition-colors shadow-sm">Stop</button>
                </div>

                {/* Zoom Controls */}
                <div className="flex gap-1">
                    <button onClick={handleZoomIn} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold uppercase transition-colors shadow-sm">Zoom In</button>
                    <button onClick={handleZoomOut} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold uppercase transition-colors shadow-sm">Zoom Out</button>
                </div>

                {/* Time Display */}
                <div className="font-mono text-xl text-cyan-400 min-w-[140px] text-center bg-black/50 rounded px-2 py-1 border border-white/10">
                    {currentTime}
                </div>

                {/* Master Volume */}
                <div className="flex items-center gap-3 text-sm text-gray-400 bg-black/30 px-3 py-1.5 rounded border border-white/5">
                    <span className="font-medium">Master Volume</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={masterVolume}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setMasterVolume(val);
                            playlistRef.current?.getEventEmitter().emit('mastervolumechange', val);
                        }}
                        className="w-32 accent-amber-500 cursor-pointer"
                    />
                </div>

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

            {/* Playlist Container - Height managed to fill remaining space */}
            <div
                ref={containerRef}
                className="playlist-container w-full flex-grow overflow-auto border border-gray-800 rounded-lg bg-gray-900 shadow-inner relative"
            >
                {/* Background texture or pattern could go here if supported via CSS on container */}
            </div>
        </div>
    );
};
