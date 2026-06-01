import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/life-style-app';

async function run() {
  await mongoose.connect(uri);
  const { generateDailyTip } = await import('./src/controllers/ai.controller.js');
  
  const User = (await import('./src/models/User.js')).default;
  const user = await User.findOne();
  
  const req = { user: user };
  const res = {
    status: function(s) {
      console.log('STATUS:', s);
      return this;
    },
    json: function(j) {
      console.log('JSON:', JSON.stringify(j, null, 2));
    }
  };
  
  await generateDailyTip(req, res);
  await mongoose.disconnect();
}

run().catch(console.error);
