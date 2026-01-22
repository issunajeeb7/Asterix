'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FaUserFriends, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function CaregiverDashboardPage() {
    const { user } = useAuth();

    return (
        <div className="page-content">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Caregiver Dashboard
                </h1>
                <p className="text-gray-600">
                    Welcome, {user?.email?.split('@')[0] || 'Caregiver'}
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-lg">
                    <FaUserFriends className="text-3xl text-blue-500 mb-2" />
                    <p className="text-3xl font-bold text-gray-800">2</p>
                    <p className="text-sm text-gray-600">Active Learners</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg">
                    <FaCheckCircle className="text-3xl text-green-500 mb-2" />
                    <p className="text-3xl font-bold text-gray-800">5</p>
                    <p className="text-sm text-gray-600">Lessons Completed</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaCheckCircle className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">Emma completed "Understanding Phishing"</p>
                            <p className="text-sm text-gray-600">2 hours ago</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaClock className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">John started "Safe Password Practices"</p>
                            <p className="text-sm text-gray-600">5 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Quick Actions
                </h2>
                <div className="space-y-3">
                    <button className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                        Add New Learner
                    </button>
                    <button className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                        View Detailed Reports
                    </button>
                </div>
            </div>
        </div>
    );
}
