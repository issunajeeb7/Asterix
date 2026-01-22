'use client';

import { useEffect, useState } from 'react';

interface XPRewardProps {
    xp: number;
    isKids?: boolean;
    onComplete: () => void;
}

export default function XPReward({ xp, isKids = true, onComplete }: XPRewardProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 300);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'
                }`}
            style={{ pointerEvents: show ? 'auto' : 'none' }}
        >
            <div className="absolute inset-0 bg-black/50" />
            <div
                className={`relative transform transition-all duration-500 ${show ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                    }`}
            >
                <div className={`rounded-full p-8 ${isKids
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                        : 'bg-gradient-to-br from-green-400 to-emerald-600'
                    } shadow-2xl`}>
                    <div className="text-center">
                        <div className="text-6xl mb-2">⭐</div>
                        <div className="text-4xl font-bold text-white">+{xp} XP</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
