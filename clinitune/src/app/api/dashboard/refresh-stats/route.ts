import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AIChat from '@/models/AIChat';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get clinician's patients
    const clinician = await User.findById(session.user.id).populate('assignedPatients');
    const patients = clinician?.assignedPatients || [];
    
    let updatedChats = 0;
    let totalAlerts = 0;
    
    // Check and update each patient's AI chat
    for (const patient of patients) {
      const aiChat = await AIChat.findOne({ patientId: patient._id });
      
      if (aiChat) {
        let needsUpdate = false;
        let newAlertLevel = aiChat.alertLevel;
        let newEmotionalState = aiChat.emotionalState;
        let newConcerns = aiChat.concerns || [];

        // Check all messages and summary for concerning content
        const allMessages = aiChat.messages.map((m: any) => m.text.toLowerCase()).join(' ');
        const summaryText = (aiChat.summary || '').toLowerCase();
        const combinedText = `${allMessages} ${summaryText}`;

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

        // Check for critical content
        const hasCriticalContent = criticalKeywords.some(keyword => combinedText.includes(keyword));
        const hasMediumContent = mediumKeywords.some(keyword => combinedText.includes(keyword));

        if (hasCriticalContent && (aiChat.alertLevel === 'none' || aiChat.alertLevel === 'low' || !aiChat.alertLevel)) {
          newAlertLevel = 'high';
          newEmotionalState = 'critical';
          newConcerns = ['Suicidal ideation', 'Self-harm risk', 'Crisis situation'];
          needsUpdate = true;
        } else if (hasMediumContent && (aiChat.alertLevel === 'none' || !aiChat.alertLevel)) {
          newAlertLevel = 'medium';
          newEmotionalState = 'distressed';
          newConcerns = ['Depression symptoms', 'Emotional distress'];
          needsUpdate = true;
        }

        if (needsUpdate) {
          await AIChat.findByIdAndUpdate(aiChat._id, {
            alertLevel: newAlertLevel,
            emotionalState: newEmotionalState,
            concerns: newConcerns
          });
          updatedChats++;
        }

        // Count alerts
        if (newAlertLevel && newAlertLevel !== 'none') {
          totalAlerts++;
        }
      }
    }

    return NextResponse.json({
      message: `Refreshed stats: ${updatedChats} chats updated, ${totalAlerts} total alerts`,
      updatedChats,
      totalAlerts,
      totalPatients: patients.length
    });

  } catch (error) {
    console.error('Refresh stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}