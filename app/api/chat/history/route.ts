import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch chat history for the current user
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

    // Fetch chat history ordered by creation time
    const { data: history, error: historyError } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('Error fetching chat history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    // Format messages for the frontend
    const messages = history?.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.message,
      timestamp: new Date(msg.created_at),
      imageUrl: msg.image_url || undefined
    })) || [];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in chat history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save a new message to chat history
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { role, message, imageUrl } = await request.json();

    if (!role || !message) {
      return NextResponse.json(
        { error: 'Role and message are required' },
        { status: 400 }
      );
    }

    // Save message to database
    const { error: insertError } = await supabase
      .from('ai_chat_history')
      .insert({
        user_id: user.id,
        role,
        message,
        image_url: imageUrl || null
      });

    if (insertError) {
      console.error('Error saving message:', insertError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in chat history save API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Clear all chat history for the current user
export async function DELETE() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all messages for this user
    const { error: deleteError } = await supabase
      .from('ai_chat_history')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting chat history:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete chat history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in chat history delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
