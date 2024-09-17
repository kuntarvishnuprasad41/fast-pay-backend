// controllers/merchantController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createMerchant = async (req, res, next) => {
    try {
        const merchant = await prisma.merchant.create({
            data: req.body,
        });
        res.status(201).json(merchant);
    } catch (error) {
        next(error);
    }
};

exports.getMerchants = async (req, res, next) => {
    try {
        const merchants = await prisma.merchant.findMany();
        res.json(merchants);
    } catch (error) {
        next(error);
    }
};

exports.getMerchantById = async (req, res, next) => {
    try {
        const merchant = await prisma.merchant.findUnique({
            where: { id: req.params.id },
        });
        if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
        res.json(merchant);
    } catch (error) {
        next(error);
    }
};

exports.updateMerchant = async (req, res, next) => {
    try {
        const merchant = await prisma.merchant.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(merchant);
    } catch (error) {
        next(error);
    }
};

exports.freezeMerchant = async (req, res, next) => {
    try {
        const merchant = await prisma.merchant.update({
            where: { id: req.params.id },
            data: { status: 'FROZEN' },
        });
        res.json({ message: 'Merchant frozen successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteMerchant = async (req, res, next) => {
    try {
        await prisma.merchant.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Merchant deleted successfully' });
    } catch (error) {
        next(error);
    }
};
