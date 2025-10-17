import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all patients in the system (for debugging)
    const allPatients = await User.find({ role: 'patient' }).select('name email _id');
    
    // Get clinician's assigned patients
    const clinician = await User.findById(session.user.id).populate('assignedPatients', 'name email _id');
    
    return NextResponse.json({ 
      allPatients: allPatients.map(p => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email
      })),
      assignedPatients: clinician?.assignedPatients?.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email
      })) || [],
      clinicianInfo: {
        id: clinician?._id,
        name: clinician?.name,
        assignedCount: clinician?.assignedPatients?.length || 0
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}