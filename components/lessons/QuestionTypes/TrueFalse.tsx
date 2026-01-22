'use client';

import { useState } from 'react';

interface TrueFalseProps {
    question: string;
    correctAnswer: boolean;
    onAnswer: (isCorrect: boolean, selectedAnswer: boolean) => void;
    isKids?: boolean;
}

export default function TrueFalse({
    question,
    correctAnswer,
    onAnswer,
    isKids = true
}: TrueFalseProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    const handleSelect = (answer: boolean) => {
        if (hasAnswered) return;
        setSelectedAnswer(answer);
        const isCorrect = answer === correctAnswer;
        setHasAnswered(true);
        onAnswer(isCorrect, answer);
    };

    const getButtonStyle = (value: boolean) => {
        if (!hasAnswered) {
            if (selectedAnswer === value) {
                return value === true
                    ? 'bg-green-100 border-green-400 scale-105 text-green-800'
                    : 'bg-red-100 border-red-400 scale-105 text-red-800';
            }
            return value === true
                ? 'bg-green-50 border-green-200 hover:border-green-300 hover:scale-105 text-green-700'
                : 'bg-red-50 border-red-200 hover:border-red-300 hover:scale-105 text-red-700';
        }

        if (value === correctAnswer) {
            return 'bg-green-200 border-green-600 text-green-900';
        }

        if (value === selectedAnswer && value !== correctAnswer) {
            return 'bg-red-200 border-red-600 text-red-900';
        }

        return value === true
            ? 'bg-green-50 border-green-200 opacity-50 text-green-400'
            : 'bg-red-50 border-red-200 opacity-50 text-red-400';
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Question */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <h2 className={`font-bold text-gray-800 leading-relaxed ${isKids ? 'text-lg' : 'text-xl'}`}>
                    {question}
                </h2>
            </div>

            {/* True/False Buttons */}
            <div className="grid grid-cols-2 gap-4">
                {/* True Button */}
                <button
                    onClick={() => handleSelect(true)}
                    disabled={hasAnswered}
                    className={`relative p-8 rounded-2xl border-4 transition-all duration-200 ${getButtonStyle(true)} ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'
                        }`}
                >
                    <div className="text-center">
                        <div className="text-6xl mb-3">✓</div>
                        <div className={`font-bold ${isKids ? 'text-xl' : 'text-2xl'}`}>
                            TRUE
                        </div>
                    </div>

                    {/* Feedback */}
                    {hasAnswered && correctAnswer === true && (
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                            ✓
                        </div>
                    )}
                    {hasAnswered && selectedAnswer === true && correctAnswer === false && (
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                            ✗
                        </div>
                    )}
                </button>

                {/* False Button */}
                <button
                    onClick={() => handleSelect(false)}
                    disabled={hasAnswered}
                    className={`relative p-8 rounded-2xl border-4 transition-all duration-200 ${getButtonStyle(false)} ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'
                        }`}
                >
                    <div className="text-center">
                        <div className="text-6xl mb-3">✗</div>
                        <div className={`font-bold ${isKids ? 'text-xl' : 'text-2xl'}`}>
                            FALSE
                        </div>
                    </div>

                    {/* Feedback */}
                    {hasAnswered && correctAnswer === false && (
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                            ✓
                        </div>
                    )}
                    {hasAnswered && selectedAnswer === false && correctAnswer === true && (
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                            ✗
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
