'use client';

import { useEffect, useState } from 'react';
import VoiceSimulator from '@/components/simulations/VoiceSimulator';
import CallHistory from '@/components/simulations/CallHistory';
import CallResults from '@/components/simulations/CallResults';

export default function KidsSimulationsPage() {
    const [currentView, setCurrentView] = useState<'menu' | 'call-history' | 'active-call' | 'results' | 'others' | 'drill-play' | 'drill-result'>('menu');
    const [callResultsData, setCallResultsData] = useState<any>(null);
    const [drills, setDrills] = useState<any[]>([]);
    const [drillsLoading, setDrillsLoading] = useState(false);
    const [selectedDrill, setSelectedDrill] = useState<any>(null);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; xpEarned: number; feedback?: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (currentView === 'others' && drills.length === 0 && !drillsLoading) {
            loadDrills();
        }
    }, [currentView]);

    const loadDrills = async () => {
        setDrillsLoading(true);
        try {
            const res = await fetch('/api/simulations?age_group=kids');
            if (res.ok) {
                const data = await res.json();
                setDrills(data.simulations || []);
            }
        } catch (error) {
            console.error('Error loading drills', error);
        } finally {
            setDrillsLoading(false);
        }
    };

    const handleSubmitDrill = async () => {
        if (!selectedDrill || !selectedAction) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/simulations/${selectedDrill.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actionTaken: selectedAction })
            });
            if (res.ok) {
                const data = await res.json();
                setSubmitResult({ success: data.success, xpEarned: data.xpEarned, feedback: data.feedback });
                setCurrentView('drill-result');
            }
        } catch (error) {
            console.error('Error submitting drill', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCallComplete = (result: any) => {
        setCallResultsData(result);
        setCurrentView('results');
    };

    // Active call view
    if (currentView === 'active-call') {
        return (
            <div className="page-content">
                <VoiceSimulator ageGroup="kids" onComplete={handleCallComplete} />
            </div>
        );
    }

    // Results view
    if (currentView === 'results' && callResultsData) {
        return (
            <div className="page-content">
                <CallResults
                    ageGroup="kids"
                    evaluation={callResultsData.evaluation}
                    transcript={callResultsData.transcript}
                    duration={callResultsData.duration}
                    xpAwarded={callResultsData.xpAwarded}
                    onBackToHistory={() => setCurrentView('call-history')}
                />
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

                <CallHistory
                    ageGroup="kids"
                    onNewCall={() => setCurrentView('active-call')}
                />
            </div>
        );
    }

    // Drill play view
    if (currentView === 'drill-play' && selectedDrill) {
        const scenario = selectedDrill.scenario_data || {};
        const options = scenario.options || [];

        return (
            <div className="page-content space-y-4">
                <button
                    onClick={() => {
                        setSelectedAction(null);
                        setSelectedDrill(null);
                        setCurrentView('others');
                    }}
                    className="mb-2 text-gray-600 hover:text-gray-800 text-base flex items-center gap-2"
                >
                    ← Back to Drills
                </button>

                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 rounded-3xl p-5 shadow-lg">
                    <p className="text-sm text-gray-500 mb-2 uppercase font-bold tracking-wide">Scenario</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedDrill.title}</h2>
                    <p className="text-gray-600 mb-4">{selectedDrill.description}</p>
                    {scenario.prompt && (
                        <div className="bg-white rounded-2xl p-4 shadow-inner border border-cyan-100">
                            <p className="text-gray-800 text-base leading-relaxed">{scenario.prompt}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {options.map((opt: any) => (
                        <button
                            key={opt.id}
                            onClick={() => setSelectedAction(opt.id || opt.action || opt.label)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 shadow-sm flex items-center gap-3 ${
                                selectedAction === (opt.id || opt.action || opt.label)
                                    ? 'border-teal-500 bg-teal-50'
                                    : 'border-cyan-100 bg-white hover:border-teal-300'
                            }`}
                        >
                            <span className="text-2xl">{opt.icon || '🛡️'}</span>
                            <div>
                                <p className="font-semibold text-gray-800">{opt.label || opt.text}</p>
                                {opt.hint && <p className="text-sm text-gray-600">{opt.hint}</p>}
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmitDrill}
                    disabled={!selectedAction || submitting}
                    className="w-full mt-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white rounded-full py-3 text-lg font-bold shadow-[0_6px_0_0_rgba(6,182,212,0.4)] hover:shadow-[0_4px_0_0_rgba(6,182,212,0.4)] active:translate-y-0.5 transition-all"
                >
                    {submitting ? 'Checking...' : 'Check'}
                </button>
            </div>
        );
    }

    // Drill result view
    if (currentView === 'drill-result' && selectedDrill && submitResult) {
        return (
            <div className="page-content space-y-4 text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg ${
                    submitResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {submitResult.success ? '✅' : '⚠️'}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {submitResult.success ? 'Great job!' : 'Let’s try again'}
                </h2>
                <p className="text-gray-600">{submitResult.feedback || (submitResult.success ? 'You chose the safe action.' : 'That choice was risky. Stay alert!')}</p>
                {submitResult.xpEarned > 0 && (
                    <div className="inline-block px-4 py-2 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                        +{submitResult.xpEarned} XP earned!
                    </div>
                )}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => {
                            setSubmitResult(null);
                            setSelectedAction(null);
                            setSelectedDrill(null);
                            setCurrentView('others');
                        }}
                        className="px-5 py-3 bg-white border border-cyan-200 rounded-xl text-gray-700 font-semibold shadow-sm"
                    >
                        Back to Drills
                    </button>
                    <button
                        onClick={() => {
                            setSubmitResult(null);
                            setSelectedAction(null);
                            setCurrentView('drill-play');
                        }}
                        className="px-5 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold shadow"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Others view (drills list)
    if (currentView === 'others') {
        return (
            <div className="page-content">
                <button
                    onClick={() => setCurrentView('menu')}
                    className="mb-6 text-gray-600 hover:text-gray-800 text-base"
                >
                    ← Back to Menu
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">More Drills</h2>

                {drillsLoading ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                        <p className="text-gray-600">Loading drills...</p>
                    </div>
                ) : drills.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                        <p className="text-gray-600">No drills published yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {drills.map((drill) => (
                            <div
                                key={drill.id}
                                className="bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 rounded-3xl p-5 shadow-md hover:shadow-xl transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow">
                                        {drill.scenario_data?.emoji || '🛡️'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800">{drill.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{drill.description}</p>
                                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                            <span className="px-2 py-1 rounded-full bg-white border border-cyan-100">{drill.simulation_type}</span>
                                            {drill.difficulty && <span className="px-2 py-1 rounded-full bg-white border border-cyan-100">{drill.difficulty}</span>}
                                            <span className="px-2 py-1 rounded-full bg-white border border-cyan-100">{drill.xp_reward || 75} XP</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedDrill(drill);
                                        setCurrentView('drill-play');
                                    }}
                                    className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full py-3 font-bold shadow-[0_6px_0_0_rgba(6,182,212,0.4)] hover:translate-y-0.5 transition-all"
                                >
                                    Start
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Main menu view
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Sticky Header */}
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-3 shadow-lg z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0">
                        <img
                            src="/aterix_archer.png"
                            alt="Safety Drills"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Safety Drills</h1>
                        <p className="text-xs opacity-90">Choose a game to practice staying safe online</p>
                    </div>
                </div>
            </div>

            {/* Content with padding for sticky header */}
            <div className="pt-20 px-4 pb-4 h-full overflow-y-auto">
                <div className="flex flex-col gap-4 max-w-md mx-auto h-[calc(100%-5rem)]">
                    {/* Simulate Call Button */}
                    <button
                        onClick={() => setCurrentView('call-history')}
                        className="flex-1 bg-cyan-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_0_0_rgb(6,182,212),0_8px_15px_-5px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgb(6,182,212),0_4px_15px_-5px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_0_rgb(6,182,212),0_2px_8px_-5px_rgba(0,0,0,0.2)]"
                    >
                        <div className="w-32 h-32 mb-4">
                            <img
                                src="/asterix_phone.png"
                                alt="Simulate Call"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Simulate Call</h3>
                        <p className="text-sm text-gray-600">Spot the scam call</p>
                    </button>

                    {/* More Drills Button */}
                    <button
                        onClick={() => setCurrentView('others')}
                        className="flex-1 bg-cyan-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_0_0_rgb(6,182,212),0_8px_15px_-5px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgb(6,182,212),0_4px_15px_-5px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_0_rgb(6,182,212),0_2px_8px_-5px_rgba(0,0,0,0.2)]"
                    >
                        <div className="w-32 h-32 mb-4">
                            <img
                                src="/aterix_archer.png"
                                alt="More Drills"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">More Drills</h3>
                        <p className="text-sm text-gray-600">Other fun challenges</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
