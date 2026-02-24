import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mixer } from '../components/Mixer';
import { LandingView } from '../components/LandingView';
import { ProcessingView } from '../components/ProcessingView';
import { LibraryView } from '../components/LibraryView';
import type { Metadata, StemsInfo, WaveformsInfo } from '../types/api';

// 1px silent wav base64 - kept for reference
// const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

// Public test file (Creative Commons)
const TEST_AUDIO_URL = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3';

const MOCK_STEMS: StemsInfo = {
    vocals: TEST_AUDIO_URL,
    drums: TEST_AUDIO_URL,
    bass: TEST_AUDIO_URL,
    guitar: TEST_AUDIO_URL,
    piano: TEST_AUDIO_URL,
    other: TEST_AUDIO_URL,
};

const MOCK_METADATA: Metadata = {
    title: 'Debug Mode Track',
    artist: 'Mock Artist',
    duration: 180,
};

// Helper to generate a random waveform SVG data URI (SoundCloud style bars)
const generateMockWaveform = (seed: number, color: string = 'white') => {
    // Generate 50 bars
    let rects = '';
    const gap = 0.5;
    const count = 60;

    for (let i = 0; i < count; i++) {
        const x = i * (100 / count);
        // Random amplitude essentially, centered at 50
        // Use seed for deterministic randomness
        const noise = Math.sin(i * 0.5 + seed * 10) * 0.5 + 0.5; // 0-1
        const random = (Math.sin(i * 132.1 + seed * 123.2) * 43758.5453) % 1; // Pseudo-random 0-1

        let height = 10 + (noise * 50 + random * 30); // Base height + variations
        height = Math.min(90, Math.max(5, height));

        const y = 50 - (height / 2);

        // Create rect
        rects += `<rect x="${x}" y="${y}" width="${100 / count - gap}" height="${height}" fill="${color}" rx="0.5" ry="0.5" opacity="0.8" />`;
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        ${rects}
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const MOCK_WAVEFORMS: WaveformsInfo = {
    vocals: generateMockWaveform(1),
    drums: generateMockWaveform(2),
    bass: generateMockWaveform(3),
    guitar: generateMockWaveform(4),
    piano: generateMockWaveform(5),
    other: generateMockWaveform(6),
};

export const DebugPage = () => {
    const { debugLogin, user, logout } = useAuth();
    const [view, setView] = useState<'landing' | 'processing' | 'mixer' | 'library'>('landing');

    // Auto-login on mount for convenience
    useEffect(() => {
        if (!user) {
            debugLogin();
        }
    }, [user, debugLogin]);

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <div className="fixed top-4 right-4 z-50 bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col gap-2">
                <h1 className="text-xs font-bold uppercase text-gray-500 mb-1">Debug Controls</h1>
                <div className="flex gap-2">
                    <button onClick={() => setView('landing')} className={`px-2 py-1 text-xs rounded ${view === 'landing' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Landing</button>
                    <button onClick={() => setView('processing')} className={`px-2 py-1 text-xs rounded ${view === 'processing' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Processing</button>
                    <button onClick={() => setView('mixer')} className={`px-2 py-1 text-xs rounded ${view === 'mixer' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Mixer</button>
                    <button onClick={() => setView('library')} className={`px-2 py-1 text-xs rounded ${view === 'library' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Library</button>
                </div>
                <div className="h-px bg-gray-700 my-1" />
                <div className="flex gap-2">
                    <button onClick={debugLogin} className="px-2 py-1 text-xs bg-green-900 text-green-200 rounded">Force Login</button>
                    <button onClick={logout} className="px-2 py-1 text-xs bg-red-900 text-red-200 rounded">Logout</button>
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-1">
                    User: {user ? user.email : 'Guest'}
                </div>
            </div>

            <div className="container mx-auto mt-16 border border-dashed border-gray-800 rounded-3xl p-8 min-h-[600px] relative">
                <div className="absolute top-0 left-0 bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded-br-lg font-mono">
                    DEBUG VIEW: {view.toUpperCase()}
                </div>

                {view === 'landing' && (
                    <LandingView
                        onUpload={() => { }}
                        onYoutubeUrlSubmit={() => { }}
                        isUploading={false}
                        error={null}
                        isAuthenticated={true}
                        onLoginRequest={() => { }}
                    />
                )}

                {view === 'processing' && (
                    <ProcessingView
                        status="separating"
                        progress={45}
                        error={null}
                    />
                )}

                {view === 'mixer' && (
                    <Mixer
                        stems={MOCK_STEMS}
                        jobId="debug-job-id"
                        metadata={MOCK_METADATA}
                        waveforms={MOCK_WAVEFORMS} // can pass undefined to test gradient fallback
                        onReset={() => console.log('Reset triggered')}
                    />
                )}

                {view === 'library' && (
                    <div className="text-center text-gray-400 py-20">
                        <LibraryView />
                        <p className="mt-4 text-sm text-yellow-500/50">
                            Note: Library view fetches real data. Ensure backend is running or mock the fetch.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
