'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { FaTrophy, FaFire, FaStar } from 'react-icons/fa';
import AddCaregiverModal from '@/components/AddCaregiverModal';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
}

export default function ElderlyProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ xp: 0, streak: 0, badges: 0 });
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCaregiver, setCurrentCaregiver] = useState<any>(null);
    const [showCaregiverModal, setShowCaregiverModal] = useState(false);

    useEffect(() => {
        fetchProfileData();
        fetchCaregiver();
    }, []);

    const fetchProfileData = async () => {
        try {
            // Fetch stats
            const statsRes = await fetch('/api/user/stats');
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            // Fetch badges
            const badgesRes = await fetch('/api/user/badges');
            if (badgesRes.ok) {
                const badgesData = await badgesRes.json();
                setBadges(badgesData.badges);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCaregiver = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('caregiver_learners')
                    .select(`
                        caregiver_id,
                        users!caregiver_learners_caregiver_id_fkey (
                            id,
                            email,
                            full_name
                        )
                    `)
                    .eq('learner_id', user.id)
                    .single();

                if (data) {
                    setCurrentCaregiver(data.users);
                }
            }
        } catch (error) {
            // No caregiver linked
            setCurrentCaregiver(null);
        }
    };

    const handleRemoveCaregiver = async () => {
        if (!confirm('Are you sure you want to remove your caregiver?')) return;

        try {
            const response = await fetch('/api/caregivers/add', {
                method: 'DELETE'
            });

            if (response.ok) {
                setCurrentCaregiver(null);
            }
        } catch (error) {
            console.error('Error removing caregiver:', error);
        }
    };

    // Mock weekly progress data
    const weeklyProgress = [
        { day: 'Mon', xp: 50, completed: true },
        { day: 'Tue', xp: 75, completed: true },
        { day: 'Wed', xp: 0, completed: false },
        { day: 'Thu', xp: 100, completed: true },
        { day: 'Fri', xp: 50, completed: true },
        { day: 'Sat', xp: 0, completed: false },
        { day: 'Sun', xp: 0, completed: false },
    ];

    const totalWeeklyXP = weeklyProgress.reduce((sum, day) => sum + day.xp, 0);
    const maxDayXP = Math.max(...weeklyProgress.map(d => d.xp), 1);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center">
                    <div className="relative w-24 h-24 mb-4 mx-auto animate-bounce">
                        <Image
                            src="/asterix_logo.svg"
                            alt="Asterix"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-xl font-semibold text-gray-700">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="page-content">
                {/* Sign Out Button */}
                <div className="flex justify-end pt-4 mb-2">
                    <button
                        onClick={handleSignOut}
                        className="bg-white text-gray-700 px-5 py-3 rounded-xl text-base font-semibold shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                        <span>🚪</span> Sign Out
                    </button>
                </div>

                {/* Trophy Header */}
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                        <div className="text-9xl mb-2">🏆</div>
                        <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                            <span className="text-white font-bold text-lg">+{totalWeeklyXP}</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Excellent Progress!</h2>
                    <p className="text-lg text-gray-600">You earned {totalWeeklyXP} points this week</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-4xl">⭐</span>
                            <FaStar className="text-yellow-300 text-2xl" />
                        </div>
                        <p className="text-4xl font-bold mb-1">{stats.xp}</p>
                        <p className="text-base opacity-90">Total Points</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-cyan-600 rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-4xl">🎖️</span>
                            <FaTrophy className="text-yellow-300 text-2xl" />
                        </div>
                        <p className="text-4xl font-bold mb-1">{badges.length}</p>
                        <p className="text-base opacity-90">Achievements</p>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <span>🎖️</span> My Achievements
                    </h3>
                    {badges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {badges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 text-center transform hover:scale-105 transition-transform"
                                >
                                    <div className="text-5xl mb-3">{badge.icon}</div>
                                    <p className="text-base font-bold text-gray-800 mb-1">{badge.name}</p>
                                    <p className="text-sm text-gray-600">{badge.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="text-6xl mb-4">🎯</div>
                            <p className="text-lg text-gray-600">Complete lessons to earn achievements!</p>
                        </div>
                    )}
                </div>

                {/* Weekly Progress */}
                <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <span>📊</span> Weekly Progress
                    </h3>
                    <div className="flex items-end justify-between gap-3 h-40 mb-4">
                        {weeklyProgress.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                                    {day.completed && (
                                        <div
                                            className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-t-xl relative group"
                                            style={{ height: `${(day.xp / maxDayXP) * 100}%`, minHeight: '24px' }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {day.xp} XP
                                            </div>
                                        </div>
                                    )}
                                    {!day.completed && (
                                        <div className="w-full h-6 bg-gray-200 rounded-t-xl"></div>
                                    )}
                                </div>
                                <span className="text-base font-semibold text-gray-600">{day.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3">
                            <FaFire className="text-orange-500 text-2xl" />
                            <span className="text-lg font-semibold text-gray-700">{stats.streak} Day Streak</span>
                        </div>
                        <span className="text-base text-gray-600">{totalWeeklyXP} XP this week</span>
                    </div>
                </div>

                {/* Caregiver Section */}
                <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <span>👨‍👩‍👧</span> My Caregiver
                    </h3>
                    {currentCaregiver ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {currentCaregiver.full_name?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-lg">
                                        {currentCaregiver.full_name || 'Caregiver'}
                                    </p>
                                    <p className="text-sm text-gray-500">{currentCaregiver.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRemoveCaregiver}
                                className="w-full bg-red-100 text-red-600 py-3 rounded-xl text-base font-semibold hover:bg-red-200 transition-colors"
                            >
                                Remove Caregiver
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-lg text-gray-600 mb-4">
                                No caregiver linked yet
                            </p>
                            <button
                                onClick={() => setShowCaregiverModal(true)}
                                className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-colors"
                            >
                                Add Caregiver
                            </button>
                        </div>
                    )}
                </div>

                {/* Continue Button */}
                <button
                    onClick={() => window.location.href = '/elderly/lessons'}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:opacity-90 transition-opacity"
                >
                    CONTINUE LEARNING
                </button>
            </div>

            <AddCaregiverModal
                isOpen={showCaregiverModal}
                onClose={() => setShowCaregiverModal(false)}
                onAdd={fetchCaregiver}
            />
        </div>
    );
}
