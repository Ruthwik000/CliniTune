import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientEmail } = await request.json();

    if (!patientEmail) {
      return NextResponse.json(
        { error: 'Patient email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the patient by email
    const patient = await User.findOne({ 
      email: patientEmail, 
      role: 'patient' 
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Find the clinician
    const clinician = await User.findById(session.user.id);

    if (!clinician) {
      return NextResponse.json(
        { error: 'Clinician not found' },
        { status: 404 }
      );
    }

    // Check if patient is already assigned
    if (clinician.assignedPatients.includes(patient._id)) {
      return NextResponse.json(
        { error: 'Patient is already assigned to you' },
        { status: 400 }
      );
    }

    // Assign patient to clinician
    clinician.assignedPatients.push(patient._id);
    await clinician.save();

    return NextResponse.json({
      message: 'Patient assigned successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Assign patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}