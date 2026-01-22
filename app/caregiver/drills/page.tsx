'use client';

import { useState, useEffect } from 'react';
import { useCaregiverContext } from '@/contexts/CaregiverContext';
import CallHistory from '@/components/simulations/CallHistory';
import CallResults from '@/components/simulations/CallResults';

export default function CaregiverDrillsPage() {
    const { selectedLearner, learners } = useCaregiverContext();
    const [currentView, setCurrentView] = useState<'menu' | 'call-history' | 'results' | 'drills' | 'drill-results'>('menu');
    const [callResultsData, setCallResultsData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [simulationResults, setSimulationResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCall, setSelectedCall] = useState<any>(null);
    const [selectedDrill, setSelectedDrill] = useState<any>(null);

    // Fetch call history for selected learner
    useEffect(() => {
        if (currentView === 'call-history' && selectedLearner) {
            fetchHistory();
        }
        if (currentView === 'drills' && selectedLearner) {
            fetchSimulationResults();
        }
    }, [currentView, selectedLearner]);

    const fetchHistory = async () => {
        if (!selectedLearner) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/caregivers/drills/${selectedLearner.id}`);
            if (response.ok) {
                const { history } = await response.json();
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

    const fetchSimulationResults = async () => {
        if (!selectedLearner) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/caregivers/drills/simulations/${selectedLearner.id}`);
            if (response.ok) {
                const { results } = await response.json();
                setSimulationResults(results);
            }
        } catch (error) {
            console.error('Error fetching simulation results:', error);
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

    // No learners
    if (learners.length === 0) {
        return (
            <div className="px-4 py-6">
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No learners linked yet</p>
                    <p className="text-gray-400 text-sm">
                        Ask your learners to add you as their caregiver from their profile page
                    </p>
                </div>
            </div>
        );
    }

    // No learner selected
    if (!selectedLearner) {
        return (
            <div className="px-4 py-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Please select a learner from the dropdown above</p>
                </div>
            </div>
        );
    }

    // Results view
    if (currentView === 'results' && selectedCall) {
        return (
            <div className="page-content">
                <button
                    onClick={() => {
                        setSelectedCall(null);
                        setCurrentView('call-history');
                    }}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 text-base"
                >
                    ← Back to History
                </button>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">
                                Call Details
                            </h3>
                            <p className="text-sm text-gray-500">
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
                            <p className="text-base text-red-700">
                                {selectedCall.fail_reason}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        <h4 className="font-semibold text-lg text-gray-700 mb-3">
                            Conversation Transcript
                        </h4>
                        {Array.isArray(selectedCall.transcript) && selectedCall.transcript.map((msg: any, idx: number) => (
                            <div key={idx} className={`p-3 rounded-lg ${msg.role === 'agent'
                                ? 'bg-red-50 border-l-4 border-red-500'
                                : 'bg-blue-50 border-l-4 border-blue-500'
                                }`}>
                                <p className={`font-semibold text-sm ${msg.role === 'agent' ? 'text-red-700' : 'text-blue-700'}`}>
                                    {msg.role === 'agent' ? '🚨 Scammer' : '👤 Learner'}
                                </p>
                                <p className="text-base text-gray-800 mt-1">
                                    {msg.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Call history view
    if (currentView === 'call-history') {
        return (
            <div className="page-content">
                <button
                    onClick={() => setCurrentView('menu')}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 text-base"
                >
                    ← Back
                </button>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-2xl text-gray-800">
                            {selectedLearner.name}'s Call History
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-lg text-gray-600">Loading history...</p>
                            </div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                            <div className="text-6xl mb-4">📞</div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">
                                No Calls Yet
                            </h3>
                            <p className="text-base text-gray-600 mb-6">
                                {selectedLearner.name} hasn't completed any call simulations yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((call) => (
                                <div
                                    key={call.id}
                                    onClick={() => {
                                        setSelectedCall(call);
                                        setCurrentView('results');
                                    }}
                                    className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
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
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(call.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-base text-gray-700">
                                                Duration: {formatDuration(call.duration)} • {Array.isArray(call.transcript) ? call.transcript.length : 0} messages
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
            </div>
        );
    }


    // Drill results view
    if (currentView === 'drill-results' && selectedDrill) {
        return (
            <div className="page-content">
                <button
                    onClick={() => {
                        setSelectedDrill(null);
                        setCurrentView('drills');
                    }}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 text-base"
                >
                    ← Back to Drills
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">
                                {selectedDrill.simulations?.title || 'Drill'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {formatDate(selectedDrill.completed_at)}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-semibold ${selectedDrill.success
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {selectedDrill.success ? '✅ Success' : '❌ Failed'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">XP Earned</p>
                            <p className="text-2xl font-bold text-blue-600">{selectedDrill.xp_earned || 0}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Difficulty</p>
                            <p className="text-2xl font-bold text-purple-600 capitalize">{selectedDrill.simulations?.difficulty || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-lg text-gray-700 mb-3">Scenario</h4>
                        {selectedDrill.simulations?.scenario_data && (
                            <div className="space-y-3">
                                <div className="text-3xl mb-2">
                                    {selectedDrill.simulations.scenario_data.emoji}
                                </div>
                                <p className="text-base text-gray-800 font-semibold">
                                    {selectedDrill.simulations.scenario_data.prompt}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 mt-6 pt-6">
                        <h4 className="font-semibold text-lg text-gray-700 mb-3">Learner's Action</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-base text-gray-800">
                                {selectedDrill.action_taken || 'No action recorded'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Drills history view
    if (currentView === 'drills') {
        return (
            <div className="page-content">
                <button
                    onClick={() => setCurrentView('menu')}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 text-base"
                >
                    ← Back
                </button>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-2xl text-gray-800">
                            {selectedLearner.name}'s Interactive Drills
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-lg text-gray-600">Loading drills...</p>
                            </div>
                        </div>
                    ) : simulationResults.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">
                                No Drills Yet
                            </h3>
                            <p className="text-base text-gray-600 mb-6">
                                {selectedLearner.name} hasn't completed any interactive drills yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {simulationResults.map((drill) => (
                                <div
                                    key={drill.id}
                                    onClick={() => {
                                        setSelectedDrill(drill);
                                        setCurrentView('drill-results');
                                    }}
                                    className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-2xl ${drill.success ? '✅' : '❌'}`}>
                                                    {drill.simulations?.scenario_data?.emoji}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">
                                                        {drill.simulations?.title || 'Drill'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(drill.completed_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${drill.success
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {drill.success ? '✅ Success' : '❌ Failed'}
                                                </span>
                                                <span className="text-sm text-blue-600 font-semibold">
                                                    +{drill.xp_earned} XP
                                                </span>
                                            </div>
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
            </div>
        );
    }

    // Main menu view
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Sticky Header */}
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 shadow-lg z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0">
                        <img
                            src="/aterix_archer.png"
                            alt="Learner Drills"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Learner Drills</h1>
                        <p className="text-xs opacity-90">View {selectedLearner.name}'s practice activities</p>
                    </div>
                </div>
            </div>

            {/* Content with padding for sticky header */}
            <div className="pt-20 px-4 pb-4 h-full overflow-y-auto">
                <div className="flex flex-col gap-4 max-w-md mx-auto h-[calc(100%-5rem)]">
                    {/* Call Simulations Button */}
                    <button
                        onClick={() => setCurrentView('call-history')}
                        className="flex-1 bg-blue-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_0_0_rgb(59,130,246),0_8px_15px_-5px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgb(59,130,246),0_4px_15px_-5px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_0_rgb(59,130,246),0_2px_8px_-5px_rgba(0,0,0,0.2)]"
                    >
                        <div className="w-32 h-32 mb-4">
                            <img
                                src="/asterix_phone.png"
                                alt="Call Simulations"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Call Simulations</h3>
                        <p className="text-sm text-gray-600">View scam call practice history</p>
                    </button>

                    {/* Other Drills Button */}
                    <button
                        onClick={() => setCurrentView('drills')}
                        className="flex-1 bg-blue-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_0_0_rgb(59,130,246),0_8px_15px_-5px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgb(59,130,246),0_4px_15px_-5px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_0_rgb(59,130,246),0_2px_8px_-5px_rgba(0,0,0,0.2)]"
                    >
                        <div className="w-32 h-32 mb-4">
                            <img
                                src="/aterix_archer.png"
                                alt="Other Drills"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Other Drills</h3>
                        <p className="text-sm text-gray-600">Interactive practice drills</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
