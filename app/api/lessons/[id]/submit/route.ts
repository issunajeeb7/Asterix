import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answers, totalXP, correctCount, totalQuestions } = body;

    // 1. Save user answers
    const answerRecords = answers.map((answer: any) => ({
      user_id: user.id,
      question_id: answer.questionId,
      answer_data: answer.answerData,
      is_correct: answer.isCorrect
    }));

    const { error: answersError } = await supabase
      .from('user_answers')
      .insert(answerRecords);

    if (answersError) {
      console.error('Error saving answers:', answersError);
      return NextResponse.json(
        { error: 'Failed to save answers' },
        { status: 500 }
      );
    }

    // 2. Update user stats (XP)
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('total_xp')
      .eq('user_id', user.id)
      .single();

    const newTotalXP = (currentStats?.total_xp || 0) + totalXP;

    const { error: statsError } = await supabase
      .from('user_stats')
      .update({
        total_xp: newTotalXP,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', user.id);

    if (statsError) {
      console.error('Error updating stats:', statsError);
    }

    // 3. Update lesson progress
    const isPerfect = correctCount === totalQuestions;
    const isCompleted = true; // Lesson is completed regardless of score

    const { error: progressError } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        questions_correct: correctCount,
        questions_total: totalQuestions,
        attempts: 1, // TODO: Increment if retrying
        last_attempted_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      });

    if (progressError) {
      console.error('Error updating progress:', progressError);
    }

    // 4. Check for new badges
    const newBadges = await checkAndAwardBadges(supabase, user.id, {
      totalXP: newTotalXP,
      lessonsCompleted: await getLessonsCompletedCount(supabase, user.id),
      isPerfectLesson: isPerfect
    });

    return NextResponse.json({
      success: true,
      totalXP: newTotalXP,
      earnedXP: totalXP,
      newBadges
    });
  } catch (error) {
    console.error('Error submitting lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get lessons completed count
async function getLessonsCompletedCount(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed');

  return data?.length || 0;
}

// Helper function to check and award badges
async function checkAndAwardBadges(supabase: any, userId: string, stats: {
  totalXP: number;
  lessonsCompleted: number;
  isPerfectLesson: boolean;
}) {
  // Get user's age group (role)
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  const ageGroup = userData?.role || 'kids';

  // Get all badges for this age group
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .in('age_group', [ageGroup, 'both']);

  if (!badges) return [];

  // Get already earned badges
  const { data: earnedBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const earnedBadgeIds = new Set(earnedBadges?.map((b: any) => b.badge_id) || []);

  // Check which badges to award
  const newBadges = [];
  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let shouldAward = false;

    switch (badge.requirement_type) {
      case 'lessons_completed':
        shouldAward = stats.lessonsCompleted >= badge.requirement_value;
        break;
      case 'xp_earned':
        shouldAward = stats.totalXP >= badge.requirement_value;
        break;
      case 'perfect_lesson':
        shouldAward = stats.isPerfectLesson;
        break;
      // TODO: Add streak_days logic
    }

    if (shouldAward) {
      // Award badge
      await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badge.id
        });

      newBadges.push(badge);
    }
  }

  return newBadges;
}
