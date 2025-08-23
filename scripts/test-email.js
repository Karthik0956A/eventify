const { testEmailConfig, sendWelcomeEmail } = require('../utils/email');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    
    // Test connection
    const isConfigValid = await testEmailConfig();
    if (!isConfigValid) {
      console.error('❌ Email configuration is invalid');
      return;
    }
    
    console.log('✅ Email configuration is valid');
    
    // Test welcome email
    console.log('Testing welcome email...');
    await sendWelcomeEmail('test@example.com', 'Test User');
    console.log('✅ Welcome email sent successfully');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();
