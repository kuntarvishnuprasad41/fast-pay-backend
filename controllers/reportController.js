// controllers/reportController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Parser } = require('json2csv');

exports.generateTransactionReport = async (req, res, next) => {
    try {
        const { fromDate, toDate } = req.query;

        const transactions = await prisma.merchantTransaction.findMany({
            where: {
                createdAt: {
                    gte: new Date(fromDate),
                    lte: new Date(toDate),
                },
            },
            include: {
                merchant: true,
            },
        });

        // Convert to CSV
        const fields = [
            'id',
            'merchant.name',
            'amount',
            'status',
            'createdAt',
            'updatedAt',
        ];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(transactions);

        res.header('Content-Type', 'text/csv');
        res.attachment('transactions_report.csv');
        return res.send(csv);
    } catch (error) {
        next(error);
    }
};
