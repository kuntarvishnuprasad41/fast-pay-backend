const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const winston = require('winston');
const cors = require('cors');
// Initialize app and Prisma client
const app = express();
const prisma = new PrismaClient();

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
    ],
});

// JWT Secret
const JWT_SECRET = 'your_jwt_secret';

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors())

// Middleware for JWT token verification
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Middleware for role-based authorization
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access Denied' });
        }
        next();
    };
}

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// User Registration (Admin creates users)
app.post('/register', async (req, res) => {
    const { username, password, role, merchantId } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                merchantId,
            },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: 'User registration failed' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Include merchantId in token payload if user has one
        const tokenPayload = {
            userId: user.id,
            role: user.role,
        };

        if (user.merchantId) {
            tokenPayload.merchantId = user.merchantId;
        }

        const token = jwt.sign(tokenPayload, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});


// Create Merchant (Admin creates merchants)
app.post('/merchant', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
    const { accountHolder, accountNumber, ifscCode, bankName, creditLimit, debitLimit, upiId, level, qrCode } = req.body;

    try {
        const merchant = await prisma.merchant.create({
            data: {
                accountHolder,
                accountNumber,
                ifscCode,
                bankName,
                creditLimit,
                debitLimit,
                upiId,
                level,
                qrCode,
            },
        });
        res.status(201).json(merchant);
    } catch (error) {
        res.status(400).json({ error: 'Merchant creation failed' + error });
    }
});

// Get all merchants
// app.get('/merchants', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
app.get('/merchants', async (req, res) => {

    try {
        const merchants = await prisma.merchant.findMany();
        res.json(merchants);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching merchants' });
    }
});

// Get all payments done by each merchant
app.get('/merchants/:merchantId/payments', authenticateToken, authorizeRoles('Admin', 'SuperAdmin', 'Merchant'), async (req, res) => {
    const { merchantId } = req.params;

    try {
        const payments = await prisma.payment.findMany({
            where: { merchantId: parseInt(merchantId) },
            include: { proof: true }  // Include proof details if needed
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payments for the merchant' });
    }
});

// Get all users with types, limits, and roles
app.get('/users', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                merchant: {
                    select: {
                        accountHolder: true,
                        creditLimit: true,
                        debitLimit: true
                    }
                }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Get all settled payments
app.get('/settlements', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const settlements = await prisma.settlement.findMany({
            include: {
                merchant: {
                    select: {
                        accountHolder: true,
                        accountNumber: true
                    }
                }
            }
        });
        res.json(settlements);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching settled payments' });
    }
});

// Create Payment (Merchant initiates payment)
app.post('/payment', authenticateToken, authorizeRoles('Merchant', 'MerchantUser'), async (req, res) => {
    const { amount, screenshot, utrNumber } = req.body;

    try {
        const payment = await prisma.payment.create({
            data: {
                amount,
                merchantId: req.user.merchantId,
                status: 'Initiated',
                utrNumber, screenShot: screenshot,
                proof: {
                    create: {
                        screenshot: screenshot,   // This is inside the related PaymentProof model
                        utrNumber: utrNumber
                    }
                }
            },
        });
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ error: 'Payment initiation failed: ' + error.message });
    }
});


// Create a user under a specific merchant
app.post('/merchant/:merchantId/user', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
    const { merchantId } = req.params;
    const { username, password, role } = req.body;

    try {
        // Check if the merchant exists
        const merchant = await prisma.merchant.findUnique({
            where: { id: parseInt(merchantId) },
        });

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user and associate them with the merchant
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                merchantId: parseInt(merchantId),
            },
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: 'User creation failed: ' + error.message });
    }
});


// Upload Payment Proof (MerchantUser uploads payment proof)
app.post('/payment-proof', authenticateToken, authorizeRoles('MerchantUser'), async (req, res) => {
    const { screenshot, utrNumber } = req.body;

    try {
        // Log the merchantId for debugging
        console.log('Merchant ID from JWT:', req.user.merchantId);

        // Fetch the most recent payment for the merchant or user
        const latestPayment = await prisma.payment.findFirst({
            where: {
                merchantId: req.user.merchantId,
                status: 'Initiated',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Log the result for debugging
        console.log('Latest Payment Found:', latestPayment);

        if (!latestPayment) {
            return res.status(404).json({ error: 'No recent payment found to associate the proof with' });
        }

        // Create the payment proof for the latest payment
        const proof = await prisma.paymentProof.create({
            data: {
                paymentId: 123,
                screenshot,
                utrNumber,
            },
        });

        res.status(201).json(proof);
    } catch (error) {
        console.error('Error creating payment proof:', error);
        res.status(400).json({ error: 'Payment proof upload failed: ' + error });
    }
});


// Verify or mark payment as error
app.patch('/payment/verify', authenticateToken, authorizeRoles('Verification', 'Admin'), async (req, res) => {
    const { paymentId, status } = req.body; // status could be 'Verified' or 'Error'

    if (!['Verified', 'Error'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: { status }
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Error updating payment status' });
    }
});

// Settle Payments (Admin settles merchant payments)
app.post('/settlement', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
    const { merchantId, settledAmount, percentage } = req.body;

    try {
        const settlement = await prisma.settlement.create({
            data: {
                merchantId,
                settledAmount,
                percentage,
            },
        });
        res.status(201).json(settlement);
    } catch (error) {
        res.status(400).json({ error: 'Settlement creation failed' });
    }
});

app.get('/payment-proofs', authenticateToken, authorizeRoles('Admin', 'SuperAdmin', 'Merchant'), async (req, res) => {
    try {
        const paymentProofs = await prisma.payment.findMany({

        });
        res.json(paymentProofs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payment proofs' });
    }
});


// Get merchant details with Pay In and Payout details
app.get('/merchant-details/:merchantId', authenticateToken, authorizeRoles('Admin', 'SuperAdmin', 'Merchant'), async (req, res) => {
    const { merchantId } = req.params;

    try {
        // Fetch merchant
        const merchant = await prisma.merchant.findUnique({
            where: { id: parseInt(merchantId) },
        });

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        // Fetch today's payments for the merchant (Pay In Details)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayPayments = await prisma.payment.findMany({
            where: {
                merchantId: parseInt(merchantId),
                createdAt: {
                    gte: today,
                },
            },
            select: {
                amount: true,
            }
        });

        const totalTodayPayments = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Fetch all payments (Pay In Details)
        const allPayments = await prisma.payment.findMany({
            where: {
                merchantId: parseInt(merchantId),
            },
            select: {
                amount: true,
            }
        });

        const totalPayIn = allPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Fetch total payout amount
        const payouts = await prisma.payout.findMany({
            where: { merchantId: parseInt(merchantId) },
            select: {
                payoutAmount: true,
            }
        });

        const totalPayout = payouts.reduce((sum, payout) => sum + payout.payoutAmount, 0);

        // Calculate unsettled balance as totalPayIn - totalPayout
        const unsettledBalance = totalPayIn - totalPayout;

        // Fetch total settled amount
        const settledPayments = await prisma.settlement.findMany({
            where: { merchantId: parseInt(merchantId) },
            select: { settledAmount: true }
        });

        const totalSettled = settledPayments.reduce((sum, payment) => sum + payment.settledAmount, 0);

        // Calculate payout charges (adjust as per your business logic)
        const payoutCharges = totalPayout * 0.01;  // Assuming 1% charge on payouts
        const freezedLoadBalance = unsettledBalance - payoutCharges;  // Assuming formula based on unsettled balance
        const freezedPayoutCharges = payoutCharges;

        // Response with all calculated data
        res.json({
            merchantName: merchant.accountHolder,
            payInDetails: {
                todayPayIn: totalTodayPayments,
                settledBalance: totalSettled,
                unsettledBalance: unsettledBalance, // Now using the formula: totalPayIn - totalPayout
                toBeSettled: unsettledBalance,  // Assuming to-be-settled is the same as unsettled for now
                payInCharges: payoutCharges // Calculated from total payout
            },
            payOutDetails: {
                totalLoadBalance: totalTodayPayments,  // Assuming this is same as today's pay-in
                availableBalance: totalSettled,  // Assuming available is what has been settled
                totalPayout: totalPayout,
                payoutCharges: payoutCharges,
                freezedLoadBalance: freezedLoadBalance,
                freezedPayoutCharges: freezedPayoutCharges
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching merchant details' });
    }
});



// Create Payout (Admin initiates a payout to a merchant)
app.post('/payout', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
    const { merchantId, payoutAmount } = req.body;

    try {
        // Fetch unsettled payments for the merchant
        const unsettledPayments = await prisma.payment.findMany({
            where: {
                merchantId: parseInt(merchantId),
                status: 'Initiated',
            },
            select: { amount: true },
        });

        const allPayments = await prisma.payment.findMany({
            where: {
                merchantId: parseInt(merchantId),
            },
            select: {
                amount: true,
            }
        });

        const totalPayIn = allPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Fetch total payout amount
        const payouts = await prisma.payout.findMany({
            where: { merchantId: parseInt(merchantId) },
            select: {
                payoutAmount: true,
            }
        });

        const totalPayout = payouts.reduce((sum, payout) => sum + payout.payoutAmount, 0);


        // Calculate total unsettled amount
        const unsettledBalance = totalPayIn - totalPayout;

        if (payoutAmount > unsettledBalance) {
            return res.status(400).json({ error: 'Payout amount exceeds unsettled balance.' });
        }

        // Create payout entry
        const payout = await prisma.payout.create({
            data: {
                merchantId: parseInt(merchantId),
                payoutAmount: payoutAmount,
                payinsTotal: unsettledBalance,
                initiatedById: req.user.userId, // Admin who initiated the payout
            },
        });

        // Mark payments as settled (or any other business logic for payouts)
        await prisma.payment.updateMany({
            where: {
                merchantId: parseInt(merchantId),
                status: 'Initiated',
            },
            data: { status: 'Pending' }, // Mark them as "Pending" until settlement completes
        });

        res.status(201).json(payout);
    } catch (error) {
        res.status(500).json({ error: 'Payout creation failed: ' + error.message });
    }
});

// Get all payouts (Admin and SuperAdmin)
app.get('/payouts', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const payouts = await prisma.payout.findMany({
            include: {
                merchant: {
                    select: {
                        accountHolder: true,
                        accountNumber: true,
                        bankName: true,
                    }
                }
            }
        });

        res.json(payouts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payouts: ' + error.message });
    }
});

app.get('/dashboard/summary', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total revenue for today (successful payments)
        const todayRevenue = await prisma.payment.aggregate({
            where: {
                status: 'Success',
                createdAt: {
                    gte: today,
                }
            },
            _sum: {
                amount: true,
            }
        });

        // Total payouts for today (payouts made)
        const todayPayouts = await prisma.payout.aggregate({
            where: {
                createdAt: {
                    gte: today,
                }
            },
            _sum: {
                payoutAmount: true,
            }
        });

        // Transaction Summary - Count of different statuses
        const transactionSummary = await prisma.payment.groupBy({
            by: ['status'],
            _count: {
                status: true,
            }
        });

        // Format the transaction summary data into the required structure
        const formattedSummary = {
            success: transactionSummary.find(ts => ts.status === 'Success')?._count?.status || 0,
            failure: transactionSummary.find(ts => ts.status === 'Failure')?._count?.status || 0,
            processing: transactionSummary.find(ts => ts.status === 'Processing')?._count?.status || 0,
            initialized: transactionSummary.find(ts => ts.status === 'Initialized')?._count?.status || 0,
            pending: transactionSummary.find(ts => ts.status === 'Pending')?._count?.status || 0,
        };

        // Response with all calculated data
        res.json({
            totalRevenueToday: todayRevenue._sum.amount || 0,
            totalPayoutsToday: todayPayouts._sum.payoutAmount || 0,
            transactionSummary: formattedSummary
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard summary: ' + error.message });
    }
});


app.get('/dashboard/transactions', authenticateToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const transactions = await prisma.payment.groupBy({
            by: ['createdAt'],
            _sum: {
                amount: true
            },
            where: {
                status: { in: ['Success', 'Failure'] }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Format the response
        const formattedTransactions = transactions.map(tx => ({
            date: tx.createdAt,
            success: tx.status === 'Success' ? tx._sum.amount : 0,
            failure: tx.status === 'Failure' ? tx._sum.amount : 0,
        }));

        res.json(formattedTransactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transaction data: ' + error.message });
    }
});





// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




module.exports = app;
