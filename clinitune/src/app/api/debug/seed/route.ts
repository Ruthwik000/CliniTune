import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'clinician') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if demo data already exists
    const existingClinician = await User.findOne({ email: 'clinician@demo.com' });
    if (existingClinician) {
      return NextResponse.json({ 
        message: 'Demo data already exists',
        clinician: existingClinician.name,
        patients: existingClinician.assignedPatients?.length || 0
      });
    }

    // Create demo data
    const hashedPassword = await bcrypt.hash('password', 12);

    // Create patients first
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'patient@demo.com',
      password: hashedPassword,
      role: 'patient',
    });

    const patient2 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@demo.com',
      password: hashedPassword,
      role: 'patient',
    });

    const patient3 = await User.create({
      name: 'Mike Chen',
      email: 'mike.chen@demo.com',
      password: hashedPassword,
      role: 'patient',
    });

    // Update current clinician with assigned patients
    const currentClinician = await User.findById(session.user.id);
    if (currentClinician) {
      currentClinician.assignedPatients = [patient1._id, patient2._id, patient3._id];
      await currentClinician.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Demo patients created and assigned successfully',
      patients: [
        { name: patient1.name, email: patient1.email },
        { name: patient2.name, email: patient2.email },
        { name: patient3.name, email: patient3.email }
      ]
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to create demo data', details: error.message },
      { status: 500 }
    );
  }
}