'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface NavItem {
    label: string;
    href: string;
    icon: IconType;
}

interface BottomNavProps {
    items: NavItem[];
    activeColor?: string;
}

export default function BottomNav({ items, activeColor = '#3b82f6' }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center h-full px-2">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 h-full bottom-nav-item py-2 px-1"
                            style={{ color: isActive ? activeColor : '#6b7280' }}
                        >
                            <Icon className={`text-2xl mb-1 ${isActive ? 'scale-110' : ''}`} />
                            <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
