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

    // Get clinician's assigned patients
    const clinician = await User.findById(session.user.id).populate('assignedPatients');
    
    if (!clinician) {
      return NextResponse.json({ error: 'Clinician not found' }, { status: 404 });
    }

    // Get additional data for each patient
    const patientsWithData = await Promise.all(
      clinician.assignedPatients.map(async (patient: any) => {
        // Get latest appointment
        const latestAppointment = await Appointment.findOne({
          patientId: patient._id,
          clinicianId: session.user.id,
        }).sort({ date: -1 });

        // Get next appointment
        const nextAppointment = await Appointment.findOne({
          patientId: patient._id,
          clinicianId: session.user.id,
          date: { $gte: new Date() },
          status: 'upcoming',
        }).sort({ date: 1 });

        // Get task completion rate
        const totalTasks = await Task.countDocuments({
          patientId: patient._id,
          clinicianId: session.user.id,
        });
        
        const completedTasks = await Task.countDocuments({
          patientId: patient._id,
          clinicianId: session.user.id,
          completed: true,
        });

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Get AI alerts count based on alert level
        const aiChat = await AIChat.findOne({ patientId: patient._id });
        const aiAlerts = aiChat && aiChat.alertLevel && aiChat.alertLevel !== 'none' ? 1 : 0;

        return {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          lastSession: latestAppointment?.date || null,
          nextSession: nextAppointment?.date || null,
          completionRate,
          aiAlerts,
          status: aiAlerts > 0 ? 'alert' : 'active',
        };
      })
    );

    return NextResponse.json({ patients: patientsWithData });
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}