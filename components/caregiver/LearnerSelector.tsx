'use client';

import { useCaregiverContext } from '@/contexts/CaregiverContext';
import { FaChevronDown } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

export default function LearnerSelector() {
    const { selectedLearner, setSelectedLearner, learners, isLoading } = useCaregiverContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        );
    }

    if (learners.length === 0) {
        return (
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <p className="text-sm text-gray-500">No learners linked</p>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedLearner?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">
                            {selectedLearner?.name || 'Select Learner'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                            {selectedLearner?.ageGroup || ''}
                        </p>
                    </div>
                </div>
                <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {learners.map((learner) => (
                        <button
                            key={learner.id}
                            onClick={() => {
                                setSelectedLearner(learner);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedLearner?.id === learner.id ? 'bg-teal-50' : ''
                                }`}
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {learner.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                    {learner.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {learner.ageGroup || ''} • {learner.relationshipType || 'Guardian'}
                                </p>
                            </div>
                            {selectedLearner?.id === learner.id && (
                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
