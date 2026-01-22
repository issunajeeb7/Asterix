'use client';

import BottomNav from '@/components/BottomNav';
import { FaHome, FaBook, FaGamepad, FaRobot, FaUser, FaShieldAlt } from 'react-icons/fa';

export default function KidsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { label: 'Home', href: '/kids/home', icon: FaHome },
        { label: 'Lessons', href: '/kids/lessons', icon: FaBook },
        { label: 'Asterix', href: '/kids/assistant', icon: FaShieldAlt },
        { label: 'Drills', href: '/kids/simulations', icon: FaGamepad },
        
        { label: 'Profile', href: '/kids/profile', icon: FaUser },
    ];

    return (
        <div className="app-container bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen">
            {children}
            <BottomNav items={navItems} activeColor="#f59e0b" />
        </div>
    );
}
