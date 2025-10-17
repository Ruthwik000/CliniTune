import bcrypt from 'bcryptjs';
import dbConnect from '../lib/mongodb';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Task from '../models/Task';
import AIChat from '../models/AIChat';

async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Task.deleteMany({});
    await AIChat.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password', 12);

    // Create clinician
    const clinician = await User.create({
      name: 'Dr. Sarah Smith',
      email: 'clinician@demo.com',
      password: hashedPassword,
      role: 'clinician',
      assignedPatients: [],
    });

    // Create patients
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'patient@demo.com',
      password: hashedPassword,
      role: 'patient',
      assignedClinician: clinician._id,
    });

    const patient2 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@demo.com',
      password: hashedPassword,
      role: 'patient',
      assignedClinician: clinician._id,
    });

    const patient3 = await User.create({
      name: 'Mike Chen',
      email: 'mike.chen@demo.com',
      password: hashedPassword,
      role: 'patient',
      assignedClinician: clinician._id,
    });

    // Update clinician with assigned patients
    clinician.assignedPatients = [patient1._id, patient2._id, patient3._id];
    await clinician.save();

    console.log('Created demo users');

    // Create demo appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(10, 0, 0, 0);

    await Appointment.create([
      {
        clinicianId: clinician._id,
        patientId: patient1._id,
        date: tomorrow,
        type: 'Therapy Session',
        status: 'upcoming',
      },
      {
        clinicianId: clinician._id,
        patientId: patient2._id,
        date: nextWeek,
        type: 'Follow-up',
        status: 'upcoming',
      },
    ]);

    console.log('Created demo appointments');

    // Create demo tasks
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    await Task.create([
      {
        title: 'Daily Mood Journal',
        description: 'Record your mood and any significant events from today.',
        patientId: patient1._id,
        clinicianId: clinician._id,
        completed: false,
        dueDate: today,
      },
      {
        title: 'Anxiety Assessment',
        description: 'Complete the GAD-7 questionnaire.',
        patientId: patient1._id,
        clinicianId: clinician._id,
        completed: false,
        dueDate: dueDate,
      },
      {
        title: 'Breathing Exercise',
        description: 'Practice the 4-7-8 breathing technique for 10 minutes.',
        patientId: patient2._id,
        clinicianId: clinician._id,
        completed: true,
        dueDate: today,
      },
    ]);

    console.log('Created demo tasks');

    // Create demo AI chat
    await AIChat.create({
      patientId: patient1._id,
      messages: [
        {
          sender: 'ai',
          text: 'Hello! How are you feeling today?',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        },
        {
          sender: 'patient',
          text: 'I\'m feeling a bit anxious about my upcoming presentation at work.',
          timestamp: new Date(Date.now() - 3500000),
        },
        {
          sender: 'ai',
          text: 'I understand that presentations can feel overwhelming. What specific aspects are making you feel most anxious?',
          timestamp: new Date(Date.now() - 3400000),
        },
        {
          sender: 'patient',
          text: 'I\'m worried I\'ll forget what to say or that people will judge me.',
          timestamp: new Date(Date.now() - 3300000),
        },
        {
          sender: 'ai',
          text: 'Those are very common concerns. Have you tried any of the preparation techniques we\'ve discussed before?',
          timestamp: new Date(Date.now() - 3200000),
        },
      ],
      summary: 'Patient expressing anxiety about work presentation. Main concerns include fear of forgetting content and being judged. Opportunity to reinforce coping strategies.',
      lastUpdated: new Date(),
    });

    console.log('Created demo AI chat');

    console.log('✅ Database seeded successfully!');
    console.log('\nDemo Accounts:');
    console.log('Clinician: clinician@demo.com / password');
    console.log('Patient: patient@demo.com / password');
    console.log('\nAdditional Patients:');
    console.log('sarah.johnson@demo.com / password');
    console.log('mike.chen@demo.com / password');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();