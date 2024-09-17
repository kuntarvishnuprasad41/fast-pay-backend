// controllers/bankStatementController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBankStatements = async (req, res, next) => {
    try {
        const { bankDetailId, fromDate, toDate } = req.query;

        const bankTransactions = await prisma.bankTransaction.findMany({
            where: {
                bankDetailId,
                date: {
                    gte: new Date(fromDate),
                    lte: new Date(toDate),
                },
            },
        });

        res.json(bankTransactions);
    } catch (error) {
        next(error);
    }
};
