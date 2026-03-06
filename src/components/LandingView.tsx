import { UploadView } from './UploadView';
import { Music, Mic2, Layers, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface LandingViewProps {
    onUpload: (file: File) => void;
    isUploading: boolean;
    error: Error | null;
    isAuthenticated: boolean;
    onLoginRequest: () => void;
}

export function LandingView(props: LandingViewProps) {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full">
                    <UploadView {...props} />
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-4 py-24 border-t border-gray-800">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-100 to-gray-400 mb-4">
                        The Ultimate AI Audio Toolkit
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Separate stems, detect chords, and master your tracks with professional-grade AI models.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            icon: Layers,
                            title: "Stem Separation",
                            description: "Isolate vocals, drums, bass, and instruments with high-fidelity Demucs AI."
                        },
                        {
                            icon: Music,
                            title: "Smart Metronome",
                            description: "Automatically detect BPM and generate a synchronized click track for practice."
                        },
                        {
                            icon: Mic2,
                            title: "Vocal Removal",
                            description: "Create perfect karaoke tracks by removing vocals while keeping background music intact."
                        },
                        {
                            icon: Zap,
                            title: "Chord Detection",
                            description: "Real-time AI analysis identifies chord progressions as the song plays."
                        },
                        {
                            icon: ArrowRight,
                            title: "Key Detection",
                            description: "Instantly find the musical key of any track to help with remixing."
                        },
                        {
                            icon: CheckCircle2,
                            title: "High Quality Export",
                            description: "Download individual stems or custom mixes in lossless WAV format."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-cyan-500/30 transition-all duration-300 hover:bg-gray-800/80 group">
                            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                                <feature.icon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How it Works */}
            <div className="container mx-auto px-4 py-24 text-center">
                <h2 className="text-3xl font-bold text-gray-100 mb-16">How Gitamix Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    {[
                        { step: "01", title: "Upload", desc: "Drop any audio file (MP3, WAV, MA4)" },
                        { step: "02", title: "Process", desc: "AI separates instruments in seconds" },
                        { step: "03", title: "Mix & Export", desc: "Adjust levels and download stems" }
                    ].map((item, i) => (
                        <div key={i} className="relative">
                            <div className="text-8xl font-bold text-gray-700/50 mb-4">{item.step}</div>
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">{item.title}</h3>
                            <p className="text-gray-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-12 bg-black">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Gitamix. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
