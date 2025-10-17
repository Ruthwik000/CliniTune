import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Appointment from '@/models/Appointment';
import AIChat from '@/models/AIChat';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      clinicianId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('patientId', 'name')
    .sort({ date: 1 })
    .limit(5);

    // Get recent AI summaries with alerts
    const clinician = await User.findById(session.user.id).populate('assignedPatients');
    const patients = clinician?.assignedPatients || [];
    
    const recentAISummaries = [];
    
    for (const patient of patients.slice(0, 5)) {
      const aiChat = await AIChat.findOne({ patientId: patient._id })
        .sort({ createdAt: -1 });
      
      if (aiChat && aiChat.summary) {
        let alertType = 'neutral';
        
        // Use the new alertLevel field if available
        if (aiChat.alertLevel) {
          switch (aiChat.alertLevel) {
            case 'high':
              alertType = 'alert';
              break;
            case 'medium':
              alertType = 'alert';
              break;
            case 'low':
              alertType = 'alert'; // Changed from 'neutral' to 'alert'
              break;
            default:
              alertType = 'neutral';
          }
        } else {
          // Enhanced fallback analysis for older records
          const summary = aiChat.summary.toLowerCase();
          const criticalKeywords = [
            'dying', 'dieing', 'die', 'suicide', 'kill myself', 'end it all', 
            'hopeless', 'worthless', 'harm myself', 'hurt myself', 'can\'t go on'
          ];
          const alertKeywords = [
            'concern', 'alert', 'urgent', 'depressed', 'anxious', 'panic', 
            'scared', 'worried', 'crying', 'distressed', 'crisis'
          ];
          
          if (criticalKeywords.some(keyword => summary.includes(keyword))) {
            alertType = 'alert';
          } else if (alertKeywords.some(keyword => summary.includes(keyword))) {
            alertType = 'alert';
          } else if (summary.includes('improvement') || summary.includes('positive') || summary.includes('better')) {
            alertType = 'positive';
          }
        }
        
        // Override neutral if concerning content is detected in summary
        const summary = aiChat.summary.toLowerCase();
        const criticalContent = [
          'dying', 'dieing', 'die', 'suicide', 'kill myself', 'end it all',
          'hopeless', 'worthless', 'harm myself', 'hurt myself', 'can\'t go on',
          'no point', 'give up', 'better off dead'
        ];
        
        if (criticalContent.some(keyword => summary.includes(keyword)) && alertType === 'neutral') {
          alertType = 'alert';
        }
        
        recentAISummaries.push({
          patientName: patient.name,
          summary: aiChat.summary,
          alertType,
          alertLevel: aiChat.alertLevel || 'none',
          concerns: aiChat.concerns || [],
          emotionalState: aiChat.emotionalState || 'stable',
          createdAt: aiChat.createdAt
        });
      }
    }

    // Sort by most recent
    recentAISummaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      todayAppointments: todayAppointments.map(apt => ({
        id: apt._id,
        patientName: apt.patientId.name,
        time: apt.date,
        type: apt.type,
        status: apt.status
      })),
      recentAISummaries: recentAISummaries.slice(0, 3)
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}