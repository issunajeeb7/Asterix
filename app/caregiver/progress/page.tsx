'use client';

import { useState, useEffect } from 'react';
import { useCaregiverContext } from '@/contexts/CaregiverContext';
import { FaFire, FaTrophy } from 'react-icons/fa';
import Image from 'next/image';

interface ProgressData {
    currentStreak: number;
    weeklyProgress: {
        completed: number;
        total: number;
    };
    recentAchievements: Array<{
        name: string;
        description: string;
        icon: string;
        earnedAt: string;
    }>;
    needsAttention: Array<{
        lessonId: string;
        title: string;
        score: number;
    }>;
    weeklyActivity: Array<{
        day: string;
        count: number;
    }>;
    totalStats: {
        xp: number;
        lessonsCompleted: number;
        badgesEarned: number;
    };
}

export default function CaregiverProgressPage() {
    const { selectedLearner, learners } = useCaregiverContext();
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedLearner) {
            fetchProgress();
        }
    }, [selectedLearner]);

    const fetchProgress = async () => {
        if (!selectedLearner) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/caregivers/progress/${selectedLearner.id}`);
            if (response.ok) {
                const data = await response.json();
                setProgressData(data);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    if (!selectedLearner) {
        return (
            <div className="px-4 py-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Please select a learner from the dropdown above</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="relative w-24 h-24 mb-4 mx-auto animate-bounce">
                        <Image
                            src="/asterix_logo.svg"
                            alt="Loading"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-xl font-semibold text-gray-700">Loading progress...</p>
                </div>
            </div>
        );
    }

    if (!progressData) {
        return (
            <div className="px-4 py-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">No progress data available</p>
                </div>
            </div>
        );
    }

    const maxActivityCount = Math.max(...progressData.weeklyActivity.map(d => d.count), 1);
    const progressPercentage = (progressData.weeklyProgress.completed / progressData.weeklyProgress.total) * 100;

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {selectedLearner.name}'s Progress
            </h1>

            {/* Current Streak */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Current Streak</h3>
                <div className="flex items-center justify-between">
                    <div className="text-4xl font-bold text-gray-800">
                        {progressData.currentStreak} Days
                    </div>
                    <FaFire className="text-5xl text-orange-500" />
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Weekly Progress</h3>
                <p className="text-sm text-gray-500 mb-3">
                    Lessons completed: {progressData.weeklyProgress.completed}/{progressData.weeklyProgress.total}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <p className="text-right text-sm font-semibold text-teal-600 mt-1">
                    {Math.round(progressPercentage)}%
                </p>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-4">Recent Achievements</h3>
                {progressData.recentAchievements.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {progressData.recentAchievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg"
                            >
                                <div className="text-3xl mb-2">{achievement.icon}</div>
                                <p className="text-xs font-semibold text-gray-800 text-center">
                                    {achievement.name}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                        No recent achievements
                    </p>
                )}
            </div>

            {/* Needs Attention */}
            {progressData.needsAttention.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-semibold text-orange-800 mb-2">Needs Attention</h3>
                    <div className="space-y-2">
                        {progressData.needsAttention.map((item, index) => (
                            <div key={index} className="text-sm text-orange-700">
                                <span className="font-semibold">{item.title}</span>
                                {item.score !== null && item.score !== undefined && (
                                    <span className="text-orange-600"> - Score: {item.score}%</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-4">Weekly Activity</h3>
                <div className="flex items-end justify-between gap-2 h-32">
                    {progressData.weeklyActivity.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                                {day.count > 0 ? (
                                    <div
                                        className="w-full bg-gradient-to-t from-teal-400 to-cyan-500 rounded-t-lg"
                                        style={{
                                            height: `${(day.count / maxActivityCount) * 100}%`,
                                            minHeight: '10px'
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-2 bg-gray-200 rounded-t-lg" />
                                )}
                            </div>
                            <span className="text-xs font-semibold text-gray-600">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Stats */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-4">Total Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                            {progressData.totalStats.xp}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">XP</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                            {progressData.totalStats.lessonsCompleted}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Lessons</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                            {progressData.totalStats.badgesEarned}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Badges</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
