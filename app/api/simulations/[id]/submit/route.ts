import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const actionTaken = body?.actionTaken;

        const { data: simulation, error: simError } = await supabase
            .from('simulations')
            .select('*')
            .eq('id', id)
            .eq('is_published', true)
            .single();

        if (simError || !simulation) {
            return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
        }

        const correct = (simulation.correct_action || '').trim().toLowerCase();
        const chosen = (actionTaken || '').trim().toLowerCase();
        const success = !!correct && correct === chosen;
        const xpEarned = success ? (simulation.xp_reward ?? 75) : 0;

        await supabase.from('user_simulation_results').insert({
            user_id: user.id,
            simulation_id: id,
            success,
            action_taken: actionTaken,
            xp_earned: xpEarned
        });

        // update total_xp in user_stats
        const { data: stats } = await supabase
            .from('user_stats')
            .select('total_xp')
            .eq('user_id', user.id)
            .single();

        if (stats) {
            await supabase
                .from('user_stats')
                .update({ total_xp: (stats.total_xp || 0) + xpEarned })
                .eq('user_id', user.id);
        } else {
            await supabase
                .from('user_stats')
                .insert({ user_id: user.id, total_xp: xpEarned });
        }

        const feedback = success ? 'Nice! You picked the safe action.' : 'That choice is risky. Look for signs of phishing or scams next time.';

        return NextResponse.json({ success, xpEarned, feedback });
    } catch (error) {
        console.error('Simulations submit error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
