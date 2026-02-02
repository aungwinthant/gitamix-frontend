import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { User, UsageInfo } from '../types/api';

interface AuthContextType {
    user: User | null;
    usage: UsageInfo | null;
    canProcess: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    loginWithGoogle: () => Promise<void>;
    handleCallback: (code: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [canProcess, setCanProcess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const data = await api.getCurrentUser();
            setUser(data.user);
            setUsage(data.usage);
            setCanProcess(data.can_process);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // If fetching user fails (e.g. 401), we consider them logged out
            api.logout();
            setUser(null);
            setUsage(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            refreshUser();
        } else {
            setIsLoading(false);
        }
    }, [refreshUser]);

    const loginWithGoogle = async () => {
        try {
            const url = await api.getGoogleAuthUrl();
            window.location.href = url;
        } catch (error) {
            console.error('Failed to start login:', error);
            alert('Failed to initialize login. Please try again.');
        }
    };

    const handleCallback = async (code: string) => {
        setIsLoading(true);
        try {
            const response = await api.loginWithGoogle(code);
            setUser(response.user);
            // After login, we should probably fetch full details or just rely on the response if it has everything
            // But getting current user ensures we have usage info too if not in auth response (AuthResponse has User, but maybe not usage)
            // Let's call refreshUser to be safe and get usage info
            await refreshUser();
        } catch (error) {
            console.error('Login callback failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const navigate = useNavigate();

    const logout = () => {
        api.logout();
        setUser(null);
        setUsage(null);
        setCanProcess(false);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            usage,
            canProcess,
            isAuthenticated: !!user,
            isLoading,
            loginWithGoogle,
            handleCallback,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
