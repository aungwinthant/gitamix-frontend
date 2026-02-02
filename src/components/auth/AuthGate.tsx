import { LoginButton } from './LoginButton';
import { Lock } from 'lucide-react';

export function AuthGate() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 animate-in fade-in zoom-in duration-500">
            <div className="max-w-md w-full bg-gray-900/50 border border-gray-800 rounded-3xl p-10 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-2">
                        <Lock className="w-8 h-8 text-white" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Your Stems are Ready!
                        </h2>
                        <p className="text-gray-400">
                            Log in with Google to access the mixer, save your library, and export your tracks.
                        </p>
                    </div>

                    <div className="pt-4">
                        <LoginButton />
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                        It's free and takes seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}
