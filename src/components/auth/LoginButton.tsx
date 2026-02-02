import { useAuth } from '../../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export function LoginButton() {
    const { loginWithGoogle } = useAuth();

    return (
        <button
            onClick={loginWithGoogle}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg shadow-cyan-900/20 font-medium"
        >
            <LogIn className="w-4 h-4" />
            <span>Login with Google</span>
        </button>
    );
}
