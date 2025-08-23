const express = require('express');
const router = express.Router();

router.get('/chat', (req, res) => res.send('TODO: Community Chat (Socket.io)'));
router.get('/reminders', (req, res) => res.send('TODO: Event Reminders (cron/email)'));
router.get('/qr', (req, res) => res.send('TODO: QR Code for ticket validation'));
router.get('/gamification', (req, res) => res.send('TODO: Gamification (points for attending)'));

module.exports = router;
