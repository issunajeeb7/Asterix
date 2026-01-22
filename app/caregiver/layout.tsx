'use client';

import BottomNav from '@/components/BottomNav';
import { FaChartLine, FaGamepad, FaCog } from 'react-icons/fa';
import { CaregiverProvider } from '@/contexts/CaregiverContext';
import LearnerSelector from '@/components/caregiver/LearnerSelector';

export default function CaregiverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { label: 'Progress', href: '/caregiver/progress', icon: FaChartLine },
        { label: 'Drills', href: '/caregiver/drills', icon: FaGamepad },
        { label: 'Settings', href: '/caregiver/settings', icon: FaCog },
    ];

    return (
        <CaregiverProvider>
            <div className="app-container bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
                {/* Sticky Header with Learner Selector */}
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 shadow-lg z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">Caregiver Dashboard</h1>
                            <p className="text-xs opacity-90">Monitor learner progress</p>
                        </div>
                        <LearnerSelector />
                    </div>
                </div>

                {/* Content with padding for sticky header */}
                <div className="pt-20 pb-20">
                    {children}
                </div>

                <BottomNav items={navItems} activeColor="#4f46e5" />
            </div>
        </CaregiverProvider>
    );
}
