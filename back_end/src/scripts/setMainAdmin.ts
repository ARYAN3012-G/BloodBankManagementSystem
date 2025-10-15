import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function setMainAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodbank');
    console.log('Connected to MongoDB');

    const mainAdminEmail = 'aryanrajeshgadam17@gmail.com';

    // Find the user
    const user = await UserModel.findOne({ email: mainAdminEmail });
    
    if (!user) {
      console.error(`❌ User with email ${mainAdminEmail} not found!`);
      console.log('Please register this user first with admin role.');
      process.exit(1);
    }

    // Update user to be main admin
    user.isMainAdmin = true;
    user.adminStatus = 'approved';
    user.approvedAt = new Date();
    
    await user.save();

    console.log('✅ Successfully set main admin:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Main Admin: ${user.isMainAdmin}`);
    console.log(`   Status: ${user.adminStatus}`);

    // Also approve any existing admins for backward compatibility
    const existingAdmins = await UserModel.find({ 
      role: 'admin', 
      email: { $ne: mainAdminEmail },
      adminStatus: { $ne: 'approved' }
    });

    if (existingAdmins.length > 0) {
      console.log(`\n📋 Found ${existingAdmins.length} existing admin(s) to approve:`);
      
      for (const admin of existingAdmins) {
        admin.adminStatus = 'approved';
        admin.approvedBy = user._id;
        admin.approvedAt = new Date();
        await admin.save();
        
        console.log(`   ✅ Approved: ${admin.name} (${admin.email})`);
      }
    }

    console.log('\n🎉 Main admin setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting main admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
setMainAdmin();
