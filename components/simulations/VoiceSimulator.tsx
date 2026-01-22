'use client';

import { useState, useRef, useEffect } from 'react';
import { Conversation } from '@11labs/client';

interface TranscriptMessage {
    role: 'agent' | 'user';
    message: string;
    timestamp: number;
}

interface VoiceSimulatorProps {
    ageGroup: 'kids' | 'elderly';
    onComplete: (result: {
        passed: boolean;
        xpAwarded: number;
        evaluation: {
            success: boolean;
            feedback: string;
            actionTaken: string;
        };
        transcript: TranscriptMessage[];
        duration: number;
    }) => void;
}

type CallStatus = 'idle' | 'requesting-permission' | 'connecting' | 'active' | 'ended' | 'evaluating';

export default function VoiceSimulator({ ageGroup, onComplete }: VoiceSimulatorProps) {
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [evaluation, setEvaluation] = useState<{ passed: boolean; reason: string } | null>(null);
    const [micPermission, setMicPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(true);

    const conversationRef = useRef<Conversation | null>(null);
    const agentIdRef = useRef<string | null>(null);

    // Request microphone permission
    const requestMicPermission = async () => {
        try {
            setCallStatus('requesting-permission');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setMicPermission(true);
            return true;
        } catch (err) {
            console.error('Microphone permission denied:', err);
            setMicPermission(false);
            setError('Microphone access is required for voice simulation');
            setCallStatus('idle');
            return false;
        }
    };

    // Start the voice call simulation
    const startCall = async () => {
        try {
            const hasPermission = await requestMicPermission();
            if (!hasPermission) return;

            setCallStatus('connecting');
            setError(null);
            setTranscript([]);
            setEvaluation(null);
            setStartTime(Date.now());

            const response = await fetch('/api/voice-simulation/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ age_group: ageGroup })
            });

            if (!response.ok) {
                throw new Error('Failed to start session');
            }

            const { signedUrl, agentId } = await response.json();
            agentIdRef.current = agentId;

            const conversation = await Conversation.startSession({
                signedUrl: signedUrl,
                onConnect: () => {
                    console.log('Connected to agent');
                    setCallStatus('active');
                },
                onDisconnect: () => {
                    console.log('Disconnected from agent');
                    endCall();
                },
                onMessage: (message) => {
                    console.log('Message received:', message);
                    if (message.source === 'ai') {
                        addToTranscript('agent', message.message);
                    } else if (message.source === 'user') {
                        addToTranscript('user', message.message);
                    }
                },
                onError: (error) => {
                    console.error('Conversation error:', error);
                    setError('Connection error occurred');
                    endCall();
                }
            });

            conversationRef.current = conversation;
            await conversation.setVolume({ volume: 1.0 });

        } catch (err) {
            console.error('Error starting call:', err);
            setError('Failed to connect to voice agent');
            setCallStatus('idle');
        }
    };

    const addToTranscript = (role: 'agent' | 'user', message: string) => {
        const newMessage: TranscriptMessage = {
            role,
            message,
            timestamp: Date.now()
        };
        setTranscript(prev => [...prev, newMessage]);
    };

    const endCall = async () => {
        if (conversationRef.current) {
            await conversationRef.current.endSession();
            conversationRef.current = null;
        }

        setCallStatus('evaluating');
        const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        try {
            const response = await fetch('/api/voice-simulation/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    age_group: ageGroup,
                    agent_id: agentIdRef.current,
                    transcript: transcript,
                    duration: duration
                })
            });

            if (response.ok) {
                const { evaluation, xpAwarded } = await response.json();
                setEvaluation({
                    passed: evaluation.success,
                    reason: evaluation.feedback
                });
                onComplete({
                    passed: evaluation.success,
                    xpAwarded,
                    evaluation,
                    transcript,
                    duration
                });
            } else {
                setEvaluation({
                    passed: false,
                    reason: 'Unable to evaluate conversation. Please try again.'
                });
                onComplete({
                    passed: false,
                    xpAwarded: 0,
                    evaluation: {
                        success: false,
                        feedback: 'Unable to evaluate conversation.',
                        actionTaken: 'Call ended'
                    },
                    transcript,
                    duration
                });
            }
        } catch (err) {
            console.error('Error saving simulation:', err);
            setEvaluation({
                passed: false,
                reason: 'Error saving results. Please try again.'
            });
            onComplete({
                passed: false,
                xpAwarded: 0,
                evaluation: {
                    success: false,
                    feedback: 'Error saving results. Please try again.',
                    actionTaken: 'Error occurred'
                },
                transcript,
                duration
            });
        }
    };

    const isKids = ageGroup === 'kids';

    // Auto-scroll transcript to bottom
    const transcriptRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcript]);

    // Confirmation modal
    if (showConfirmModal && callStatus === 'idle') {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">📞</div>
                        <h3 className={`font-bold ${isKids ? 'text-xl' : 'text-2xl'} text-gray-800 mb-2`}>
                            Start Scam Call?
                        </h3>
                        <p className={`${isKids ? 'text-sm' : 'text-base'} text-gray-600`}>
                            This will initiate a voice call with an AI scammer for training purposes.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowConfirmModal(false);
                                onComplete({
                                    passed: false,
                                    xpAwarded: 0,
                                    evaluation: {
                                        success: false,
                                        feedback: 'Simulation cancelled',
                                        actionTaken: 'User cancelled'
                                    },
                                    transcript: [],
                                    duration: 0
                                });
                            }}
                            className={`flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all ${isKids ? 'text-base' : 'text-lg'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setShowConfirmModal(false);
                                startCall();
                            }}
                            className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-all ${isKids
                                ? 'bg-purple-600 hover:bg-purple-700 text-base'
                                : 'bg-green-600 hover:bg-green-700 text-lg'
                                }`}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] max-w-2xl mx-auto p-3 bg-white rounded-xl shadow-lg flex flex-col">
            {/* Compact Header */}
            <div className="text-center py-2 border-b border-gray-200 flex-shrink-0">
                <h2 className="font-bold text-lg text-gray-800">
                    Scam Call Simulation
                </h2>
            </div>

            {/* Compact Status */}
            <div className="py-2 text-center flex-shrink-0">
                <div className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${callStatus === 'requesting-permission' ? 'bg-yellow-100 text-yellow-800' :
                    callStatus === 'connecting' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                        callStatus === 'active' ? 'bg-green-100 text-green-800' :
                            callStatus === 'evaluating' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                                'bg-gray-100 text-gray-700'
                    }`}>
                    {callStatus === 'requesting-permission' && '🎤 Requesting Microphone...'}
                    {callStatus === 'connecting' && '⏳ Connecting...'}
                    {callStatus === 'active' && '🔴 Call in Progress'}
                    {callStatus === 'evaluating' && '🤖 Evaluating Call...'}
                    {callStatus === 'ended' && '✅ Call Ended'}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded-lg flex-shrink-0">
                    <p className="text-red-800 font-semibold text-xs">
                        ⚠️ {error}
                    </p>
                </div>
            )}

            {/* Full-screen Transcript */}
            {transcript.length > 0 && (
                <div className="flex-1 bg-gray-50 rounded-lg p-3 overflow-hidden flex flex-col min-h-0 mb-2">
                    <h3 className="font-bold text-sm text-gray-700 mb-2 flex-shrink-0">
                        📝 Conversation
                    </h3>
                    <div
                        ref={transcriptRef}
                        className="flex-1 overflow-y-auto space-y-2 pr-1"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {transcript.map((msg, idx) => (
                            <div key={idx} className={`p-2 rounded-lg text-xs ${msg.role === 'agent'
                                ? 'bg-red-50 border-l-2 border-red-400'
                                : 'bg-blue-50 border-l-2 border-blue-400'
                                }`}>
                                <p className={`font-semibold text-xs mb-1 ${msg.role === 'agent' ? 'text-red-700' : 'text-blue-700'
                                    }`}>
                                    {msg.role === 'agent' ? '🚨 Scammer' : '👤 You'}
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed">
                                    {msg.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Evaluation Result - Compact */}
            {evaluation && (
                <div className={`p-3 rounded-lg border-2 flex-shrink-0 mb-2 ${evaluation.passed
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl flex-shrink-0">{evaluation.passed ? '✅' : '❌'}</span>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-sm ${evaluation.passed ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {evaluation.passed ? 'You Passed!' : 'You Failed'}
                            </h3>
                            <p className={`text-xs ${evaluation.passed ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {evaluation.reason}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Controls */}
            <div className="flex gap-3 justify-center py-2 border-t border-gray-200 flex-shrink-0">
                {callStatus === 'active' && (
                    <button
                        onClick={endCall}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all text-sm"
                    >
                        ❌ End Call
                    </button>
                )}
            </div>
        </div>
    );
}
