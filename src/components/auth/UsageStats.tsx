import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { clsx } from 'clsx';

export function UsageStats() {
    const { user, usage, logout } = useAuth();

    if (!user || !usage) return null;

    const percentUsed = Math.min(100, Math.round((usage.used / usage.limit) * 100));
    const isLimitReached = usage.used >= usage.limit;

    // Tier badge colors
    const tierColors = {
        guest: 'bg-gray-700 text-gray-300',
        verified: 'bg-blue-900/50 text-blue-200 border border-blue-700/50',
        pro: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-500/30'
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium capitalize", tierColors[user.tier])}>
                        {user.tier}
                    </span>
                    <span className="text-sm font-medium text-gray-200">{user.name}</span>
                </div>

                <div className="w-48 bg-gray-800 rounded-full h-2 overflow-hidden relative group" title={`${usage.used} / ${usage.limit} songs used`}>
                    <div
                        className={clsx(
                            "h-full rounded-full transition-all duration-500",
                            isLimitReached ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-blue-600"
                        )}
                        style={{ width: `${percentUsed}%` }}
                    />
                </div>
                <div className="text-xs text-gray-400">
                    <span className={clsx(isLimitReached ? "text-red-400" : "text-gray-400")}>
                        {usage.used}
                    </span>
                    <span className="mx-1">/</span>
                    <span>{usage.limit} songs</span>
                </div>
            </div>

            <div className="h-8 w-[1px] bg-gray-700 mx-2" />

            <button
                onClick={logout}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Logout"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    );
}
