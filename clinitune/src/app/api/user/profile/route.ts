import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, specialization, licenseNumber } = await request.json();

    await dbConnect();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (specialization) updateData.specialization = specialization;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        specialization: updatedUser.specialization,
        licenseNumber: updatedUser.licenseNumber,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}