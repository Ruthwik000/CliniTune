import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Test the enhanced sentiment analysis logic
    const messageText = message.toLowerCase();
    
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

    let alertLevel = 'none';
    let emotionalState = 'stable';
    let concerns: string[] = [];
    let detectedKeywords: string[] = [];

    // Check for high risk keywords
    const highRiskFound = highRiskKeywords.filter(keyword => messageText.includes(keyword));
    if (highRiskFound.length > 0) {
      alertLevel = 'high';
      emotionalState = 'critical';
      concerns = ['Suicidal ideation', 'Self-harm risk', 'Crisis situation'];
      detectedKeywords = highRiskFound;
    }
    // Check for medium risk keywords
    else if (mediumRiskKeywords.some(keyword => messageText.includes(keyword))) {
      const mediumRiskFound = mediumRiskKeywords.filter(keyword => messageText.includes(keyword));
      alertLevel = 'medium';
      emotionalState = 'distressed';
      concerns = ['Depression symptoms', 'Emotional distress'];
      detectedKeywords = mediumRiskFound;
    }
    // Check for low risk keywords
    else if (lowRiskKeywords.some(keyword => messageText.includes(keyword))) {
      const lowRiskFound = lowRiskKeywords.filter(keyword => messageText.includes(keyword));
      alertLevel = 'low';
      emotionalState = 'mild_distress';
      concerns = ['Mild emotional concerns'];
      detectedKeywords = lowRiskFound;
    }

    return NextResponse.json({
      message,
      analysis: {
        alertLevel,
        emotionalState,
        concerns,
        detectedKeywords,
        shouldAlert: alertLevel !== 'none'
      }
    });

  } catch (error) {
    console.error('Sentiment test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}