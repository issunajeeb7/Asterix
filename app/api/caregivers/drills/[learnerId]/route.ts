import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ learnerId: string }> }
) {
    try {
        const { learnerId } = await params;
        const supabase = await createClient();

        // Get current user (caregiver)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify caregiver has access to this learner
        const { data: relationship } = await supabase
            .from('caregiver_learners')
            .select('id')
            .eq('caregiver_id', user.id)
            .eq('learner_id', learnerId)
            .single();

        if (!relationship) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get voice simulation history
        const { data: simulations, error } = await supabase
            .from('voice_simulations')
            .select('id, created_at, duration, transcript, passed, fail_reason')
            .eq('user_id', learnerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching simulations:', error);
            return NextResponse.json(
                { error: 'Failed to fetch simulations' },
                { status: 500 }
            );
        }

        // Transform the data
        const history = simulations?.map((sim: any) => ({
            id: sim.id,
            created_at: sim.created_at,
            duration: sim.duration,
            passed: sim.passed || false,
            fail_reason: sim.fail_reason || null,
            transcript: typeof sim.transcript === 'string' ? JSON.parse(sim.transcript) : (sim.transcript || [])
        })) || [];

        return NextResponse.json({ history });
    } catch (error) {
        console.error('Error fetching drills:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
