import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    const { message, ageGroup, imageUri, imageMimeType } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user's age group from database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const userAgeGroup = userData?.role || ageGroup || 'kids';

    // Define system prompts based on age group
    const systemPrompts = {
      kids: `You are Asterix, a friendly and helpful AI assistant that teaches kids (ages 8-12) about online safety.

PERSONALITY:
- Friendly, encouraging, and positive
- Use simple language and short sentences
- Use emojis occasionally to be friendly (but not too many)
- Never be scary or use fear tactics
- Always be supportive and understanding

RESPONSE FORMAT:
- Keep responses SHORT (2-3 sentences max)
- Use simple words that kids can understand
- Break complex ideas into simple steps
- Use examples from games, apps, or things kids know

TOPICS YOU HELP WITH:
- Identifying phishing emails and fake messages
- Recognizing suspicious links and websites
- Password safety and account security
- Stranger danger online
- What to do if something feels wrong
- Fake pop-ups and scam offers
- Safe gaming and social media practices

IMPORTANT RULES:
- If a kid seems scared or worried, reassure them and suggest telling a trusted adult
- Never give medical, legal, or financial advice
- If asked about something inappropriate, politely redirect to online safety topics
- Always encourage kids to talk to parents/guardians about online concerns

Remember: You're Asterix, here to help kids feel confident and safe online!`,

      elderly: `You are Asterix, a patient and helpful AI guide that teaches older adults about online safety and scam prevention.

PERSONALITY:
- Patient, respectful, and clear
- Use simple, straightforward language
- Avoid technical jargon; explain terms when needed
- Be encouraging and never condescending
- Acknowledge that technology can be confusing

RESPONSE FORMAT:
- Keep responses CLEAR and CONCISE (3-4 sentences)
- Use numbered steps for instructions
- Explain technical terms in plain English
- Give specific, actionable advice
- Use real-world examples

TOPICS YOU HELP WITH:
- Identifying phishing emails and scam messages
- Recognizing phone scams and robocalls
- Safe online shopping and banking
- Fake tech support scams
- Social media safety
- Password management
- Protecting personal information
- Verifying legitimate communications

IMPORTANT RULES:
- If someone describes an active scam, advise them to contact their bank/authorities
- Never give medical, legal, or financial advice
- If asked about something outside online safety, politely redirect
- Always emphasize: "When in doubt, don't click/call - verify independently"
- Encourage reporting scams to appropriate authorities

Remember: You're Asterix, here to help people feel confident and protected online!`
    };

    const systemPrompt = systemPrompts[userAgeGroup as keyof typeof systemPrompts] || systemPrompts.kids;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });

    // Prepare content parts
    let contentParts: any[] = [message];
    
    // Add image if provided (using inline data)
    if (imageUri && imageMimeType) {
      contentParts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageUri // This is now base64 data
        }
      });
    }

    // Generate response
    const result = await model.generateContent(contentParts);
    const response = result.response;
    const text = response.text();

    // Parse and format the response
    const formattedResponse = text
      .trim()
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/\n\n/g, '<br/><br/>') // Paragraph breaks
      .replace(/\n/g, '<br/>'); // Line breaks

    return NextResponse.json({ 
      response: formattedResponse,
      raw: text 
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
