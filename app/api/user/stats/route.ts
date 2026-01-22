import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Get badges count
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', user.id);

    const badgeCount = badges?.length || 0;

    // Calculate streak
    const streak = await calculateStreak(supabase, user.id);

    return NextResponse.json({
      xp: stats?.total_xp || 0,
      streak,
      badges: badgeCount
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateStreak(supabase: any, userId: string) {
  const { data: stats } = await supabase
    .from('user_stats')
    .select('last_activity_date')
    .eq('user_id', userId)
    .single();

  if (!stats?.last_activity_date) return 0;

  const lastActivity = new Date(stats.last_activity_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastActivity.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  // If last activity was today or yesterday, return a placeholder streak
  // TODO: Implement proper streak tracking
  if (diffDays <= 1) {
    return 5; // Placeholder
  }

  return 0;
}
