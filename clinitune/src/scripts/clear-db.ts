import dbConnect from '../lib/mongodb';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Task from '../models/Task';
import AIChat from '../models/AIChat';
import Notification from '../models/Notification';

async function clearDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear all collections
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Task.deleteMany({});
    await AIChat.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('✅ Database cleared successfully!');
    console.log('All demo data has been removed.');
    console.log('Users can now sign up and create their own accounts.');

  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    process.exit(0);
  }
}

clearDatabase();