const { executeQuery } = require('../config/database');

// Get portfolio summary
const getPortfolioSummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Calculate portfolio summary
        const summary = await executeQuery(
            `SELECT 
                COALESCE(SUM(quantity * buy_price), 0) as total_invested,
                COALESCE(SUM(quantity * COALESCE(current_price, buy_price)), 0) as total_current_value,
                COALESCE(SUM((COALESCE(current_price, buy_price) - buy_price) * quantity), 0) as total_profit_loss,
                COUNT(*) as total_investments,
                COUNT(CASE WHEN COALESCE(current_price, buy_price) > buy_price THEN 1 END) as profitable_investments,
                COUNT(CASE WHEN COALESCE(current_price, buy_price) < buy_price THEN 1 END) as loss_investments
            FROM Investments
            WHERE user_id = ? AND is_active = TRUE`,
            [userId]
        );

        const data = summary[0];
        const profitLossPercentage = data.total_invested > 0 
            ? (data.total_profit_loss / data.total_invested) * 100 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                ...data,
                profit_loss_percentage: parseFloat(profitLossPercentage.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Get portfolio summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching portfolio summary',
            error: error.message
        });
    }
};

// Get investments by type (for pie chart)
const getInvestmentsByType = async (req, res) => {
    try {
        const userId = req.user.userId;

        const data = await executeQuery(
            `SELECT 
                it.type_name,
                COUNT(*) as count,
                SUM(i.quantity * i.buy_price) as invested_amount,
                SUM(i.quantity * COALESCE(i.current_price, i.buy_price)) as current_value,
                SUM((COALESCE(i.current_price, i.buy_price) - i.buy_price) * i.quantity) as profit_loss
            FROM Investments i
            JOIN Investment_Types it ON i.type_id = it.type_id
            WHERE i.user_id = ? AND i.is_active = TRUE
            GROUP BY it.type_id, it.type_name
            ORDER BY invested_amount DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get investments by type error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching investments by type',
            error: error.message
        });
    }
};

// Get monthly investment data (for line chart)
const getMonthlyInvestments = async (req, res) => {
    try {
        const userId = req.user.userId;

        const data = await executeQuery(
            `SELECT 
                strftime('%Y-%m', purchase_date) as month,
                COUNT(*) as investments_count,
                SUM(quantity * buy_price) as invested_amount,
                SUM(quantity * COALESCE(current_price, buy_price)) as current_value
            FROM Investments
            WHERE user_id = ?
            GROUP BY strftime('%Y-%m', purchase_date)
            ORDER BY month ASC
            LIMIT 12`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get monthly investments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching monthly investments',
            error: error.message
        });
    }
};

// Get top performing investments
const getTopPerformers = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 5;

        const data = await executeQuery(
            `SELECT 
                i.asset_name,
                i.asset_symbol,
                it.type_name,
                i.buy_price,
                COALESCE(i.current_price, i.buy_price) as current_price,
                ((COALESCE(i.current_price, i.buy_price) - i.buy_price) / i.buy_price) * 100 as return_percentage,
                (COALESCE(i.current_price, i.buy_price) - i.buy_price) * i.quantity as profit_loss
            FROM Investments i
            JOIN Investment_Types it ON i.type_id = it.type_id
            WHERE i.user_id = ? AND i.is_active = TRUE
            ORDER BY return_percentage DESC
            LIMIT ?`,
            [userId, limit]
        );

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get top performers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching top performers',
            error: error.message
        });
    }
};

// Get recent transactions
const getRecentTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 10;

        const data = await executeQuery(
            `SELECT 
                t.transaction_id,
                t.transaction_type,
                t.quantity,
                t.price_per_unit,
                t.total_amount,
                t.transaction_date,
                t.notes,
                i.asset_name,
                i.asset_symbol
            FROM Transactions t
            JOIN Investments i ON t.investment_id = i.investment_id
            WHERE t.user_id = ?
            ORDER BY t.transaction_date DESC
            LIMIT ?`,
            [userId, limit]
        );

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get recent transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recent transactions',
            error: error.message
        });
    }
};

// Get complete dashboard data
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get all dashboard data in parallel
        const [
            portfolioSummary,
            investmentsByType,
            monthlyInvestments,
            topPerformers,
            recentTransactions
        ] = await Promise.all([
            // Portfolio Summary
            executeQuery(
                `SELECT 
                    COALESCE(SUM(quantity * buy_price), 0) as total_invested,
                    COALESCE(SUM(quantity * COALESCE(current_price, buy_price)), 0) as total_current_value,
                    COALESCE(SUM((COALESCE(current_price, buy_price) - buy_price) * quantity), 0) as total_profit_loss,
                    COUNT(*) as total_investments
                FROM Investments
                WHERE user_id = ? AND is_active = TRUE`,
                [userId]
            ),
            // Investments by Type
            executeQuery(
                `SELECT 
                    it.type_name,
                    COUNT(*) as count,
                    SUM(i.quantity * i.buy_price) as invested_amount,
                    SUM(i.quantity * COALESCE(i.current_price, i.buy_price)) as current_value
                FROM Investments i
                JOIN Investment_Types it ON i.type_id = it.type_id
                WHERE i.user_id = ? AND i.is_active = TRUE
                GROUP BY it.type_id, it.type_name`,
                [userId]
            ),
            // Monthly Investments
            executeQuery(
                `SELECT 
                    strftime('%Y-%m', purchase_date) as month,
                    SUM(quantity * buy_price) as invested_amount
                FROM Investments
                WHERE user_id = ?
                GROUP BY strftime('%Y-%m', purchase_date)
                ORDER BY month ASC
                LIMIT 12`,
                [userId]
            ),
            // Top Performers
            executeQuery(
                `SELECT 
                    i.asset_name,
                    i.asset_symbol,
                    ((COALESCE(i.current_price, i.buy_price) - i.buy_price) / i.buy_price) * 100 as return_percentage
                FROM Investments i
                WHERE i.user_id = ? AND i.is_active = TRUE
                ORDER BY return_percentage DESC
                LIMIT 5`,
                [userId]
            ),
            // Recent Transactions
            executeQuery(
                `SELECT 
                    t.transaction_type,
                    t.quantity,
                    t.total_amount,
                    t.transaction_date,
                    i.asset_name
                FROM Transactions t
                JOIN Investments i ON t.investment_id = i.investment_id
                WHERE t.user_id = ?
                ORDER BY t.transaction_date DESC
                LIMIT 5`,
                [userId]
            )
        ]);

        const summary = portfolioSummary[0];
        const profitLossPercentage = summary.total_invested > 0 
            ? (summary.total_profit_loss / summary.total_invested) * 100 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                portfolioSummary: {
                    ...summary,
                    profit_loss_percentage: parseFloat(profitLossPercentage.toFixed(2))
                },
                investmentsByType,
                monthlyInvestments,
                topPerformers,
                recentTransactions
            }
        });
    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data',
            error: error.message
        });
    }
};

module.exports = {
    getPortfolioSummary,
    getInvestmentsByType,
    getMonthlyInvestments,
    getTopPerformers,
    getRecentTransactions,
    getDashboardData
};
