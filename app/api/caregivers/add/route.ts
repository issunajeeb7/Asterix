import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { caregiverId, relationshipType } = await request.json();

        if (!caregiverId) {
            return NextResponse.json(
                { error: 'Caregiver ID is required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get current user (learner)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if learner already has a caregiver
        const { data: existingCaregiver } = await supabase
            .from('caregiver_learners')
            .select('id')
            .eq('learner_id', user.id)
            .single();

        if (existingCaregiver) {
            return NextResponse.json(
                { error: 'You already have a caregiver. Please remove the existing one first.' },
                { status: 400 }
            );
        }

        // Add caregiver relationship
        const { data, error } = await supabase
            .from('caregiver_learners')
            .insert({
                caregiver_id: caregiverId,
                learner_id: user.id,
                relationship_type: relationshipType || 'guardian',
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding caregiver:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error in add caregiver:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();

        // Get current user (learner)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Remove caregiver relationship
        const { error } = await supabase
            .from('caregiver_learners')
            .delete()
            .eq('learner_id', user.id);

        if (error) {
            console.error('Error removing caregiver:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in remove caregiver:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
