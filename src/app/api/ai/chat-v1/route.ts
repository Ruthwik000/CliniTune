import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AIChat from '@/models/AIChat';

// Try using v1 API instead of v1beta
async function getGeminiResponseV1(prompt: string) {
  try {
    console.log('Trying v1 API with direct fetch...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      })
    });

    console.log('V1 API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('V1 API Error:', errorText);
      throw new Error(`V1 API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('V1 API Success:', data);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('No valid response from V1 API');
    
  } catch (error) {
    console.error('V1 Gemini API Error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, patientId } = await request.json();

    if (!message || !patientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured.' },
        { status: 503 }
      );
    }

    await dbConnect();

    // Get or create chat session
    let chatSession = await AIChat.findOne({ patientId });
    
    if (!chatSession) {
      chatSession = new AIChat({
        patientId,
        messages: [],
        summary: '',
      });
    }

    // Add user message
    chatSession.messages.push({
      sender: 'patient',
      text: message,
      timestamp: new Date(),
    });

    // Create therapeutic prompt
    const recentContext = chatSession.messages.slice(-2).map((m: any) => `${m.sender}: ${m.text}`).join('\n');
    
    const prompt = `You are a supportive AI wellness assistant for therapy patients.

Be empathetic and supportive. Keep responses to 2-3 sentences. Never give medical advice.

${recentContext ? `Recent context:\n${recentContext}\n` : ''}
Patient: ${message}

AI Response:`;

    // Try V1 API
    const aiResponse = await getGeminiResponseV1(prompt);
    
    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    // Add AI response
    chatSession.messages.push({
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date(),
    });

    chatSession.lastUpdated = new Date();
    await chatSession.save();

    return NextResponse.json({
      success: true,
      response: aiResponse,
      apiVersion: 'v1'
    });

  } catch (error: any) {
    console.error('V1 AI Chat Error:', error);
    
    return NextResponse.json(
      { 
        error: 'V1 API failed: ' + error.message,
        debug: {
          originalError: error?.message,
          apiKeyExists: !!process.env.GEMINI_API_KEY,
        }
      },
      { status: 500 }
    );
  }
}