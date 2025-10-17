import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let appointments;
    
    if (session.user.role === 'patient') {
      // Get appointments for the patient
      appointments = await Appointment.find({ patientId: session.user.id })
        .populate('clinicianId', 'name')
        .sort({ date: 1 });
    } else if (session.user.role === 'clinician') {
      // Get appointments for the clinician, optionally filtered by patient
      const query: any = { clinicianId: session.user.id };
      if (patientId) {
        query.patientId = patientId;
      }
      
      appointments = await Appointment.find(query)
        .populate('patientId', 'name')
        .sort({ date: 1 });
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId, date, type, notes } = await request.json();

    if (!patientId || !date || !type) {
      return NextResponse.json(
        { error: 'Patient ID, date, and type are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const appointment = await Appointment.create({
      clinicianId: session.user.id,
      patientId,
      date: new Date(date),
      type,
      notes: notes || '',
      status: 'upcoming',
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}