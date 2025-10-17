import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AIChat from '@/models/AIChat';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Fallback Chat API Starting ===');
    
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

    // Therapeutic responses based on message content
    const messageText = message.toLowerCase();
    let aiResponse;
    
    if (messageText.includes('sad') || messageText.includes('depressed') || messageText.includes('down')) {
      const sadResponses = [
        "I hear that you're feeling sad right now. That's a valid emotion, and it's okay to sit with it. What do you think might be contributing to these feelings?",
        "It sounds like you're going through a difficult time. Sadness can be overwhelming, but you're not alone. What usually helps you when you feel this way?",
        "Thank you for sharing that you're feeling down. Sometimes acknowledging our sadness is the first step. Have you been able to practice any self-care today?"
      ];
      aiResponse = sadResponses[Math.floor(Math.random() * sadResponses.length)];
    } else if (messageText.includes('anxious') || messageText.includes('worried') || messageText.includes('stress')) {
      const anxietyResponses = [
        "I can hear the anxiety in what you're sharing. Anxiety can feel overwhelming, but remember that you have tools to manage it. What grounding techniques have worked for you before?",
        "It sounds like you're feeling quite worried. That's understandable given what you're going through. Have you tried any breathing exercises or mindfulness practices today?",
        "Stress and anxiety can be really challenging. You're being brave by talking about it. What's one small thing you could do right now to feel a bit more grounded?"
      ];
      aiResponse = anxietyResponses[Math.floor(Math.random() * anxietyResponses.length)];
    } else if (messageText.includes('angry') || messageText.includes('frustrated') || messageText.includes('mad')) {
      const angerResponses = [
        "I can sense your frustration, and that's completely valid. Anger often tells us something important. What do you think might be underneath this feeling?",
        "It sounds like you're feeling really angry about this situation. That's okay - anger is a normal emotion. How do you usually cope when you feel this way?",
        "Your frustration makes complete sense given what you're dealing with. Have you found any healthy ways to express or release these feelings?"
      ];
      aiResponse = angerResponses[Math.floor(Math.random() * angerResponses.length)];
    } else if (messageText.includes('good') || messageText.includes('better') || messageText.includes('happy')) {
      const positiveResponses = [
        "I'm so glad to hear you're feeling good! It's wonderful when we have these moments. What do you think has contributed to feeling better today?",
        "That's really positive to hear. It's important to acknowledge and celebrate when we're feeling better. What's been working well for you?",
        "I'm happy you're having a good day. These positive moments are so valuable. How can you carry this feeling forward?"
      ];
      aiResponse = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    } else {
      const generalResponses = [
        "Thank you for sharing that with me. How are you feeling about this situation right now?",
        "I hear you, and it sounds like you're processing something important. What thoughts are coming up for you?",
        "I appreciate you opening up about this. What would feel most supportive for you right now?",
        "It takes courage to share your experiences. How has your overall mood been lately?",
        "That sounds significant. What emotions are you noticing as you think about this?",
        "I'm here to listen and support you. What's been on your mind the most today?",
        "Thank you for trusting me with this. How are you taking care of yourself through this?",
        "I can hear that this is important to you. What insights are you gaining from this experience?"
      ];
      aiResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
    
    console.log('Generated fallback response:', aiResponse);

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
      mode: 'fallback'
    });

  } catch (error: any) {
    console.error('=== Fallback Chat Error ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Fallback chat failed: ' + error.message,
        debug: {
          errorName: error.name,
          errorMessage: error.message
        }
      },
      { status: 500 }
    );
  }
}