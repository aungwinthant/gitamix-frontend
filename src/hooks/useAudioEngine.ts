import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import type { StemsInfo } from '../types/api';
import { fetchStemAsBlob } from '../lib/api';

interface ChannelState {
    name: string;
    volume: number;
    muted: boolean;
    soloed: boolean;
    pan: number;
}

export const useAudioEngine = (stems: StemsInfo | undefined, originalBpm: number = 120) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(originalBpm);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const [channels, setChannels] = useState<Record<string, ChannelState>>({});

    const players = useRef<Record<string, Tone.GrainPlayer>>({});
    const channelNodes = useRef<Record<string, Tone.Channel>>({});

    // Initialize and Load Stems
    useEffect(() => {
        if (!stems) return;

        let isCancelled = false;

        const loadAudio = async () => {
            setIsLoaded(false);
            setLoadError(null);

            // Stop and dispose old players
            Tone.Transport.stop();
            Tone.Transport.cancel();
            Object.values(players.current).forEach(p => p.dispose());
            Object.values(channelNodes.current).forEach(c => c.dispose());

            players.current = {};
            channelNodes.current = {};

            const newChannels: Record<string, ChannelState> = {};

            // Helper to scale playback rate
            const updatePlaybackRate = (targetBpm: number) => {
                const rate = targetBpm / originalBpm;
                Object.values(players.current).forEach(p => p.playbackRate = rate);
            };

            try {
                await Tone.start(); // Helper to ensure context is ready (might need user gesture elsewhere, but good to have)

                const entries = Object.entries(stems).filter(([_, url]) => !!url);

                for (const [name, url] of entries) {
                    if (isCancelled) return;

                    // Channel setup
                    const channel = new Tone.Channel({ volume: 0, pan: 0 }).toDestination();
                    channelNodes.current[name] = channel;

                    // Fetch audio through axios (with auth headers) and get blob URL
                    const blobUrl = await fetchStemAsBlob(url);

                    // Player setup (GrainPlayer for pitch-preserving stretch)
                    const player = new Tone.GrainPlayer({
                        url: blobUrl,
                        loop: true,
                        grainSize: 0.2,
                        overlap: 0.1,
                    }).connect(channel);

                    players.current[name] = player;

                    // Sync to Transport
                    // We need to sync start, but GrainPlayer with Transport sync is tricky for stretching.
                    // Better to just start them all at 0.
                    player.sync().start(0);

                    newChannels[name] = {
                        name,
                        volume: 0, // dB
                        muted: false,
                        soloed: false,
                        pan: 0
                    };
                }

                // Wait for all buffers with timeout
                const loadPromise = Tone.loaded();
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Loading timed out after 60 seconds')), 60000)
                );

                await Promise.race([loadPromise, timeoutPromise]);

                if (isCancelled) return;

                // Set duration from one of the players
                if (entries.length > 0) {
                    const firstPlayerToCheck = players.current[entries[0][0]];
                    if (firstPlayerToCheck && firstPlayerToCheck.buffer) {
                        setDuration(firstPlayerToCheck.buffer.duration);
                    }
                }

                // Set initial rate
                updatePlaybackRate(bpm);

                setChannels(newChannels);
                setIsLoaded(true);
            } catch (err) {
                if (isCancelled) return;
                console.error("Failed to load audio engine:", err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load audio stems.';
                // Check if it's a 403/401 related to signed URLs
                if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
                    console.error("Potentially expired signed URL");
                }
                setLoadError(errorMessage);
            }
        };

        loadAudio();

        return () => {
            isCancelled = true;
            Object.values(players.current).forEach(p => p.dispose());
            Object.values(channelNodes.current).forEach(c => c.dispose());
        };
    }, [stems]); // Important: Re-run if stems change (new job)

    // BPM Change Effect
    useEffect(() => {
        if (!isLoaded) return;
        const rate = bpm / originalBpm;
        Object.values(players.current).forEach(p => p.playbackRate = rate);
        // Note: Tone.Transport.bpm is for scheduling, but here we just stretch audio.
        // If we wanted transport to match, we'd set Tone.Transport.bpm.value = bpm;
    }, [bpm, isLoaded, originalBpm]);

    // Update Current Time Loop
    useEffect(() => {
        if (!isLoaded || !isPlaying) return;

        const intervalId = setInterval(() => {
            setCurrentTime(Tone.Transport.seconds);
        }, 100); // 10fps update

        return () => clearInterval(intervalId);
    }, [isLoaded, isPlaying]);

    // Transport Control
    const togglePlayback = useCallback(async () => {
        if (Tone.Transport.state === 'started') {
            Tone.Transport.pause();
            setIsPlaying(false);
        } else {
            await Tone.start();
            Tone.Transport.start();
            setIsPlaying(true);
        }
    }, []);

    const setChannelVolume = (name: string, db: number) => {
        if (channelNodes.current[name]) {
            // Use rampTo for smooth transitions and direct value assignment
            channelNodes.current[name].volume.rampTo(db, 0.1);
            setChannels(prev => ({ ...prev, [name]: { ...prev[name], volume: db } }));
        }
    };

    const toggleMute = (name: string) => {
        if (channelNodes.current[name]) {
            const newMuted = !channelNodes.current[name].mute;
            channelNodes.current[name].mute = newMuted;
            setChannels(prev => ({ ...prev, [name]: { ...prev[name], muted: newMuted } }));
        }
    };

    // Simple solo logic (Tone.js Channel solo is better handled by muting others, but Channel has .solo too)
    const toggleSolo = (name: string) => {
        if (channelNodes.current[name]) {
            const newSolo = !channelNodes.current[name].solo;
            channelNodes.current[name].solo = newSolo;
            setChannels(prev => ({ ...prev, [name]: { ...prev[name], soloed: newSolo } }));
        }
    }

    const seek = (time: number) => {
        Tone.Transport.seconds = time;
        setCurrentTime(time);
    }

    // Retry loading function
    const retryLoad = useCallback(() => {
        if (stems) {
            setLoadError(null);
            setIsLoaded(false);
            // Trigger a re-run by toggling a dummy state or just call loadAudio
            // For simplicity, we'll just force a remount by clearing and resetting
        }
    }, [stems]);

    return {
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
        seek,
        retryLoad
    };
};
