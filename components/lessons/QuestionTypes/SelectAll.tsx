'use client';

import { useState } from 'react';

interface SelectAllProps {
    question: string;
    options: string[];
    correctIndices: number[];
    onAnswer: (isCorrect: boolean, selectedIndices: number[]) => void;
    isKids?: boolean;
}

export default function SelectAll({
    question,
    options,
    correctIndices,
    onAnswer,
    isKids = true
}: SelectAllProps) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [hasAnswered, setHasAnswered] = useState(false);

    const handleToggle = (index: number) => {
        if (hasAnswered) return;

        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleSubmit = () => {
        if (hasAnswered || selectedIndices.length === 0) return;

        // Check if selected indices match correct indices
        const isCorrect =
            selectedIndices.length === correctIndices.length &&
            selectedIndices.every(i => correctIndices.includes(i));

        setHasAnswered(true);
        onAnswer(isCorrect, selectedIndices);
    };

    const getOptionStyle = (index: number) => {
        if (!hasAnswered) {
            return selectedIndices.includes(index)
                ? isKids
                    ? 'bg-orange-100 border-orange-400 border-2'
                    : 'bg-blue-100 border-blue-400 border-2'
                : 'bg-white border-gray-200 border-2 hover:border-gray-300';
        }

        const isCorrect = correctIndices.includes(index);
        const isSelected = selectedIndices.includes(index);

        if (isCorrect && isSelected) {
            return 'bg-green-100 border-green-500 border-2'; // Correct and selected
        }
        if (isCorrect && !isSelected) {
            return 'bg-yellow-100 border-yellow-500 border-2'; // Correct but missed
        }
        if (!isCorrect && isSelected) {
            return 'bg-red-100 border-red-500 border-2'; // Wrong selection
        }
        return 'bg-gray-50 border-gray-200 border-2 opacity-50'; // Not selected, not correct
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Question */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                <h2 className={`font-bold text-gray-800 leading-relaxed ${isKids ? 'text-lg' : 'text-xl'}`}>
                    {question}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                    {isKids ? '💡 Tap all the right answers!' : '💡 Select all correct answers'}
                </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleToggle(index)}
                        disabled={hasAnswered}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${getOptionStyle(index)} ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer active:scale-98'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedIndices.includes(index)
                                    ? hasAnswered
                                        ? correctIndices.includes(index)
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-red-500 bg-red-500'
                                        : isKids
                                            ? 'border-orange-500 bg-orange-500'
                                            : 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300 bg-white'
                                }`}>
                                {selectedIndices.includes(index) && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            {/* Option Text */}
                            <span className={`font-medium text-gray-800 flex-1 ${isKids ? 'text-sm' : 'text-base'}`}>
                                {option}
                            </span>

                            {/* Feedback Icons */}
                            {hasAnswered && correctIndices.includes(index) && selectedIndices.includes(index) && (
                                <span className="text-2xl">✓</span>
                            )}
                            {hasAnswered && correctIndices.includes(index) && !selectedIndices.includes(index) && (
                                <span className="text-2xl text-yellow-600">!</span>
                            )}
                            {hasAnswered && !correctIndices.includes(index) && selectedIndices.includes(index) && (
                                <span className="text-2xl">✗</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Submit Button */}
            {!hasAnswered && (
                <button
                    onClick={handleSubmit}
                    disabled={selectedIndices.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 ${selectedIndices.length === 0
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
