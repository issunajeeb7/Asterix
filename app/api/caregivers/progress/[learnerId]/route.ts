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

        // Get learner's stats
        const { data: stats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', learnerId)
            .single();

        // Get current streak
        const currentStreak = stats?.current_streak || 0;

        // Get weekly progress (lessons completed this week)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const { data: weeklyLessons } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, completed_at')
            .eq('user_id', learnerId)
            .eq('status', 'completed')
            .gte('completed_at', startOfWeek.toISOString());

        const lessonsCompletedThisWeek = weeklyLessons?.length || 0;

        // Get total lessons for the learner's role (kids/elderly)
        const { data: learnerData } = await supabase
            .from('users')
            .select('role')
            .eq('id', learnerId)
            .single();

        const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('age_group', learnerData?.role || 'kids');

        // Get recent achievements (badges earned in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentBadges } = await supabase
            .from('user_badges')
            .select(`
                earned_at,
                badges (
                    name,
                    description,
                    icon
                )
            `)
            .eq('user_id', learnerId)
            .gte('earned_at', sevenDaysAgo.toISOString())
            .order('earned_at', { ascending: false })
            .limit(3);

        // Get incomplete lessons or lessons with low scores (needs attention)
        const { data: incompleteLessons } = await supabase
            .from('user_lesson_progress')
            .select(`
                lesson_id,
                score,
                lessons (
                    title
                )
            `)
            .eq('user_id', learnerId)
            .or('status.neq.completed,score.lt.70')
            .limit(3);

        // Get weekly activity data (last 7 days)
        const weeklyActivity = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const { count } = await supabase
                .from('user_lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', learnerId)
                .eq('status', 'completed')
                .gte('completed_at', date.toISOString())
                .lt('completed_at', nextDate.toISOString());

            weeklyActivity.push({
                day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
                count: count || 0
            });
        }

        // Get total completed lessons count
        const { count: totalLessonsCompleted } = await supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', learnerId)
            .eq('status', 'completed');

        // Get total badges earned count
        const { count: totalBadgesEarned } = await supabase
            .from('user_badges')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', learnerId);

        return NextResponse.json({
            currentStreak,
            weeklyProgress: {
                completed: lessonsCompletedThisWeek,
                total: totalLessons || 10
            },
            recentAchievements: recentBadges?.map((badge: any) => ({
                name: badge.badges?.name,
                description: badge.badges?.description,
                icon: badge.badges?.icon,
                earnedAt: badge.earned_at
            })) || [],
            needsAttention: incompleteLessons?.map((lesson: any) => ({
                lessonId: lesson.lesson_id,
                title: lesson.lessons?.title,
                score: lesson.score
            })) || [],
            weeklyActivity,
            totalStats: {
                xp: stats?.total_xp || 0,
                lessonsCompleted: totalLessonsCompleted || 0,
                badgesEarned: totalBadgesEarned || 0
            }
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
