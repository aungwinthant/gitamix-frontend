import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const processedRef = useRef(false);

    useEffect(() => {
        // Backend redirects with ?token=... after completing OAuth
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Auth error:', error);
            alert('Authentication failed');
            navigate('/');
            return;
        }

        if (token && !processedRef.current) {
            processedRef.current = true;
            // Store the token and refresh user data
            localStorage.setItem('token', token);
            refreshUser()
                .then(() => {
                    navigate('/');
                })
                .catch((err) => {
                    console.error('Failed to fetch user after login', err);
                    alert('Login failed. Please try again.');
                    localStorage.removeItem('token');
                    navigate('/');
                });
        } else if (!token) {
            // No token provided, redirect to home
            navigate('/');
        }
    }, [searchParams, refreshUser, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-4" />
            <p className="text-gray-400">Completing login...</p>
        </div>
    );
}
