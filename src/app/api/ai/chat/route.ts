import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AIChat from '@/models/AIChat';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let chats;
    
    if (session.user.role === 'patient') {
      // Get chats for the patient
      chats = await AIChat.find({ patientId: session.user.id })
        .sort({ createdAt: -1 });
    } else if (session.user.role === 'clinician') {
      // Get chats for specific patient if provided, otherwise return empty
      if (patientId) {
        chats = await AIChat.find({ patientId })
          .sort({ createdAt: -1 });
      } else {
        chats = [];
      }
    }

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Get AI chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getGeminiResponse(prompt: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY!;
    const modelName = 'models/gemini-2.0-flash-exp';
    
    const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-client': 'genai-js/0.21.0'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`API request failed: ${generateResponse.status} - ${errorText}`);
    }
    
    const generateData = await generateResponse.json();
    const responseText = generateData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response text received from AI service');
    }
    
    return responseText;
    
  } catch (error) {
    console.error('AI service error:', error);
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
        { error: 'AI service is not configured. Please contact your administrator.' },
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

    // Immediate risk assessment for current message
    const immediateRiskCheck = message.toLowerCase();
    const criticalKeywords = [
      'dying', 'dieing', 'die', 'suicide', 'kill myself', 'end it all', 
      'no point', 'hopeless', 'worthless', 'want to die', 'better off dead',
      'harm myself', 'hurt myself', 'can\'t go on', 'give up'
    ];
    
    const hasCriticalContent = criticalKeywords.some(keyword => immediateRiskCheck.includes(keyword));

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

    const aiResponse = await getGeminiResponse(prompt);
    
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

    // Immediate alert for critical content
    if (hasCriticalContent) {
      try {
        const User = (await import('@/models/User')).default;
        const patient = await User.findById(patientId);
        
        if (patient && patient.assignedClinician) {
          const Notification = (await import('@/models/Notification')).default;
          
          await Notification.create({
            userId: patient.assignedClinician,
            title: `URGENT: ${patient.name} - Critical Alert`,
            message: `Patient expressed concerning thoughts: "${message.substring(0, 100)}..." - Immediate attention required`,
            type: 'ai_alert',
            read: false,
          });
        }
        
        // Update chat session with immediate high alert
        chatSession.alertLevel = 'high';
        chatSession.concerns = ['Suicidal ideation', 'Self-harm risk', 'Crisis situation'];
        chatSession.emotionalState = 'critical';
        await chatSession.save();
      } catch (alertError) {
        console.error('Failed to create immediate alert:', alertError);
      }
    }

    // Generate summary and analyze sentiment for alerts
    if (chatSession.messages.length % 3 === 0 || hasCriticalContent) {
      try {
        const recentMessages = chatSession.messages.slice(-3).map((m: any) => `${m.sender}: ${m.text}`).join('\n');
        
        const analysisPrompt = `Analyze these patient messages for clinical insights and emotional state. Pay special attention to concerning language:

${recentMessages}

Provide a JSON response with:
1. "summary": Brief clinical summary for therapist
2. "alertLevel": "none", "low", "medium", or "high" 
3. "concerns": Array of specific concerns found
4. "emotionalState": Current emotional assessment

CRITICAL DETECTION PRIORITIES:
- HIGH RISK: Any mention of death, dying, suicide, self-harm, "no point living", hopelessness, worthlessness
- MEDIUM RISK: Depression symptoms, severe anxiety, panic, isolation, desperation
- LOW RISK: Stress, sadness, worry, mild emotional distress

Look for variations and misspellings like "dieing" (dying), "cant go on", etc.

If ANY concerning language is detected, do NOT classify as "neutral" - assign appropriate risk level.

Respond only with valid JSON:`;
        
        const analysisResponse = await getGeminiResponse(analysisPrompt);
        
        try {
          const analysis = JSON.parse(analysisResponse);
          
          chatSession.summary = analysis.summary || 'Patient engaged in conversation';
          
          // Override neutral classification if concerning content detected
          if (hasCriticalContent && (analysis.alertLevel === 'none' || analysis.emotionalState === 'neutral')) {
            chatSession.alertLevel = 'high';
            chatSession.emotionalState = 'distressed';
            chatSession.concerns = analysis.concerns || ['Concerning language detected'];
          } else {
            chatSession.alertLevel = analysis.alertLevel || 'none';
            chatSession.concerns = analysis.concerns || [];
            chatSession.emotionalState = analysis.emotionalState || 'stable';
          }
          
          await chatSession.save();

          // Create notification for clinician if there's an alert
          if (analysis.alertLevel && analysis.alertLevel !== 'none') {
            try {
              // Find the patient's assigned clinician
              const User = (await import('@/models/User')).default;
              const patient = await User.findById(patientId);
              
              if (patient && patient.assignedClinician) {
                const Notification = (await import('@/models/Notification')).default;
                
                const alertMessages = {
                  high: 'High priority: Patient may need immediate attention',
                  medium: 'Medium priority: Patient showing signs of distress',
                  low: 'Low priority: Patient experiencing mild emotional concerns'
                };

                await Notification.create({
                  userId: patient.assignedClinician,
                  title: `AI Alert: ${patient.name}`,
                  message: alertMessages[analysis.alertLevel as keyof typeof alertMessages] || 'Patient needs attention',
                  type: analysis.alertLevel === 'high' ? 'urgent' : analysis.alertLevel === 'medium' ? 'warning' : 'info',
                  read: false,
                });
              }
            } catch (notificationError) {
              console.error('Failed to create notification:', notificationError);
            }
          }
        } catch (parseError) {
          // Fallback if JSON parsing fails
          chatSession.summary = analysisResponse;
          
          // Enhanced keyword-based alert detection as fallback
          const messageText = recentMessages.toLowerCase();
          const highRiskKeywords = [
            'suicide', 'kill myself', 'end it all', 'no point', 'hopeless', 'worthless',
            'dying', 'dieing', 'die', 'death', 'want to die', 'better off dead',
            'harm myself', 'hurt myself', 'cut myself', 'overdose', 'pills',
            'can\'t go on', 'give up', 'no reason to live', 'everyone would be better'
          ];
          const mediumRiskKeywords = [
            'depressed', 'sad', 'anxious', 'panic', 'scared', 'worried', 'crying',
            'empty', 'numb', 'alone', 'isolated', 'dark thoughts', 'can\'t cope',
            'breaking down', 'falling apart', 'losing control', 'desperate',
            'trapped', 'suffocating', 'drowning', 'heavy', 'burden'
          ];
          const lowRiskKeywords = [
            'tired', 'stressed', 'overwhelmed', 'frustrated', 'upset',
            'down', 'low', 'blue', 'off', 'not great', 'struggling',
            'difficult', 'hard time', 'rough day', 'tough', 'challenging'
          ];
          
          if (highRiskKeywords.some(keyword => messageText.includes(keyword))) {
            chatSession.alertLevel = 'high';
          } else if (mediumRiskKeywords.some(keyword => messageText.includes(keyword))) {
            chatSession.alertLevel = 'medium';
          } else if (lowRiskKeywords.some(keyword => messageText.includes(keyword))) {
            chatSession.alertLevel = 'low';
          } else {
            chatSession.alertLevel = 'none';
          }
          
          await chatSession.save();

          // Create notification for clinician if there's an alert (fallback method)
          if (chatSession.alertLevel && chatSession.alertLevel !== 'none') {
            try {
              const User = (await import('@/models/User')).default;
              const patient = await User.findById(patientId);
              
              if (patient && patient.assignedClinician) {
                const Notification = (await import('@/models/Notification')).default;
                
                const alertMessages = {
                  high: 'High priority: Patient may need immediate attention',
                  medium: 'Medium priority: Patient showing signs of distress',
                  low: 'Low priority: Patient experiencing mild emotional concerns'
                };

                await Notification.create({
                  userId: patient.assignedClinician,
                  title: `AI Alert: ${patient.name}`,
                  message: alertMessages[chatSession.alertLevel as keyof typeof alertMessages] || 'Patient needs attention',
                  type: chatSession.alertLevel === 'high' ? 'urgent' : chatSession.alertLevel === 'medium' ? 'warning' : 'info',
                  read: false,
                });
              }
            } catch (notificationError) {
              console.error('Failed to create notification:', notificationError);
            }
          }
        }
      } catch (summaryError) {
        console.error('Analysis generation failed:', summaryError);
      }
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    let errorMessage = 'Unable to connect to AI service.';
    let statusCode = 500;
    
    if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
      errorMessage = 'AI service authentication failed.';
      statusCode = 503;
    } else if (error?.message?.includes('quota') || error?.message?.includes('limit') || error?.message?.includes('429')) {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
      statusCode = 503;
    } else if (error?.message?.includes('SAFETY')) {
      errorMessage = 'Message blocked by safety filters. Please rephrase your message.';
      statusCode = 400;
    } else if (error?.message?.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection.';
      statusCode = 503;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}