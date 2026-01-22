'use client';

import { useState } from 'react';

interface MultipleChoiceProps {
    question: string;
    options: string[];
    correctIndex: number;
    onAnswer: (isCorrect: boolean, selectedIndex: number) => void;
    isKids?: boolean;
}

export default function MultipleChoice({
    question,
    options,
    correctIndex,
    onAnswer,
    isKids = true
}: MultipleChoiceProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    const handleSelect = (index: number) => {
        if (hasAnswered) return;
        setSelectedIndex(index);
    };

    const handleSubmit = () => {
        if (selectedIndex === null || hasAnswered) return;
        const isCorrect = selectedIndex === correctIndex;
        setHasAnswered(true);
        onAnswer(isCorrect, selectedIndex);
    };

    const getOptionStyle = (index: number) => {
        if (!hasAnswered) {
            return selectedIndex === index
                ? isKids
                    ? 'bg-orange-100 border-orange-400 border-2'
                    : 'bg-blue-100 border-blue-400 border-2'
                : 'bg-white border-gray-200 border-2 hover:border-gray-300';
        }

        if (index === correctIndex) {
            return 'bg-green-100 border-green-500 border-2';
        }

        if (index === selectedIndex && index !== correctIndex) {
            return 'bg-red-100 border-red-500 border-2';
        }

        return 'bg-gray-50 border-gray-200 border-2 opacity-50';
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Question */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h2 className={`font-bold text-gray-800 leading-relaxed ${isKids ? 'text-lg' : 'text-xl'}`}>
                    {question}
                </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        disabled={hasAnswered}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${getOptionStyle(index)} ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer active:scale-98'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Radio Circle */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedIndex === index
                                    ? hasAnswered
                                        ? index === correctIndex
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-red-500 bg-red-500'
                                        : isKids
                                            ? 'border-orange-500 bg-orange-500'
                                            : 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                }`}>
                                {selectedIndex === index && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>

                            {/* Option Text */}
                            <span className={`font-medium text-gray-800 ${isKids ? 'text-sm' : 'text-base'}`}>
                                {option}
                            </span>

                            {/* Feedback Icons */}
                            {hasAnswered && index === correctIndex && (
                                <span className="ml-auto text-2xl">✓</span>
                            )}
                            {hasAnswered && index === selectedIndex && index !== correctIndex && (
                                <span className="ml-auto text-2xl">✗</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Submit Button */}
            {!hasAnswered && (
                <button
                    onClick={handleSubmit}
                    disabled={selectedIndex === null}
                    className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 ${selectedIndex === null
                            ? 'bg-gray-300 cursor-not-allowed'
                            : isKids
                                ? 'bg-gradient-to-r from-orange-400 to-red-500 hover:opacity-90 active:scale-98'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 active:scale-98'
                        }`}
                >
                    CHECK
                </button>
            )}
        </div>
    );
}
