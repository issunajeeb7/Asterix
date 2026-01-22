'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Learner {
    id: string;
    name: string | null;
    email: string | null;
    ageGroup: string | null;
    relationshipType: string | null;
}

interface CaregiverContextType {
    selectedLearner: Learner | null;
    setSelectedLearner: (learner: Learner | null) => void;
    learners: Learner[];
    setLearners: (learners: Learner[]) => void;
    isLoading: boolean;
}

const CaregiverContext = createContext<CaregiverContextType | undefined>(undefined);

export function CaregiverProvider({ children }: { children: ReactNode }) {
    const [selectedLearner, setSelectedLearnerState] = useState<Learner | null>(null);
    const [learners, setLearners] = useState<Learner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load learners on mount
    useEffect(() => {
        fetchLearners();
    }, []);

    // Load selected learner from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('selectedLearnerId');
        if (stored && learners.length > 0) {
            const learner = learners.find(l => l.id === stored);
            if (learner) {
                setSelectedLearnerState(learner);
            } else if (learners.length > 0) {
                // If stored learner not found, select first one
                setSelectedLearnerState(learners[0]);
            }
        } else if (learners.length > 0 && !selectedLearner) {
            // Auto-select first learner if none selected
            setSelectedLearnerState(learners[0]);
        }
    }, [learners]);

    const fetchLearners = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/caregivers/learners');
            if (response.ok) {
                const data = await response.json();
                setLearners(data.learners || []);
            }
        } catch (error) {
            console.error('Error fetching learners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setSelectedLearner = (learner: Learner | null) => {
        setSelectedLearnerState(learner);
        if (learner) {
            localStorage.setItem('selectedLearnerId', learner.id);
        } else {
            localStorage.removeItem('selectedLearnerId');
        }
    };

    return (
        <CaregiverContext.Provider
            value={{
                selectedLearner,
                setSelectedLearner,
                learners,
                setLearners,
                isLoading
            }}
        >
            {children}
        </CaregiverContext.Provider>
    );
}

export function useCaregiverContext() {
    const context = useContext(CaregiverContext);
    if (context === undefined) {
        throw new Error('useCaregiverContext must be used within a CaregiverProvider');
    }
    return context;
}
