'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCaregiverContext } from '@/contexts/CaregiverContext';
import { FaUser, FaSignOutAlt, FaUsers } from 'react-icons/fa';

export default function CaregiverSettingsPage() {
    const router = useRouter();
    const { learners } = useCaregiverContext();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <FaUser className="text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {profile?.full_name || 'Caregiver'}
                            </h2>
                            <p className="text-sm text-gray-500">{profile?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">User Type</span>
                            <span className="font-semibold text-gray-800 capitalize">
                                {profile?.role || 'Caregiver'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Member Since</span>
                            <span className="font-semibold text-gray-800">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString()
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* Linked Learners Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FaUsers className="text-indigo-600 text-xl" />
                        <h3 className="text-xl font-bold text-gray-800">Linked Learners</h3>
                    </div>

                    {learners.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            No learners linked yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {learners.map((learner) => (
                                <div
                                    key={learner.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {learner.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">
                                            {learner.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {learner.ageGroup} • {learner.relationshipType || 'Guardian'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                    <FaSignOutAlt />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
