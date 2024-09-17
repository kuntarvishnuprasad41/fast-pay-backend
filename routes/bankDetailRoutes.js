// routes/bankDetailRoutes.js
const express = require('express');
const router = express.Router();
const bankDetailController = require('../controllers/bankDetailController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    },
});
const upload = multer({ storage: storage });

// Admin and Merchant routes
router.post(
    '/',
    authenticate,
    authorize(['ADMIN', 'MERCHANT']),
    upload.single('qrCode'),
    bankDetailController.addBankDetail
);

// Implement other routes as needed

module.exports = router;
