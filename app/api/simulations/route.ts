import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const ageGroupParam = url.searchParams.get('age_group');
        const ageGroup = ageGroupParam || (user.user_metadata?.role ?? 'kids');

        const { data, error } = await supabase
            .from('simulations')
            .select('*')
            .eq('is_published', true)
            .neq('simulation_type', 'voice-call')
            .in('age_group', [ageGroup, 'both'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching simulations', error);
            return NextResponse.json({ error: 'Failed to fetch simulations' }, { status: 500 });
        }

        return NextResponse.json({ simulations: data || [] });
    } catch (error) {
        console.error('Simulations GET error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
