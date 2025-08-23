const express = require('express');
const router = express.Router();
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');

router.get('/validate/:qrId', async (req, res) => {
  try {
    const rsvp = await RSVP.findById(req.params.qrId).populate('eventId userId');
    if (!rsvp || rsvp.paymentStatus !== 'paid') {
      return res.render('partials/qrResult', { valid: false });
    }
    res.render('partials/qrResult', { valid: true, rsvp });
  } catch (err) {
    res.render('partials/qrResult', { valid: false });
  }
});

module.exports = router;
