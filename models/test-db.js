// test-db.js
const mongoose = require('mongoose');
require('dotenv').config(); // This loads the .env file

const mongoUrl = process.env.MONGODB_URI;

// --- A Quick Check ---
if (!mongoUrl) {
  console.log('❌ ERROR: MONGODB_URI not found in .env file.');
  process.exit();
} else {
  console.log('✅ Found MONGODB_URI in .env file.');
  // IMPORTANT: For debugging, we will partially hide the password.
  // Check your terminal to see if the username and cluster look correct.
  console.log('Connecting to:', mongoUrl.replace(/:([^:]*)@/, ':*****@'));
}

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✅✅✅ SUCCESS! You are connected to MongoDB!');
  } catch (error) {
    console.log('❌❌❌ FAILED to connect to MongoDB.');
    console.error(error.name + ':', error.message); // Print a cleaner error
  } finally {
    // We close the connection so the script can exit.
    await mongoose.disconnect();
  }
}

testConnection();