import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const ageGroup = searchParams.get('age_group');

        if (!ageGroup || !['kids', 'elderly'].includes(ageGroup)) {
            return NextResponse.json({ error: 'Invalid age_group' }, { status: 400 });
        }

        // Get user's voice simulation history
        const { data: history, error: historyError } = await supabase
            .from('voice_simulations')
            .select('*')
            .eq('user_id', user.id)
            .eq('age_group', ageGroup)
            .order('created_at', { ascending: false });

        if (historyError) {
            console.error('Error fetching history:', historyError);
            return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
        }

        return NextResponse.json({ history });

    } catch (error) {
        console.error('Error fetching voice simulation history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
