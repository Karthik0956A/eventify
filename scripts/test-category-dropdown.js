const fs = require('fs');
const path = require('path');

// Test the new event form
const newEventForm = fs.readFileSync(path.join(__dirname, '../views/events/new.ejs'), 'utf8');
console.log('Testing new event form...');

// Check if category dropdown exists
if (newEventForm.includes('<select name="category"')) {
  console.log('✅ Category dropdown found in new event form');
} else {
  console.log('❌ Category dropdown not found in new event form');
}

// Check if all categories are present
const categories = ['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'];
categories.forEach(category => {
  if (newEventForm.includes(`value="${category}"`)) {
    console.log(`✅ Category "${category}" found in new event form`);
  } else {
    console.log(`❌ Category "${category}" not found in new event form`);
  }
});

// Test the edit event form
const editEventForm = fs.readFileSync(path.join(__dirname, '../views/events/edit.ejs'), 'utf8');
console.log('\nTesting edit event form...');

// Check if category dropdown exists
if (editEventForm.includes('<select name="category"')) {
  console.log('✅ Category dropdown found in edit event form');
} else {
  console.log('❌ Category dropdown not found in edit event form');
}

// Check if all categories are present with selected logic
categories.forEach(category => {
  if (editEventForm.includes(`value="${category}"`) && editEventForm.includes(`event.category === '${category}'`)) {
    console.log(`✅ Category "${category}" with selection logic found in edit event form`);
  } else {
    console.log(`❌ Category "${category}" with selection logic not found in edit event form`);
  }
});

// Test the Event model
const eventModel = fs.readFileSync(path.join(__dirname, '../models/Event.js'), 'utf8');
console.log('\nTesting Event model...');

if (eventModel.includes('enum: [')) {
  console.log('✅ Category enum found in Event model');
} else {
  console.log('❌ Category enum not found in Event model');
}

categories.forEach(category => {
  if (eventModel.includes(`'${category}'`)) {
    console.log(`✅ Category "${category}" found in Event model enum`);
  } else {
    console.log(`❌ Category "${category}" not found in Event model enum`);
  }
});

console.log('\n✅ Category dropdown implementation test completed!');
