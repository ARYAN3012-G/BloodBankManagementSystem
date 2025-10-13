import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { InventoryModel } from '../models/Inventory';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/arts-blood-foundation';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await UserModel.deleteMany({});
    await InventoryModel.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await UserModel.create({
      email: 'admin@artsblood.org',
      passwordHash: adminPassword,
      role: 'admin',
      name: 'System Administrator',
      phone: '+1-555-0123',
    });
    console.log('Created admin user:', admin.email);

    // Create sample hospital user
    const hospitalPassword = await bcrypt.hash('hospital123', 10);
    const hospital = await UserModel.create({
      email: 'hospital@artsblood.org',
      passwordHash: hospitalPassword,
      role: 'hospital',
      name: 'City General Hospital',
      phone: '+1-555-0124',
    });
    console.log('Created hospital user:', hospital.email);

    // Create sample donor
    const donorPassword = await bcrypt.hash('donor123', 10);
    const donor = await UserModel.create({
      email: 'donor@artsblood.org',
      passwordHash: donorPassword,
      role: 'donor',
      name: 'John Doe',
      phone: '+1-555-0125',
    });
    console.log('Created donor user:', donor.email);

    // Create sample external user
    const externalPassword = await bcrypt.hash('external123', 10);
    const external = await UserModel.create({
      email: 'external@artsblood.org',
      passwordHash: externalPassword,
      role: 'external',
      name: 'Jane Smith',
      phone: '+1-555-0126',
    });
    console.log('Created external user:', external.email);

    // Create sample inventory
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
    
    for (const bloodGroup of bloodGroups) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
      
      await InventoryModel.create({
        bloodGroup,
        units: Math.floor(Math.random() * 20) + 5, // Random between 5-25 units
        expiryDate,
        location: `Storage Unit ${Math.floor(Math.random() * 5) + 1}`,
      });
    }
    console.log('Created sample inventory for all blood groups');

    console.log('\n=== SEEDING COMPLETE ===');
    console.log('Sample accounts created:');
    console.log('Admin: admin@artsblood.org / admin123');
    console.log('Hospital: hospital@artsblood.org / hospital123');
    console.log('Donor: donor@artsblood.org / donor123');
    console.log('External: external@artsblood.org / external123');
    console.log('\nYou can now login with any of these accounts!');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();
