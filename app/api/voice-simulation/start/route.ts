import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { age_group } = await request.json();

        // Validate age_group
        if (!age_group || !['kids', 'elderly'].includes(age_group)) {
            return NextResponse.json({ error: 'Invalid age_group' }, { status: 400 });
        }

        // Get the appropriate agent ID based on age group
        const agentId = age_group === 'kids' 
            ? process.env.ELEVENLABS_KIDS_AGENT_ID 
            : process.env.ELEVENLABS_ELDERLY_AGENT_ID;

        if (!agentId) {
            console.error(`Missing agent ID for age_group: ${age_group}`);
            return NextResponse.json({ error: 'Agent configuration missing' }, { status: 500 });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            console.error('ELEVENLABS_API_KEY not configured');
            return NextResponse.json({ error: 'Service configuration missing' }, { status: 500 });
        }

        // Generate a signed URL for the conversation
        // ElevenLabs requires calling their API to get a signed URL
        const signedUrlResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey
            }
        });

        if (!signedUrlResponse.ok) {
            const errorText = await signedUrlResponse.text();
            console.error('Failed to get signed URL:', errorText);
            return NextResponse.json({ error: 'Failed to initialize voice session' }, { status: 500 });
        }

        const { signed_url } = await signedUrlResponse.json();

        return NextResponse.json({
            signedUrl: signed_url,
            agentId: agentId,
            ageGroup: age_group
        });

    } catch (error) {
        console.error('Error starting voice simulation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
