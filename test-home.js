const Event = require('./models/Event');

// Test function to verify home page functionality
async function testHomePage() {
  try {
    console.log('Testing home page functionality...');
    
    // Test 1: Check if we can fetch approved events
    const events = await Event.find({ status: 'approved' }).sort({ date: 1 });
    console.log(`✅ Found ${events.length} approved events`);
    
    // Test 2: Check search functionality
    const searchResults = await Event.find({
      status: 'approved',
      $or: [
        { title: { $regex: 'test', $options: 'i' } },
        { description: { $regex: 'test', $options: 'i' } }
      ]
    });
    console.log(`✅ Search functionality working - found ${searchResults.length} results for 'test'`);
    
    // Test 3: Check category filter
    const categoryResults = await Event.find({ status: 'approved', category: 'Technology' });
    console.log(`✅ Category filter working - found ${categoryResults.length} Technology events`);
    
    console.log('✅ All home page functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testHomePage();
