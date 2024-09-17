// controllers/bankTransactionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addBankTransaction = async (req, res, next) => {
    try {
        const transaction = await prisma.bankTransaction.create({
            data: req.body,
        });
        res.status(201).json(transaction);
    } catch (error) {
        next(error);
    }
};

exports.getBankTransactions = async (req, res, next) => {
    try {
        const { bankAccount, fromDate, toDate } = req.query;

        const transactions = await prisma.bankTransaction.findMany({
            where: {
                account: bankAccount,
                date: {
                    gte: new Date(fromDate),
                    lte: new Date(toDate),
                },
            },
        });

        res.json(transactions);
    } catch (error) {
        next(error);
    }
};
