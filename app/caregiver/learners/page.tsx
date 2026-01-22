'use client';

import { FaPlus, FaUserCircle } from 'react-icons/fa';

export default function CaregiverLearnersPage() {
    const learners = [
        { id: 1, name: 'Emma', role: 'Kids', email: 'emma@example.com', status: 'Active' },
        { id: 2, name: 'John', role: 'Elderly', email: 'john@example.com', status: 'Active' },
    ];

    return (
        <div className="page-content">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Manage Learners
                </h1>
                <p className="text-gray-600">
                    View and manage your connected learners
                </p>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all mb-6 flex items-center justify-center gap-2">
                <FaPlus />
                Add New Learner
            </button>

            <div className="space-y-4">
                {learners.map((learner) => (
                    <div key={learner.id} className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
                                <FaUserCircle />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">{learner.name}</h3>
                                <p className="text-sm text-gray-600">{learner.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {learner.role}
                                    </span>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {learner.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
