import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AIChat from '@/models/AIChat';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find all AI chats that might be misclassified
    const aiChats = await AIChat.find({});
    
    let updatedCount = 0;
    const criticalKeywords = [
      'dying', 'dieing', 'die', 'death', 'suicide', 'kill myself', 'end it all',
      'hopeless', 'worthless', 'harm myself', 'hurt myself', 'can\'t go on',
      'no point', 'give up', 'better off dead', 'want to die'
    ];
    
    const mediumKeywords = [
      'depressed', 'sad', 'anxious', 'panic', 'scared', 'worried', 'crying',
      'empty', 'numb', 'alone', 'isolated', 'dark thoughts', 'can\'t cope',
      'breaking down', 'falling apart', 'losing control', 'desperate'
    ];

    for (const chat of aiChats) {
      let needsUpdate = false;
      let newAlertLevel = chat.alertLevel;
      let newEmotionalState = chat.emotionalState;
      let newConcerns = chat.concerns || [];

      // Check messages for concerning content
      const allMessages = chat.messages.map((m: any) => m.text.toLowerCase()).join(' ');
      const summaryText = (chat.summary || '').toLowerCase();
      const combinedText = `${allMessages} ${summaryText}`;

      // Check for critical content
      const hasCriticalContent = criticalKeywords.some(keyword => combinedText.includes(keyword));
      const hasMediumContent = mediumKeywords.some(keyword => combinedText.includes(keyword));

      if (hasCriticalContent && (chat.alertLevel === 'none' || chat.alertLevel === 'low' || !chat.alertLevel)) {
        newAlertLevel = 'high';
        newEmotionalState = 'critical';
        newConcerns = ['Suicidal ideation', 'Self-harm risk', 'Crisis situation'];
        needsUpdate = true;
      } else if (hasMediumContent && (chat.alertLevel === 'none' || !chat.alertLevel)) {
        newAlertLevel = 'medium';
        newEmotionalState = 'distressed';
        newConcerns = ['Depression symptoms', 'Emotional distress'];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await AIChat.findByIdAndUpdate(chat._id, {
          alertLevel: newAlertLevel,
          emotionalState: newEmotionalState,
          concerns: newConcerns
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: `Updated ${updatedCount} AI chat classifications`,
      updatedCount
    });

  } catch (error) {
    console.error('Fix classifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}