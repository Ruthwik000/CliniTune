import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
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
    const todayAppointments = await Appointment.countDocuments({
      clinicianId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get active patients count
    const clinician = await User.findById(session.user.id).populate('assignedPatients');
    const activePatients = clinician?.assignedPatients?.length || 0;

    // Get AI alerts count based on alert levels
    const patients = clinician?.assignedPatients || [];
    let aiAlerts = 0;
    
    for (const patient of patients) {
      const aiChat = await AIChat.findOne({ patientId: patient._id });
      if (aiChat) {
        // Check alertLevel first
        if (aiChat.alertLevel && aiChat.alertLevel !== 'none') {
          aiAlerts++;
        } 
        // Fallback: check for concerning content in summary
        else if (aiChat.summary) {
          const summary = aiChat.summary.toLowerCase();
          const criticalKeywords = [
            'dying', 'dieing', 'die', 'suicide', 'kill myself', 'end it all',
            'hopeless', 'worthless', 'harm myself', 'hurt myself', 'can\'t go on',
            'depressed', 'anxious', 'panic', 'crisis', 'urgent', 'concern'
          ];
          
          if (criticalKeywords.some(keyword => summary.includes(keyword))) {
            aiAlerts++;
          }
        }
      }
    }

    // Calculate completion rate
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (const patient of patients) {
      const patientTotalTasks = await Task.countDocuments({
        patientId: patient._id,
        clinicianId: session.user.id,
      });
      
      const patientCompletedTasks = await Task.countDocuments({
        patientId: patient._id,
        clinicianId: session.user.id,
        completed: true,
      });
      
      totalTasks += patientTotalTasks;
      completedTasks += patientCompletedTasks;
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      todayAppointments,
      activePatients,
      aiAlerts,
      completionRate
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}