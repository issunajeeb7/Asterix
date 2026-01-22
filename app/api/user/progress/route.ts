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

    // Get user's age group (role)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const ageGroup = userData?.role || 'kids';

    // Get all lessons for this age group
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('age_group', ageGroup)
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      );
    }

    // Get user's progress for all lessons
    const { data: progress } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', user.id);

    // Create a map of lesson progress
    const progressMap = new Map();
    progress?.forEach(p => {
      progressMap.set(p.lesson_id, p);
    });

    // Combine lessons with progress
    const lessonsWithProgress = lessons?.map((lesson, index) => {
      const lessonProgress = progressMap.get(lesson.id);
      
      // Determine status
      let status = 'locked';
      if (lessonProgress?.status === 'completed') {
        status = 'completed';
      } else if (index === 0 || progressMap.get(lessons[index - 1]?.id)?.status === 'completed') {
        status = 'current';
      }

      return {
        ...lesson,
        status,
        progress: lessonProgress
      };
    });

    return NextResponse.json({
      lessons: lessonsWithProgress || []
    });
  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
