import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const seedDemoUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'demo@lifeos.com';
    const password = 'password123';

    // Delete if exists
    await User.deleteOne({ email });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: 'Demo User',
      email: email,
      passwordHash: passwordHash,
      city: 'Demo City'
    });

    console.log('\n✅ Demo User Created Successfully!');
    console.log('-----------------------------------');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo user:', error);
    process.exit(1);
  }
};

seedDemoUser();
