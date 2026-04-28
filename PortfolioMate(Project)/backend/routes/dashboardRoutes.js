const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Dashboard routes
router.get('/summary', dashboardController.getPortfolioSummary);
router.get('/by-type', dashboardController.getInvestmentsByType);
router.get('/monthly', dashboardController.getMonthlyInvestments);
router.get('/top-performers', dashboardController.getTopPerformers);
router.get('/recent-transactions', dashboardController.getRecentTransactions);
router.get('/complete', dashboardController.getDashboardData);

module.exports = router;
