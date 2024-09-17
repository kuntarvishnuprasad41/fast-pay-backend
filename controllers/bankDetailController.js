// controllers/bankDetailController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

exports.addBankDetail = async (req, res, next) => {
    try {
        const data = req.body;
        if (req.file) {
            data.qrCodeUrl = `/uploads/${req.file.filename}`;
        }

        const bankDetail = await prisma.bankDetail.create({
            data,
        });

        res.status(201).json(bankDetail);
    } catch (error) {
        next(error);
    }
};

// Implement other CRUD operations as needed
