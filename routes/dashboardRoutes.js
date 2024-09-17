// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin dashboard route
router.get(
    '/admin',
    authenticate,
    authorize(['ADMIN']),
    dashboardController.getAdminDashboardData
);

// Merchant dashboard route
router.get(
    '/merchant',
    authenticate,
    authorize(['MERCHANT']),
    dashboardController.getMerchantDashboardData
);

module.exports = router;
