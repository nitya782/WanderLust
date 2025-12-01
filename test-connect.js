const mongoose = require('mongoose');
require('dotenv').config();

async function testConnect() {
  const dbUrl = process.env.ATLASDB_URL;
  const options = { serverSelectionTimeoutMS: 5000 };
  console.log('Testing connection to', dbUrl ? dbUrl.replace(/(:\/\/.*@).+@/, '$1<REDACTED>@') : 'NO_URL');
  try {
    await mongoose.connect(dbUrl, options);
    console.log('Test connect: SUCCESS');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Test connect: FAILED');
    console.error(err);
  }
}

testConnect();
