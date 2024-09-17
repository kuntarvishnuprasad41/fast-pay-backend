// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Merchant routes
router.post(
    '/',
    authenticate,
    authorize(['MERCHANT']),
    supportController.createSupportTicket
);

router.get(
    '/',
    authenticate,
    authorize(['MERCHANT']),
    supportController.getSupportTickets
);

// Admin and Support routes
router.patch(
    '/:ticketId',
    authenticate,
    authorize(['ADMIN', 'SUPPORT']),
    supportController.updateSupportTicketStatus
);

module.exports = router;
