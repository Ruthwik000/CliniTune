import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AIChat from '@/models/AIChat';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Hybrid Chat API Starting ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', !!session, session?.user?.role);
    
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, patientId } = await request.json();
    console.log('Message:', message);
    console.log('Patient ID:', patientId);

    if (!message || !patientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');

    // Get or create chat session
    let chatSession = await AIChat.findOne({ patientId });
    console.log('Chat session found:', !!chatSession);
    
    if (!chatSession) {
      chatSession = new AIChat({
        patientId,
        messages: [],
        summary: '',
      });
      console.log('Created new chat session');
    }

    // Add user message
    chatSession.messages.push({
      sender: 'patient',
      text: message,
      timestamp: new Date(),
    });
    console.log('Added user message');

    let aiResponse: string;
    let mode = 'hybrid';

    try {
      // Try to get AI response from Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('No API key');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `You are a compassionate mental health assistant. Respond therapeutically to: ${message}` }]
            }],
            generationConfig: {
              maxOutputTokens: 200,
              temperature: 0.7,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        aiResponse = data.candidates[0]?.content?.parts[0]?.text || getFallbackResponse(message);
        mode = 'ai';
      } else {
        aiResponse = getFallbackResponse(message);
        mode = 'fallback';
      }
    } catch (error) {
      console.error('AI failed, using fallback:', error);
      aiResponse = getFallbackResponse(message);
      mode = 'fallback';
    }

    console.log('Generated response:', aiResponse);

    // Add AI response
    chatSession.messages.push({
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date(),
    });

    chatSession.lastUpdated = new Date();
    await chatSession.save();
    console.log('Saved chat session');

    return NextResponse.json({
      success: true,
      response: aiResponse,
      mode
    });

  } catch (error: any) {
    console.error('=== Hybrid Chat Error ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Chat failed: ' + error.message,
        debug: {
          errorName: error.name,
          errorMessage: error.message
        }
      },
      { status: 500 }
    );
  }
}

function getFallbackResponse(message: string): string {
  const messageText = message.toLowerCase();
  
  if (messageText.includes('sad') || messageText.includes('depressed') || messageText.includes('down')) {
    const responses = [
      "I hear that you're feeling sad right now. That's a valid emotion, and it's okay to sit with it. What do you think might be contributing to these feelings?",
      "It sounds like you're going through a difficult time. Sadness can be overwhelming, but you're not alone. What usually helps you when you feel this way?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (messageText.includes('anxious') || messageText.includes('worried') || messageText.includes('stress')) {
    const responses = [
      "I can hear the anxiety in what you're sharing. Anxiety can feel overwhelming, but remember that you have tools to manage it. What grounding techniques have worked for you before?",
      "It sounds like you're feeling quite worried. Have you tried any breathing exercises or mindfulness practices today?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (messageText.includes('angry') || messageText.includes('frustrated') || messageText.includes('mad')) {
    const responses = [
      "I can sense your frustration, and that's completely valid. Anger often tells us something important. What do you think might be underneath this feeling?",
      "It sounds like you're feeling really angry about this situation. That's okay - anger is a normal emotion. How do you usually cope when you feel this way?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (messageText.includes('good') || messageText.includes('better') || messageText.includes('happy')) {
    const responses = [
      "I'm so glad to hear you're feeling good! It's wonderful when we have these moments. What do you think has contributed to feeling better today?",
      "That's really positive to hear. It's important to acknowledge and celebrate when we're feeling better."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else {
    const responses = [
      "Thank you for sharing that with me. How are you feeling about this situation right now?",
      "I hear you, and it sounds like you're processing something important. What thoughts are coming up for you?",
      "I appreciate you opening up about this. What would feel most supportive for you right now?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
