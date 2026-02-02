import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { handleCallback } = useAuth();
    const navigate = useNavigate();
    const processedRef = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            console.error('Auth error:', error);
            alert('Authentication failed');
            navigate('/');
            return;
        }

        if (code && !processedRef.current) {
            processedRef.current = true;
            handleCallback(code)
                .then(() => {
                    navigate('/');
                })
                .catch((err) => {
                    console.error('Failed to handle callback', err);
                    alert('Login failed. Please try again.');
                    navigate('/');
                });
        } else if (!code) {
            navigate('/');
        }
    }, [searchParams, handleCallback, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-4" />
            <p className="text-gray-400">Completing login...</p>
        </div>
    );
}
