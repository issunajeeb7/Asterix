'use client';

import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Lesson {
    id: string;
    title: string;
    subtitle: string;
    status: 'locked' | 'current' | 'completed';
    xp: number;
    icon: string;
}

export default function ElderlyLessonsPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const response = await fetch('/api/user/progress');
            if (response.ok) {
                const data = await response.json();
                const formattedLessons = data.lessons.map((lesson: any, index: number) => ({
                    id: lesson.id,
                    title: lesson.title.split(':')[0] || `Lesson ${index + 1}`,
                    subtitle: lesson.title.split(':')[1]?.trim() || lesson.title,
                    status: lesson.status,
                    xp: lesson.xp_reward || 50,
                    icon: getIconForLesson(index)
                }));
                setLessons(formattedLessons);
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconForLesson = (index: number) => {
        const icons = ['📧', '💻', '📞', '🛒'];
        return icons[index] || '📖';
    };

    const handleLessonClick = (lesson: Lesson) => {
        if (lesson.status === 'locked') return;
        router.push(`/elderly/lessons/${lesson.id}`);
    };

    const completedLessons = lessons.filter(l => l.status === 'completed').length;
    const totalLessons = lessons.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (loading) {
        console.log('DEBUG: Rendering lessons loading state with asterix_books_1.png');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center">
                    <div className="relative w-24 h-24 mb-4 mx-auto animate-bounce">
                        <Image
                            src="/asterix_books_1.png"
                            alt="Loading Lessons"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-xl font-semibold text-gray-700">Loading lessons...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-gradient-to-br from-green-50 to-emerald-50 pb-4 shadow-sm">
                <div className="px-6 pt-4">
                    {/* Progress Overview */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-base font-semibold text-gray-700">Your Progress</span>
                            <span className="text-xl font-bold text-green-600">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {completedLessons} of {totalLessons} lessons completed
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="page-content pt-4">
                {/* Center Vertical Line */}
                <div
                    className="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2"
                    style={{
                        background: 'linear-gradient(to bottom, #10b981 0%, #10b981 50%, #d1d5db 50%, #d1d5db 100%)',
                    }}
                />

                {/* Lessons */}
                <div className="space-y-6">
                    {lessons.map((lesson, index) => {
                        const isLeft = index % 2 === 0;

                        return (
                            <div key={lesson.id} className="relative h-24 flex items-center">
                                {isLeft ? (
                                    <>
                                        {/* Left Side: Info Card */}
                                        <div className="absolute left-0 right-1/2 pr-16 flex justify-end">
                                            <div
                                                onClick={() => handleLessonClick(lesson)}
                                                className={`bg-white rounded-2xl p-3 shadow-lg w-full max-w-[140px] ${lesson.status === 'locked' ? 'opacity-60' : 'cursor-pointer hover:shadow-xl transition-shadow'
                                                    }`}
                                            >
                                                <div className="text-xs font-bold text-green-600 mb-1 truncate">{lesson.title}</div>
                                                <div className="font-bold text-xs text-gray-800 mb-2 leading-tight line-clamp-2">
                                                    {lesson.subtitle}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs flex-wrap">
                                                    <span className="whitespace-nowrap">⭐ {lesson.xp}</span>
                                                    {lesson.status === 'completed' && (
                                                        <span className="text-green-600 font-semibold">✓ Done</span>
                                                    )}
                                                    {lesson.status === 'current' && (
                                                        <span className="text-blue-600 font-semibold">→ Start</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Horizontal Line from Center to Circle */}
                                        <div
                                            className="absolute left-1/2 top-1/2 w-10 h-0.5 transform -translate-y-1/2"
                                            style={{
                                                backgroundColor: lesson.status === 'completed' ? '#10b981' : '#d1d5db'
                                            }}
                                        />

                                        {/* Right Side: Circle */}
                                        <div className="absolute left-1/2 right-0 pl-10 flex justify-start items-center h-full">
                                            <div
                                                onClick={() => handleLessonClick(lesson)}
                                                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-300 ${lesson.status === 'completed'
                                                    ? 'bg-gradient-to-br from-green-400 to-emerald-600 cursor-pointer hover:scale-110'
                                                    : lesson.status === 'current'
                                                        ? 'bg-gradient-to-br from-blue-400 to-cyan-600 cursor-pointer hover:scale-110 animate-pulse'
                                                        : 'bg-gray-300 cursor-not-allowed'
                                                    }`}
                                            >
                                                {lesson.status === 'completed' && <FaCheckCircle className="text-white text-2xl" />}
                                                {lesson.status === 'current' && <span>{lesson.icon}</span>}
                                                {lesson.status === 'locked' && <FaLock className="text-gray-500 text-xl" />}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Left Side: Circle */}
                                        <div className="absolute left-0 right-1/2 pr-10 flex justify-end items-center h-full">
                                            <div
                                                onClick={() => handleLessonClick(lesson)}
                                                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-300 ${lesson.status === 'completed'
                                                    ? 'bg-gradient-to-br from-green-400 to-emerald-600 cursor-pointer hover:scale-110'
                                                    : lesson.status === 'current'
                                                        ? 'bg-gradient-to-br from-blue-400 to-cyan-600 cursor-pointer hover:scale-110 animate-pulse'
                                                        : 'bg-gray-300 cursor-not-allowed'
                                                    }`}
                                            >
                                                {lesson.status === 'completed' && <FaCheckCircle className="text-white text-2xl" />}
                                                {lesson.status === 'current' && <span>{lesson.icon}</span>}
                                                {lesson.status === 'locked' && <FaLock className="text-gray-500 text-xl" />}
                                            </div>
                                        </div>

                                        {/* Horizontal Line from Circle to Center */}
                                        <div
                                            className="absolute right-1/2 top-1/2 w-10 h-0.5 transform -translate-y-1/2"
                                            style={{
                                                backgroundColor: lesson.status === 'completed' ? '#10b981' : '#d1d5db'
                                            }}
                                        />

                                        {/* Right Side: Info Card */}
                                        <div className="absolute left-1/2 right-0 pl-16 flex justify-start">
                                            <div
                                                onClick={() => handleLessonClick(lesson)}
                                                className={`bg-white rounded-2xl p-3 shadow-lg w-full max-w-[140px] ${lesson.status === 'locked' ? 'opacity-60' : 'cursor-pointer hover:shadow-xl transition-shadow'
                                                    }`}
                                            >
                                                <div className="text-xs font-bold text-green-600 mb-1 truncate">{lesson.title}</div>
                                                <div className="font-bold text-xs text-gray-800 mb-2 leading-tight line-clamp-2">
                                                    {lesson.subtitle}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs flex-wrap">
                                                    <span className="whitespace-nowrap">⭐ {lesson.xp}</span>
                                                    {lesson.status === 'completed' && (
                                                        <span className="text-green-600 font-semibold">✓ Done</span>
                                                    )}
                                                    {lesson.status === 'current' && (
                                                        <span className="text-blue-600 font-semibold">→ Start</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
