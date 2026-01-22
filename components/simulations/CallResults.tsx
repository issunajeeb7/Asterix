'use client';

import { useRouter } from 'next/navigation';

interface CallResultsProps {
    ageGroup: 'kids' | 'elderly';
    evaluation: {
        success: boolean;
        feedback: string;
        actionTaken: string;
    };
    transcript: Array<{ role: string; message: string; timestamp: number }>;
    duration: number;
    xpAwarded: number;
    onBackToHistory: () => void;
}

export default function CallResults({
    ageGroup,
    evaluation,
    transcript,
    duration,
    xpAwarded,
    onBackToHistory
}: CallResultsProps) {
    const isKids = ageGroup === 'kids';

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* Header - Compact */}
            <div className="text-center">
                <div className="text-5xl mb-2">{evaluation.success ? '🎉' : '📚'}</div>
                <h1 className={`font-bold ${isKids ? 'text-2xl' : 'text-3xl'} text-gray-800`}>
                    {evaluation.success ? 'You Passed!' : 'Keep Learning'}
                </h1>
                <p className={`${isKids ? 'text-sm' : 'text-base'} text-gray-600`}>
                    {formatDuration(duration)}
                </p>
            </div>

            {/* Result Card - Compact */}
            <div className={`p-4 rounded-xl border-2 ${evaluation.success
                    ? 'bg-green-50 border-green-500'
                    : 'bg-orange-50 border-orange-500'
                }`}>
                <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">{evaluation.success ? '✅' : '⚠️'}</div>
                    <div className="flex-1 min-w-0">
                        <p className={`${isKids ? 'text-sm' : 'text-base'} ${evaluation.success ? 'text-green-800' : 'text-orange-800'
                            } mb-2`}>
                            {evaluation.feedback}
                        </p>
                        {xpAwarded > 0 && (
                            <div className="inline-block px-3 py-1 bg-white rounded-lg text-sm font-semibold text-green-700">
                                +{xpAwarded} XP 🌟
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Key Takeaways - Compact */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className={`font-bold ${isKids ? 'text-base' : 'text-lg'} text-blue-800 mb-2 flex items-center gap-2`}>
                    💡 Remember
                </h3>
                <ul className={`list-disc list-inside space-y-1 ${isKids ? 'text-xs' : 'text-sm'} text-blue-700`}>
                    {evaluation.success ? (
                        <>
                            <li>You recognized the scam tactics</li>
                            <li>You protected your information</li>
                        </>
                    ) : (
                        <>
                            <li>Never share personal info on unexpected calls</li>
                            <li>Hang up and verify through official numbers</li>
                            <li>It's okay to say "no" and check independently</li>
                        </>
                    )}
                </ul>
            </div>

            {/* Conversation Transcript - Compact */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h3 className={`font-bold ${isKids ? 'text-base' : 'text-lg'} text-gray-800 mb-3 flex items-center gap-2`}>
                    📝 Conversation
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {transcript.map((msg, idx) => (
                        <div key={idx} className={`p-2 rounded-lg text-sm ${msg.role === 'agent'
                                ? 'bg-red-50 border-l-2 border-red-400'
                                : 'bg-blue-50 border-l-2 border-blue-400'
                            }`}>
                            <p className={`font-semibold text-xs mb-1 ${msg.role === 'agent' ? 'text-red-700' : 'text-blue-700'
                                }`}>
                                {msg.role === 'agent' ? '🚨 Scammer' : '👤 You'}
                            </p>
                            <p className={`${isKids ? 'text-xs' : 'text-sm'} text-gray-800`}>
                                {msg.message}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions - Compact */}
            <div className="flex gap-3 justify-center pt-2">
                <button
                    onClick={onBackToHistory}
                    className={`px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all ${isKids ? 'text-sm' : 'text-base'
                        }`}
                >
                    ← Back
                </button>
                <button
                    onClick={onBackToHistory}
                    className={`px-6 py-2 text-white rounded-lg font-semibold transition-all ${isKids
                            ? 'bg-purple-600 hover:bg-purple-700 text-sm'
                            : 'bg-green-600 hover:bg-green-700 text-base'
                        }`}
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
