// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const bankDetailRoutes = require('./routes/bankDetailRoutes');
const bankTransactionRoutes = require('./routes/bankTransactionRoutes');
const merchantTransactionRoutes = require('./routes/merchantTransactionRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reconciliationRoutes = require('./routes/reconciliationRoutes');
const debitBankRoutes = require('./routes/debitBankRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const supportRoutes = require('./routes/supportRoutes');
const reportRoutes = require('./routes/reportRoutes');
const bankStatementRoutes = require('./routes/bankStatementRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/bank-details', bankDetailRoutes);
app.use('/api/bank-transactions', bankTransactionRoutes);
app.use('/api/merchant-transactions', merchantTransactionRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/debit-bank', debitBankRoutes);
app.use('/api/settlement', settlementRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bank-statements', bankStatementRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
