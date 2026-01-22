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

export default function ElderlyLessonPage({ params }: { params: Promise<{ id: string }> }) {
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
            const response = await fetch(`/api/lessons/${lessonId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: [],
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center">
                    <div className="relative w-24 h-24 mb-4 mx-auto animate-bounce">
                        <Image
                            src="/asterix_books_1.png"
                            alt="Loading Lesson"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-xl font-semibold text-gray-700">Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Lesson Not Found</h2>
                    <p className="text-lg text-gray-600 mb-6">{error || 'This lesson could not be loaded'}</p>
                    <button
                        onClick={() => router.push('/elderly/lessons')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90"
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
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="text-8xl mb-4">
                            {percentage === 100 ? '🏆' : percentage >= 70 ? '🎉' : '👍'}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {percentage === 100 ? 'Excellent!' : percentage >= 70 ? 'Well Done!' : 'Good Effort!'}
                        </h2>
                        <p className="text-lg text-gray-600">Lesson completed</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg text-gray-700 font-semibold">Your Score</span>
                                <span className="text-3xl font-bold text-green-600">
                                    {completionData.correctCount}/{questions.length}
                                </span>
                            </div>
                            <div className="mt-3 bg-white/50 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-lg text-gray-700 font-semibold">Points Earned</span>
                                <span className="text-3xl font-bold text-yellow-600">
                                    +{completionData.totalXP} ⭐
                                </span>
                            </div>
                        </div>
                    </div>

                    {completionData.newBadges.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">🎖️ New Achievement!</h3>
                            <div className="space-y-3">
                                {completionData.newBadges.map((badge: any) => (
                                    <div key={badge.id} className="bg-purple-100 rounded-2xl p-4 flex items-center gap-4">
                                        <span className="text-4xl">{badge.icon}</span>
                                        <div>
                                            <p className="text-lg font-bold text-gray-800">{badge.name}</p>
                                            <p className="text-base text-gray-600">{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/elderly/lessons')}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-xl font-bold text-xl hover:opacity-90 transition-opacity"
                        >
                            Continue Learning
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-300 transition-colors"
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
            isKids={false}
            onComplete={handleLessonComplete}
        />
    );
}
