import { X } from 'lucide-react';
import { LoginButton } from './LoginButton';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Login Required</h2>
                        <p className="text-gray-400">
                            Please login with Google to upload and process your tracks.
                            It's free and helps us save your work.
                        </p>
                    </div>

                    <LoginButton />
                </div>
            </div>
        </div>
    );
}
