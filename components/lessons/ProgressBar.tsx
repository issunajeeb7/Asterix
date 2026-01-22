'use client';

interface ProgressBarProps {
    current: number;
    total: number;
    isKids?: boolean;
}

export default function ProgressBar({ current, total, isKids = true }: ProgressBarProps) {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className={`font-bold ${isKids ? 'text-sm text-orange-600' : 'text-base text-green-600'}`}>
                    {current}/{total} Questions
                </span>
                <span className={`font-bold ${isKids ? 'text-sm text-orange-600' : 'text-base text-green-600'}`}>
                    {percentage}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 rounded-full ${isKids
                            ? 'bg-gradient-to-r from-orange-400 to-red-500'
                            : 'bg-gradient-to-r from-green-400 to-emerald-600'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
