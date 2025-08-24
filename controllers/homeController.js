const Event = require('../models/Event');

exports.getHomePage = async (req, res) => {
  try {
    const { q, category, date } = req.query;
    let filter = { status: 'approved' }; // Only show approved events
    
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (date) filter.date = date;
    
    const events = await Event.find(filter).sort({ date: 1 });
    res.render('home', { 
      title: 'Eventify - Discover Amazing Events', 
      events: events || [], 
      user: req.session.user,
      query: req.query // Pass query parameters directly
    });
  } catch (err) {
    console.error('Home page error:', err);
    req.flash('error', 'Could not load events.');
    res.render('home', { 
      title: 'Eventify - Discover Amazing Events', 
      events: [], 
      user: req.session.user,
      query: req.query
    });
  }
};
