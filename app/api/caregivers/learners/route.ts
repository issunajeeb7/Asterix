import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Get current user (caregiver)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all learners linked to this caregiver
        const { data: relationships, error } = await supabase
            .from('caregiver_learners')
            .select(`
                id,
                learner_id,
                relationship_type,
                status,
                created_at,
                users!caregiver_learners_learner_id_fkey (
                    id,
                    email,
                    full_name,
                    role
                )
            `)
            .eq('caregiver_id', user.id)
            .eq('status', 'active');

        if (error) {
            console.error('Error fetching learners:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform the data to a cleaner format
        const learners = relationships?.map((rel: any) => ({
            id: rel.learner_id,
            email: rel.users?.email,
            name: rel.users?.full_name,
            ageGroup: rel.users?.role, // Using role (kids/elderly) as age group
            relationshipType: rel.relationship_type,
            linkedSince: rel.created_at
        })) || [];

        return NextResponse.json({ learners });
    } catch (error) {
        console.error('Error in get learners:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
