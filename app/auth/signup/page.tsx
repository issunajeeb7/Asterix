'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types/auth';
import { MdChildCare, MdElderly, MdSupervisorAccount } from 'react-icons/md';

function SignUpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    useEffect(() => {
        const roleParam = searchParams.get('role') as UserRole;
        if (roleParam && ['kids', 'elderly', 'caregiver'].includes(roleParam)) {
            setRole(roleParam);
        }
    }, [searchParams]);

    const getRoleConfig = () => {
        switch (role) {
            case 'kids':
                return {
                    icon: <MdChildCare className="text-4xl" />,
                    color: 'bg-amber-500',
                    title: 'Join as a Kid',
                    subtitle: 'Start your digital safety adventure!',
                };
            case 'elderly':
                return {
                    icon: <MdElderly className="text-4xl" />,
                    color: 'bg-emerald-500',
                    title: 'Join as Elderly',
                    subtitle: 'Learn to stay safe online',
                };
            case 'caregiver':
                return {
                    icon: <MdSupervisorAccount className="text-4xl" />,
                    color: 'bg-blue-500',
                    title: 'Join as Caregiver',
                    subtitle: 'Monitor and guide your loved ones',
                };
            default:
                return {
                    icon: null,
                    color: 'bg-purple-500',
                    title: 'Create Account',
                    subtitle: 'Join Asterix today',
                };
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!role) {
            setError('Please select a role');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role,
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                // Redirect based on role
                if (role === 'kids') {
                    router.push('/kids/home');
                } else if (role === 'elderly') {
                    router.push('/elderly/home');
                } else if (role === 'caregiver') {
                    router.push('/caregiver/progress');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up');
        } finally {
            setLoading(false);
        }
    };

    const config = getRoleConfig();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    {config.icon && (
                        <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                            {config.icon}
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">
                        {config.title}
                    </h1>
                    <p className="text-slate-600 text-sm">{config.subtitle}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Sign Up Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
                    {!role && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Select Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
                                required
                            >
                                <option value="">Choose your role...</option>
                                <option value="kids">Kids</option>
                                <option value="elderly">Elderly</option>
                                <option value="caregiver">Caregiver</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full ${config.color} text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all duration-300 disabled:opacity-50 mt-2`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-slate-600 text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}
