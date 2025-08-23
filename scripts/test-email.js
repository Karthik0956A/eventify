require('dotenv').config();
const { testEmailConfig, sendWelcomeEmail, sendPaymentConfirmationEmail, sendOTPEmail } = require('../utils/email');

async function testEmailSetup() {
  console.log('Testing email configuration...\n');
  
  try {
    // Test email configuration
    const isValid = await testEmailConfig();
    if (isValid) {
      console.log('✅ Email configuration is valid!\n');
      
      // Test welcome email
      console.log('Testing welcome email...');
      await sendWelcomeEmail('test@example.com', 'Test User');
      console.log('✅ Welcome email sent successfully!\n');
      
      // Test payment confirmation email
      console.log('Testing payment confirmation email...');
      await sendPaymentConfirmationEmail('test@example.com', 'Test User', 'Test Event', 25.00, '2024-01-15');
      console.log('✅ Payment confirmation email sent successfully!\n');
      
      // Test OTP email
      console.log('Testing OTP email...');
      await sendOTPEmail('test@example.com', 'Test User', '123456');
      console.log('✅ OTP email sent successfully!\n');
      
      console.log('🎉 All email tests passed! Your email configuration is working correctly.');
    } else {
      console.log('❌ Email configuration is invalid. Please check your SMTP settings.');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\nPlease make sure you have set the following environment variables:');
    console.log('- SMTP_USER: Your Gmail address');
    console.log('- SMTP_PASS: Your Gmail app password');
    console.log('\nNote: You need to enable 2-factor authentication and generate an app password for Gmail.');
  }
}

testEmailSetup();
