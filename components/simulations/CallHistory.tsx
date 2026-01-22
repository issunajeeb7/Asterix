'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CallHistory {
    id: string;
    created_at: string;
    duration: number;
    passed: boolean;
    fail_reason: string | null;
    transcript: Array<{ role: string; message: string; timestamp: number }>;
}

interface CallHistoryProps {
    ageGroup: 'kids' | 'elderly';
    onNewCall: () => void;
}

export default function CallHistory({ ageGroup, onNewCall }: CallHistoryProps) {
    const [history, setHistory] = useState<CallHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState<CallHistory | null>(null);

    useEffect(() => {
        fetchHistory();
    }, [ageGroup]);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`/api/voice-simulation/history?age_group=${ageGroup}`);
            if (response.ok) {
                const { history } = await response.json();
                // Parse transcript if it's a string (JSONB from database)
                const parsedHistory = history.map((call: any) => ({
                    ...call,
                    transcript: typeof call.transcript === 'string'
                        ? JSON.parse(call.transcript)
                        : call.transcript
                }));
                setHistory(parsedHistory);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isKids = ageGroup === 'kids';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className={`${isKids ? 'text-base' : 'text-lg'} text-gray-600`}>Loading history...</p>
                </div>
            </div>
        );
    }

    if (selectedCall) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => setSelectedCall(null)}
                    className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 ${isKids ? 'text-sm' : 'text-base'}`}
                >
                    ← Back to History
                </button>

                <div className={`bg-white rounded-2xl p-6 shadow-lg`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={`font-bold ${isKids ? 'text-lg' : 'text-xl'} text-gray-800`}>
                                Call Details
                            </h3>
                            <p className={`${isKids ? 'text-xs' : 'text-sm'} text-gray-500`}>
                                {formatDate(selectedCall.created_at)} • {formatDuration(selectedCall.duration)}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-semibold ${selectedCall.passed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {selectedCall.passed ? '✅ Passed' : '❌ Failed'}
                        </div>
                    </div>

                    {selectedCall.fail_reason && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className={`${isKids ? 'text-sm' : 'text-base'} text-red-700`}>
                                {selectedCall.fail_reason}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        <h4 className={`font-semibold ${isKids ? 'text-base' : 'text-lg'} text-gray-700 mb-3`}>
                            Conversation Transcript
                        </h4>
                        {selectedCall.transcript.map((msg, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${msg.role === 'agent'
                                ? 'bg-red-50 border-l-4 border-red-500'
                                : 'bg-blue-50 border-l-4 border-blue-500'
                                }`}>
                                <p className={`font-semibold ${isKids ? 'text-xs' : 'text-sm'} ${msg.role === 'agent' ? 'text-red-700' : 'text-blue-700'
                                    }`}>
                                    {msg.role === 'agent' ? '🚨 Scammer' : '👤 You'}
                                </p>
                                <p className={`${isKids ? 'text-sm' : 'text-base'} text-gray-800 mt-1`}>
                                    {msg.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className={`font-bold ${isKids ? 'text-xl' : 'text-2xl'} text-gray-800`}>
                    Call History
                </h2>
                <button
                    onClick={onNewCall}
                    className={`px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 ${isKids
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-base'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-lg'
                        }`}
                >
                    📞 New Call
                </button>
            </div>

            {history.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                    <div className="text-6xl mb-4">📞</div>
                    <h3 className={`font-bold ${isKids ? 'text-lg' : 'text-xl'} text-gray-800 mb-2`}>
                        No Calls Yet
                    </h3>
                    <p className={`${isKids ? 'text-sm' : 'text-base'} text-gray-600 mb-6`}>
                        Start your first scam call simulation to practice staying safe!
                    </p>
                    <button
                        onClick={onNewCall}
                        className={`px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 ${isKids
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-lg'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-xl'
                            }`}
                    >
                        📞 Start First Call
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((call) => (
                        <div
                            key={call.id}
                            onClick={() => setSelectedCall(call)}
                            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${call.passed
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {call.passed ? '✅ Passed' : '❌ Failed'}
                                        </span>
                                        <span className={`${isKids ? 'text-xs' : 'text-sm'} text-gray-500`}>
                                            {formatDate(call.created_at)}
                                        </span>
                                    </div>
                                    <p className={`${isKids ? 'text-sm' : 'text-base'} text-gray-700`}>
                                        Duration: {formatDuration(call.duration)} • {call.transcript.length} messages
                                    </p>
                                </div>
                                <div className="text-gray-400">
                                    →
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
