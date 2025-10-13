const { MongoClient } = require('mongodb');

// Test connection with different password encodings
const passwords = [
  'LODbóbFrgYhjaDay',           // Original
  'LODbobFrgYhjaDay',           // Without special character
  encodeURIComponent('LODbóbFrgYhjaDay')  // URL encoded
];

const baseUri = 'mongodb+srv://aryanrajeshgadam3012_db_user:';
const suffix = '@bloodbank.kypmodt.mongodb.net/arts-blood-foundation?retryWrites=true&w=majority&appName=BloodBank';

async function testConnection() {
  console.log('Testing MongoDB Atlas connection...\n');
  
  for (let i = 0; i < passwords.length; i++) {
    const password = passwords[i];
    const uri = baseUri + password + suffix;
    
    console.log(`Test ${i + 1}: ${password === 'LODbóbFrgYhjaDay' ? 'Original password' : password === 'LODbobFrgYhjaDay' ? 'Without special character' : 'URL encoded'}`);
    console.log(`URI: ${uri.replace(password, '***')}\n`);
    
    try {
      const client = new MongoClient(uri);
      await client.connect();
      console.log('✅ Connection successful!');
      
      // Test database access
      const db = client.db('arts-blood-foundation');
      const collections = await db.listCollections().toArray();
      console.log(`📊 Collections: ${collections.length}`);
      
      await client.close();
      console.log('✅ Test completed successfully!\n');
      
      // If successful, update the .env file
      if (i === 0) {
        console.log('Using original password - updating .env file...');
      } else if (i === 1) {
        console.log('Using password without special character - updating .env file...');
        // Update .env with working password
        const fs = require('fs');
        const envContent = `# Database - MongoDB Atlas Connection
MONGO_URI=mongodb+srv://aryanrajeshgadam3012_db_user:LODbobFrgYhjaDay@bloodbank.kypmodt.mongodb.net/arts-blood-foundation?retryWrites=true&w=majority&appName=BloodBank

# JWT Secret (keep this secure)
JWT_SECRET=arts-blood-foundation-super-secret-jwt-key-2024

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000`;
        
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env file updated with working password!');
      }
      
      break;
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}\n`);
    }
  }
}

testConnection().catch(console.error);
