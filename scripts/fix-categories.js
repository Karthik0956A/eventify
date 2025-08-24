const mongoose = require('mongoose');
const Event = require('../models/Event');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventify')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get all events
      const events = await Event.find();
      console.log(`Total events: ${events.length}`);
      
      // Check for invalid categories
      const validCategories = ['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'];
      const invalidEvents = events.filter(event => !validCategories.includes(event.category));
      
      console.log(`Events with invalid categories: ${invalidEvents.length}`);
      
      if (invalidEvents.length > 0) {
        console.log('Invalid categories found:', [...new Set(invalidEvents.map(e => e.category))]);
        
        // Update invalid categories to 'Other'
        const updateResult = await Event.updateMany(
          { category: { $nin: validCategories } },
          { category: 'Other' }
        );
        
        console.log(`Updated ${updateResult.modifiedCount} events to category 'Other'`);
      } else {
        console.log('All events have valid categories!');
      }
      
      // Show final category distribution
      const categoryStats = await Event.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('\nCategory distribution:');
      categoryStats.forEach(stat => {
        console.log(`  ${stat._id}: ${stat.count} events`);
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
      console.log('Database connection closed');
    }
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });
