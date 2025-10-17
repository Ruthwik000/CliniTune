import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    
    // Get the patient by ID
    const patient = await User.findById(id);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Verify that this patient is assigned to the current clinician
    const clinician = await User.findById(session.user.id);
    const isAssigned = clinician?.assignedPatients?.some(
      (patientId: any) => patientId.toString() === id
    );

    if (!isAssigned) {
      return NextResponse.json(
        { error: 'Patient not assigned to you' },
        { status: 403 }
      );
    }

    // Return patient data (excluding sensitive information)
    const patientData = {
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      role: patient.role,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };

    return NextResponse.json({ patient: patientData });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}