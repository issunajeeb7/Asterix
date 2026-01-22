'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LessonPlayer from '@/components/lessons/LessonPlayer';

interface Question {
    id: string;
    question_order: number;
    question_type: 'multiple_choice' | 'true_false' | 'select_all' | 'match_pairs' | 'fill_blank';
    question_text: string;
    question_data: any;
    explanation: string;
    points: number;
}

interface Lesson {
    id: string;
    title: string;
    description: string;
}

export default function KidsLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [lessonId, setLessonId] = useState<string>('');
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCompletion, setShowCompletion] = useState(false);
    const [completionData, setCompletionData] = useState<{
        totalXP: number;
        correctCount: number;
        newBadges: any[];
    } | null>(null);

    useEffect(() => {
        params.then(p => {
            setLessonId(p.id);
            fetchLesson(p.id);
        });
    }, []);

    const fetchLesson = async (id: string) => {
        try {
            const response = await fetch(`/api/lessons/${id}`);
            if (!response.ok) throw new Error('Failed to fetch lesson');

            const data = await response.json();
            setLesson(data.lesson);
            setQuestions(data.questions);
        } catch (err) {
            setError('Failed to load lesson');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonComplete = async (totalXP: number, correctCount: number) => {
        try {
            // Submit answers to backend
            const response = await fetch(`/api/lessons/${lessonId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: [], // TODO: Pass actual answers from LessonPlayer
                    totalXP,
                    correctCount,
                    totalQuestions: questions.length
                })
            });

            if (!response.ok) throw new Error('Failed to submit lesson');

            const result = await response.json();
            setCompletionData({
                totalXP: result.earnedXP,
                correctCount,
                newBadges: result.newBadges || []
            });
            setShowCompletion(true);
        } catch (err) {
            console.error('Error submitting lesson:', err);
            // Still show completion screen even if submission fails
            setCompletionData({
                totalXP,
                correctCount,
                newBadges: []
            });
            setShowCompletion(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="text-center">
                    <div className="relative w-24 h-24 mb-4 mx-auto animate-bounce">
                        <Image
                            src="/asterix_books_1.png"
                            alt="Loading Lesson"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
                <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || 'Lesson not found'}</p>
                    <button
                        onClick={() => router.push('/kids/lessons')}
                        className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90"
                    >
                        Back to Lessons
                    </button>
                </div>
            </div>
        );
    }

    if (showCompletion && completionData) {
        const percentage = Math.round((completionData.correctCount / questions.length) * 100);

        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
                    {/* Celebration */}
                    <div className="text-center mb-6">
                        <div className="text-8xl mb-4 animate-bounce">
                            {percentage === 100 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {percentage === 100 ? 'Perfect!' : percentage >= 70 ? 'Great Job!' : 'Keep Going!'}
                        </h2>
                        <p className="text-gray-600">You completed the lesson!</p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4 mb-6">
                        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-semibold">Score</span>
                                <span className="text-2xl font-bold text-orange-600">
                                    {completionData.correctCount}/{questions.length}
                                </span>
                            </div>
                            <div className="mt-2 bg-white/50 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-semibold">XP Earned</span>
                                <span className="text-2xl font-bold text-yellow-600">
                                    +{completionData.totalXP} ⭐
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* New Badges */}
                    {completionData.newBadges.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-800 mb-3">🎖️ New Badges!</h3>
                            <div className="space-y-2">
                                {completionData.newBadges.map((badge: any) => (
                                    <div key={badge.id} className="bg-purple-100 rounded-xl p-3 flex items-center gap-3">
                                        <span className="text-3xl">{badge.icon}</span>
                                        <div>
                                            <p className="font-bold text-gray-800">{badge.name}</p>
                                            <p className="text-sm text-gray-600">{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/kids/lessons')}
                            className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                        >
                            Continue Learning
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LessonPlayer
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            questions={questions}
            isKids={true}
            onComplete={handleLessonComplete}
        />
    );
}
