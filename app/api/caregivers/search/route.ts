import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query || query.length < 3) {
            return NextResponse.json(
                { error: 'Query must be at least 3 characters' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get current user to exclude already linked caregivers
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get already linked caregiver IDs for this learner
        const { data: existingLinks } = await supabase
            .from('caregiver_learners')
            .select('caregiver_id')
            .eq('learner_id', user.id);

        const excludedIds = existingLinks?.map((link: any) => link.caregiver_id) || [];

        // Search for caregivers by email or name
        let queryBuilder = supabase
            .from('users')
            .select('id, email, full_name, role')
            .eq('role', 'caregiver')
            .limit(10);

        // Exclude already linked caregivers
        if (excludedIds.length > 0) {
            queryBuilder = queryBuilder.not('id', 'in', `(${excludedIds.join(',')})`);
        }

        // Search by email or name
        queryBuilder = queryBuilder.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);

        const { data: caregivers, error } = await queryBuilder;

        if (error) {
            console.error('Error searching caregivers:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ caregivers });
    } catch (error) {
        console.error('Error in caregiver search:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
