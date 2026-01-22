'use client';

import BottomNav from '@/components/BottomNav';
import { FaHome, FaBook, FaShieldAlt, FaComments, FaUser, FaGamepad } from 'react-icons/fa';

export default function ElderlyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { label: 'Home', href: '/elderly/home', icon: FaHome },
        { label: 'Lessons', href: '/elderly/lessons', icon: FaBook },
        { label: 'Asterix', href: '/elderly/assistant', icon: FaShieldAlt },
        { label: 'Drills', href: '/elderly/simulations', icon: FaGamepad },
        { label: 'Profile', href: '/elderly/profile', icon: FaUser },
    ];

    return (
        <div className="app-container bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
            <div style={{ fontSize: '18px' }}>{/* Larger base font for elderly */}
                {children}
            </div>
            <BottomNav items={navItems} activeColor="#10b981" />
        </div>
    );
}
