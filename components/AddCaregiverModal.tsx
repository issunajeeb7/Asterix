'use client';

import { useState } from 'react';
import { FaSearch, FaTimes, FaUserPlus } from 'react-icons/fa';

interface Caregiver {
    id: string;
    email: string;
    full_name: string;
}

interface AddCaregiverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
}

export default function AddCaregiverModal({ isOpen, onClose, onAdd }: AddCaregiverModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Caregiver[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleSearch = async () => {
        if (searchQuery.length < 3) return;

        setIsSearching(true);
        try {
            const response = await fetch(`/api/caregivers/search?query=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.caregivers || []);
            }
        } catch (error) {
            console.error('Error searching caregivers:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddCaregiver = async (caregiverId: string) => {
        setIsAdding(true);
        try {
            const response = await fetch('/api/caregivers/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caregiverId, relationshipType: 'guardian' })
            });

            if (response.ok) {
                onAdd();
                onClose();
                setSearchQuery('');
                setSearchResults([]);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add caregiver');
            }
        } catch (error) {
            console.error('Error adding caregiver:', error);
            alert('Failed to add caregiver');
        } finally {
            setIsAdding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Add Caregiver</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-4 text-sm">
                    Search for a caregiver by their email address
                </p>

                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter email..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-400"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searchQuery.length < 3 || isSearching}
                        className="w-full mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <FaSearch />
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {searchResults.map((caregiver) => (
                            <div
                                key={caregiver.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {caregiver.full_name || 'Caregiver'}
                                    </p>
                                    <p className="text-sm text-gray-500">{caregiver.email}</p>
                                </div>
                                <button
                                    onClick={() => handleAddCaregiver(caregiver.id)}
                                    disabled={isAdding}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <FaUserPlus />
                                    {isAdding ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                    <p className="text-gray-500 text-center py-4">
                        No caregivers found. Make sure they have signed up as a caregiver.
                    </p>
                )}
            </div>
        </div>
    );
}
