import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Create some test notifications
    const testNotifications = [
      {
        userId: session.user.id,
        title: 'New Appointment',
        message: 'You have a new appointment scheduled for tomorrow at 2:00 PM',
        type: 'appointment',
        read: false,
      },
      {
        userId: session.user.id,
        title: 'Task Reminder',
        message: 'Don\'t forget to complete your daily health check',
        type: 'task',
        read: false,
      },
      {
        userId: session.user.id,
        title: 'AI Health Alert',
        message: 'Your recent vitals show some patterns worth discussing with your clinician',
        type: 'ai_alert',
        read: false,
      },
    ];

    const notifications = await Notification.insertMany(testNotifications);

    return NextResponse.json({ 
      message: 'Test notifications created',
      notifications 
    }, { status: 201 });
  } catch (error) {
    console.error('Create test notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}