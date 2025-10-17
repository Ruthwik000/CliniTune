import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let tasks;
    
    if (session.user.role === 'patient') {
      // Get tasks for the patient
      tasks = await Task.find({ patientId: session.user.id })
        .populate('clinicianId', 'name')
        .sort({ dueDate: 1 });
    } else if (session.user.role === 'clinician') {
      // Get all tasks created by the clinician, optionally filtered by patient
      const query: any = { clinicianId: session.user.id };
      if (patientId) {
        query.patientId = patientId;
      }
      
      tasks = await Task.find(query)
        .populate('patientId', 'name')
        .sort({ dueDate: 1 });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
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

    const { title, description, patientId, dueDate } = await request.json();

    if (!title || !description || !patientId || !dueDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const task = await Task.create({
      title,
      description,
      patientId,
      clinicianId: session.user.id,
      dueDate: new Date(dueDate),
      completed: false,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, completed } = await request.json();

    if (!taskId || completed === undefined) {
      return NextResponse.json(
        { error: 'Task ID and completed status are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify the task belongs to the user
    const task = await Task.findById(taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (session.user.role === 'patient' && task.patientId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'clinician' && task.clinicianId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    task.completed = completed;
    await task.save();

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}