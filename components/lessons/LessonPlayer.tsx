'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import MultipleChoice from './QuestionTypes/MultipleChoice';
import TrueFalse from './QuestionTypes/TrueFalse';
import SelectAll from './QuestionTypes/SelectAll';
import ProgressBar from './ProgressBar';
import XPReward from './XPReward';

interface Question {
    id: string;
    question_order: number;
    question_type: 'multiple_choice' | 'true_false' | 'select_all' | 'match_pairs' | 'fill_blank';
    question_text: string;
    question_data: any;
    explanation: string;
    points: number;
}

interface LessonPlayerProps {
    lessonId: string;
    lessonTitle: string;
    questions: Question[];
    isKids?: boolean;
    onComplete: (totalXP: number, correctCount: number) => void;
}

export default function LessonPlayer({
    lessonId,
    lessonTitle,
    questions,
    isKids = true,
    onComplete
}: LessonPlayerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Array<{ questionId: string; isCorrect: boolean; answerData: any }>>([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showXPReward, setShowXPReward] = useState(false);
    const [earnedXP, setEarnedXP] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // Safety check - if no questions or currentQuestion is undefined
    if (!currentQuestion || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
                <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
                    <div className="relative w-24 h-24 mb-4 mx-auto animate-bounce">
                        <Image
                            src="/asterix_books_1.png"
                            alt="No Questions"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Questions Available</h2>
                    <p className="text-gray-600">This lesson doesn't have any questions yet.</p>
                </div>
            </div>
        );
    }

    const handleAnswer = (isCorrect: boolean, answerData: any) => {
        // Record answer
        const newAnswer = {
            questionId: currentQuestion.id,
            isCorrect,
            answerData
        };
        setAnswers(prev => [...prev, newAnswer]);

        // Show XP reward if correct
        if (isCorrect) {
            setEarnedXP(currentQuestion.points);
            setShowXPReward(true);
        } else {
            // Show explanation immediately if wrong
            setShowExplanation(true);
        }
    };

    const handleXPComplete = () => {
        setShowXPReward(false);
        setShowExplanation(true);
    };

    const handleContinue = () => {
        setShowExplanation(false);

        if (isLastQuestion) {
            // Calculate total XP and correct count
            const totalXP = answers.reduce((sum, ans) => sum + (ans.isCorrect ? currentQuestion.points : 0), 0);
            const correctCount = answers.filter(ans => ans.isCorrect).length;
            setIsComplete(true);
            onComplete(totalXP, correctCount);
        } else {
            // Move to next question
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    if (isComplete) {
        return null; // Parent component will handle completion screen
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header with Progress */}
            <div className={`sticky top-0 z-40 pb-4 shadow-sm ${isKids
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50'
                : 'bg-gradient-to-br from-green-50 to-emerald-50'
                }`}>
                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className={`font-bold text-gray-800 ${isKids ? 'text-lg' : 'text-xl'}`}>
                            {lessonTitle}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">❤️</span>
                            <span className="font-bold text-red-500">3</span>
                        </div>
                    </div>
                    <ProgressBar
                        current={currentQuestionIndex + 1}
                        total={questions.length}
                        isKids={isKids}
                    />
                </div>
            </div>

            {/* Question Content */}
            <div className="page-content pt-6">
                {currentQuestion.question_type === 'multiple_choice' && (
                    <MultipleChoice
                        question={currentQuestion.question_text}
                        options={currentQuestion.question_data.options}
                        correctIndex={currentQuestion.question_data.correct}
                        onAnswer={handleAnswer}
                        isKids={isKids}
                    />
                )}

                {currentQuestion.question_type === 'true_false' && (
                    <TrueFalse
                        question={currentQuestion.question_text}
                        correctAnswer={currentQuestion.question_data.correct}
                        onAnswer={handleAnswer}
                        isKids={isKids}
                    />
                )}

                {currentQuestion.question_type === 'select_all' && (
                    <SelectAll
                        question={currentQuestion.question_text}
                        options={currentQuestion.question_data.options}
                        correctIndices={currentQuestion.question_data.correct}
                        onAnswer={handleAnswer}
                        isKids={isKids}
                    />
                )}

                {/* Explanation Modal */}
                {showExplanation && (
                    <div className="fixed inset-0 flex items-end justify-center z-50 px-4 pb-24">
                        <div className="absolute inset-0 bg-black/50" onClick={handleContinue} />
                        <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl animate-slide-up">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="text-4xl">
                                    {answers[answers.length - 1]?.isCorrect ? '🎉' : '💡'}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold mb-2 ${answers[answers.length - 1]?.isCorrect ? 'text-green-600' : 'text-orange-600'
                                        } ${isKids ? 'text-lg' : 'text-xl'}`}>
                                        {answers[answers.length - 1]?.isCorrect ? 'Great job!' : 'Not quite!'}
                                    </h3>
                                    <p className={`text-gray-700 leading-relaxed ${isKids ? 'text-sm' : 'text-base'}`}>
                                        {currentQuestion.explanation}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleContinue}
                                className={`w-full py-4 rounded-xl font-bold text-white text-lg ${isKids
                                    ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
                                    } hover:opacity-90 transition-opacity`}
                            >
                                {isLastQuestion ? 'FINISH' : 'CONTINUE'}
                            </button>
                        </div>
                    </div>
                )}

                {/* XP Reward Animation */}
                {showXPReward && (
                    <XPReward
                        xp={earnedXP}
                        isKids={isKids}
                        onComplete={handleXPComplete}
                    />
                )}
            </div>
        </div>
    );
}
