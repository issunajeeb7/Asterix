'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FaTrophy, FaFire, FaStar } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ElderlyHomePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ xp: 150, streak: 3, badges: 2 });
    const [recentBadges, setRecentBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRecentBadges();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/user/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentBadges = async () => {
        try {
            const response = await fetch('/api/user/badges');
            if (response.ok) {
                const data = await response.json();
                setRecentBadges(data.badges.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching badges:', error);
        }
    };

    return (
        <div className="page-content">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
                    <FaTrophy className="text-3xl text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                        {loading ? '...' : stats.xp}
                    </p>
                    <p className="text-xs text-gray-600">XP Points</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
                    <FaFire className="text-3xl text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                        {loading ? '...' : stats.streak}
                    </p>
                    <p className="text-xs text-gray-600">Day Streak</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
                    <FaStar className="text-3xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                        {loading ? '...' : stats.badges}
                    </p>
                    <p className="text-xs text-gray-600">Badges</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    📚 Continue Learning
                </h2>
                <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800">Recognizing Scam Calls</h3>
                        <p className="text-sm text-gray-600 mt-1">Lesson 3 • 10 min</p>
                        <div className="mt-2 bg-white/50 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    🏆 Recent Achievements
                </h2>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentBadges.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No badges earned yet!</p>
                        <p className="text-base text-gray-400 mt-2">Complete lessons to earn your first badge 🎯</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentBadges.map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">{badge.icon}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-lg">{badge.name}</p>
                                    <p className="text-base text-gray-600">{badge.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ask Asterix Button */}
            <button
                onClick={() => router.push('/elderly/assistant')}
                className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full py-4 px-6 shadow-[0_4px_0_0_rgba(6,182,212,0.4)] hover:shadow-[0_3px_0_0_rgba(6,182,212,0.4)] active:shadow-[0_1px_0_0_rgba(6,182,212,0.4)] hover:translate-y-0.5 active:translate-y-1 transition-all duration-150 flex items-center justify-center gap-4"
            >
                <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                        src="/asterix_logo.svg"
                        alt="Asterix"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="text-xl font-bold flex-1 text-left">Ask Asterix</span>
                <span className="text-2xl">→</span>
            </button>
        </div>
    );
}
