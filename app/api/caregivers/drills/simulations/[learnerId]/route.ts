import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ learnerId: string }> }
) {
    try {
        const { learnerId } = await params;
        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify relationship - user must be a caregiver for this learner
        const { data: relationship } = await supabase
            .from('caregiver_learners')
            .select('id')
            .eq('caregiver_id', user.id)
            .eq('learner_id', learnerId)
            .single();

        if (!relationship) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch simulation results for the learner
        const { data: results, error } = await supabase
            .from('user_simulation_results')
            .select(`
                id,
                simulation_id,
                success,
                action_taken,
                xp_earned,
                completed_at,
                simulations (
                    id,
                    title,
                    scenario_data,
                    correct_action,
                    difficulty,
                    age_group
                )
            `)
            .eq('user_id', learnerId)
            .order('completed_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Error fetching simulation results:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
