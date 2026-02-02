import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginButton } from '../auth/LoginButton';
import { UsageStats } from '../auth/UsageStats';
import { Menu, X } from 'lucide-react';


// Assuming props are passed down or we refactor fetching logic. 
// For now, let's accept reset callback as prop to avoid circular dependencies if simple.
interface HeaderProps {
    showNewUploadButton: boolean;
    onNewUpload: () => void;
}

export function Header({ showNewUploadButton, onNewUpload }: HeaderProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isHome = location.pathname === '/';

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="relative mb-12 border-b border-gray-800">
            <div className="flex justify-between items-center py-4">
                <Link
                    to="/"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    onClick={() => {
                        onNewUpload();
                        setIsMenuOpen(false);
                    }}
                >
                    <span className="text-xl font-bold tracking-tight text-white">Gitamix</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-white"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {isAuthenticated && !isLoading && (
                        <Link
                            to="/library"
                            className={`text-sm font-medium transition-colors ${location.pathname === '/library' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Library
                        </Link>
                    )}

                    {(!isHome || showNewUploadButton) && (
                        <button
                            onClick={onNewUpload}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            New Upload
                        </button>
                    )}

                    {!isLoading && (
                        <div className="flex items-center">
                            {isAuthenticated ? <UsageStats /> : <LoginButton />}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-gray-800 p-4 flex flex-col gap-4 z-50 animate-in slide-in-from-top-2 duration-200">
                    {isAuthenticated && !isLoading && (
                        <Link
                            to="/library"
                            onClick={() => setIsMenuOpen(false)}
                            className={`px-4 py-2 rounded-lg transition-colors ${location.pathname === '/library' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            Library
                        </Link>
                    )}

                    {(!isHome || showNewUploadButton) && (
                        <button
                            onClick={() => {
                                onNewUpload();
                                setIsMenuOpen(false);
                            }}
                            className="px-4 py-2 text-left rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                        >
                            New Upload
                        </button>
                    )}

                    {!isLoading && (
                        <div className="pt-2 border-t border-gray-800 flex justify-center">
                            {isAuthenticated ? <UsageStats /> : <LoginButton />}
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
