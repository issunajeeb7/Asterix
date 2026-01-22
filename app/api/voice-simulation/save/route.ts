import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { age_group, agent_id, transcript, duration } = await request.json();

        // Validate required fields
        if (!age_group || !agent_id || !transcript || !duration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate age_group
        if (!['kids', 'elderly'].includes(age_group)) {
            return NextResponse.json({ error: 'Invalid age_group' }, { status: 400 });
        }

        // Use Gemini to evaluate the conversation
        const evaluation = await evaluateConversationWithGemini(transcript, age_group);

        // First, save the raw transcript to voice_simulations table
        const { data: voiceSimulation, error: voiceSimError } = await supabase
            .from('voice_simulations')
            .insert({
                user_id: user.id,
                age_group,
                agent_id,
                transcript,
                passed: evaluation.success,
                duration,
                fail_reason: !evaluation.success ? evaluation.feedback : null
            })
            .select()
            .single();

        if (voiceSimError) {
            console.error('Error saving voice simulation:', voiceSimError);
        }

        // Get the simulation record from simulations table
        // For voice scam simulations, we'll use a specific simulation_id
        const simulationTitle = age_group === 'kids' ? 'Voice Scam Call (Kids)' : 'Voice Scam Call (Elderly)';
        
        const { data: simulationRecord, error: simFindError } = await supabase
            .from('simulations')
            .select('id')
            .eq('title', simulationTitle)
            .maybeSingle();

        console.log('Simulation lookup:', { simulationTitle, simulationRecord, simFindError });

        let simulationId = simulationRecord?.id;

        // If simulation doesn't exist, create it
        if (!simulationId) {
            console.log('Creating new simulation record...');
            const { data: newSim, error: simCreateError } = await supabase
                .from('simulations')
                .insert({
                    title: simulationTitle,
                    description: 'Real-time voice conversation with an AI scammer to practice scam detection',
                    simulation_type: 'scam_call',
                    difficulty: 'medium',
                    age_group: age_group,
                    xp_reward: 50
                })
                .select()
                .single();
            
            console.log('Simulation creation result:', { newSim, simCreateError });
            
            if (simCreateError) {
                console.error('Failed to create simulation:', simCreateError);
                return NextResponse.json({ error: 'Failed to create simulation record' }, { status: 500 });
            }
            
            simulationId = newSim?.id;
        }

        // Final check - ensure we have a simulation ID
        if (!simulationId) {
            console.error('No simulation ID available after lookup/create');
            return NextResponse.json({ error: 'Failed to get simulation ID' }, { status: 500 });
        }

        console.log('Using simulation ID:', simulationId);

        // Save to user_simulation_results table
        const { data: result, error: resultError } = await supabase
            .from('user_simulation_results')
            .insert({
                user_id: user.id,
                simulation_id: simulationId,
                success: evaluation.success,
                action_taken: evaluation.actionTaken,
                xp_earned: evaluation.success ? 50 : 0,
                completed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (resultError) {
            console.error('Error saving simulation result:', resultError);
            return NextResponse.json({ error: 'Failed to save simulation result' }, { status: 500 });
        }

        // If passed, award XP by updating user_stats directly
        if (evaluation.success) {
            const xpReward = 50;

            // Fetch current XP
            const { data: currentStats } = await supabase
                .from('user_stats')
                .select('total_xp')
                .eq('user_id', user.id)
                .single();

            if (currentStats) {
                const { error: xpError } = await supabase
                    .from('user_stats')
                    .update({
                        total_xp: (currentStats.total_xp || 0) + xpReward
                    })
                    .eq('user_id', user.id);

                if (xpError) {
                    console.error('Error updating XP:', xpError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            result,
            evaluation,
            xpAwarded: evaluation.success ? 50 : 0
        });

    } catch (error) {
        console.error('Error saving voice simulation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function evaluateConversationWithGemini(
    transcript: Array<{ role: string; message: string; timestamp: number }>,
    ageGroup: string
): Promise<{ success: boolean; feedback: string; actionTaken: string }> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Format transcript for Gemini
        const conversationText = transcript
            .map(msg => `${msg.role === 'agent' ? 'Scammer' : 'User'}: ${msg.message}`)
            .join('\n');

        const prompt = `You are evaluating a scam call simulation training exercise for ${ageGroup === 'kids' ? 'children (ages 10-14)' : 'elderly adults (60+)'}.

The user just had a voice conversation with an AI pretending to be a scammer. Your job is to determine if the user successfully recognized and resisted the scam.

CONVERSATION TRANSCRIPT:
${conversationText}

EVALUATION CRITERIA:

FAIL if the user:
- Shared any sensitive information (PIN, password, OTP, account numbers, personal details)
- Agreed to provide information when asked
- Showed willingness to comply with scammer's requests
- Provided any numeric codes or sequences

PASS if the user:
- Refused to share information
- Questioned the legitimacy of the call
- Expressed suspicion or distrust
- Said they would verify through official channels
- Hung up or ended the conversation safely

Respond in JSON format:
{
  "success": boolean,
  "feedback": "Brief explanation of why they passed or failed (2-3 sentences)",
  "actionTaken": "Summary of what the user did (1 sentence)"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse Gemini response');
        }

        const evaluation = JSON.parse(jsonMatch[0]);
        return evaluation;

    } catch (error) {
        console.error('Error evaluating with Gemini:', error);
        // Fallback evaluation
        return {
            success: false,
            feedback: 'Unable to evaluate conversation automatically. Please review the transcript.',
            actionTaken: 'Conversation completed'
        };
    }
}
