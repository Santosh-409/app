const { executeQuery, withTransaction } = require('../config/database');
const { validationResult } = require('express-validator');

// Get all investment types
const getInvestmentTypes = async (req, res) => {
    try {
        const types = await executeQuery(
            'SELECT * FROM Investment_Types ORDER BY type_name'
        );

        res.status(200).json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('Get investment types error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching investment types',
            error: error.message
        });
    }
};

// Add new investment
const addInvestment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.userId;
        const {
            type_id,
            asset_name,
            asset_symbol,
            quantity,
            buy_price,
            current_price,
            purchase_date,
            notes
        } = req.body;

        const result = await executeQuery(
            `INSERT INTO Investments 
            (user_id, type_id, asset_name, asset_symbol, quantity, buy_price, current_price, purchase_date, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, type_id, asset_name, asset_symbol, quantity, buy_price, current_price || buy_price, purchase_date, notes]
        );

        // Record the buy transaction
        const totalAmount = quantity * buy_price;
        await executeQuery(
            `INSERT INTO Transactions 
            (investment_id, user_id, transaction_type, quantity, price_per_unit, total_amount, notes) 
            VALUES (?, ?, 'BUY', ?, ?, ?, ?)`,
            [result.insertId, userId, quantity, buy_price, totalAmount, 'Initial purchase']
        );

        res.status(201).json({
            success: true,
            message: 'Investment added successfully',
            data: {
                investment_id: result.insertId
            }
        });
    } catch (error) {
        console.error('Add investment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding investment',
            error: error.message
        });
    }
};

// Get all investments for user
const getInvestments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type_id, search } = req.query;

        let sql = `
            SELECT 
                i.investment_id,
                i.asset_name,
                i.asset_symbol,
                i.quantity,
                i.buy_price,
                COALESCE(i.current_price, i.buy_price) as current_price,
                i.purchase_date,
                i.notes,
                i.is_active,
                it.type_id,
                it.type_name,
                (i.quantity * i.buy_price) as invested_amount,
                (i.quantity * COALESCE(i.current_price, i.buy_price)) as current_value,
                ((COALESCE(i.current_price, i.buy_price) - i.buy_price) * i.quantity) as profit_loss,
                CASE 
                    WHEN i.buy_price > 0 THEN ((COALESCE(i.current_price, i.buy_price) - i.buy_price) / i.buy_price) * 100
                    ELSE 0
                END as profit_loss_percentage
            FROM Investments i
            JOIN Investment_Types it ON i.type_id = it.type_id
            WHERE i.user_id = ?
        `;

        const params = [userId];

        if (type_id) {
            sql += ' AND i.type_id = ?';
            params.push(type_id);
        }

        if (search) {
            sql += ' AND (i.asset_name LIKE ? OR i.asset_symbol LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY i.purchase_date DESC';

        const investments = await executeQuery(sql, params);

        res.status(200).json({
            success: true,
            count: investments.length,
            data: investments
        });
    } catch (error) {
        console.error('Get investments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching investments',
            error: error.message
        });
    }
};

// Get single investment details
const getInvestmentById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const investmentId = req.params.id;

        const investments = await executeQuery(
            `SELECT 
                i.*,
                it.type_name,
                (i.quantity * i.buy_price) as invested_amount,
                (i.quantity * COALESCE(i.current_price, i.buy_price)) as current_value,
                ((COALESCE(i.current_price, i.buy_price) - i.buy_price) * i.quantity) as profit_loss
            FROM Investments i
            JOIN Investment_Types it ON i.type_id = it.type_id
            WHERE i.investment_id = ? AND i.user_id = ?`,
            [investmentId, userId]
        );

        if (investments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        // Get transaction history
        const transactions = await executeQuery(
            `SELECT * FROM Transactions 
            WHERE investment_id = ? AND user_id = ?
            ORDER BY transaction_date DESC`,
            [investmentId, userId]
        );

        res.status(200).json({
            success: true,
            data: {
                ...investments[0],
                transactions
            }
        });
    } catch (error) {
        console.error('Get investment by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching investment',
            error: error.message
        });
    }
};

// Update investment
const updateInvestment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const investmentId = req.params.id;
        const { current_price, notes, is_active } = req.body;

        // Check if investment exists and belongs to user
        const existing = await executeQuery(
            'SELECT * FROM Investments WHERE investment_id = ? AND user_id = ?',
            [investmentId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        await executeQuery(
            'UPDATE Investments SET current_price = ?, notes = ?, is_active = ? WHERE investment_id = ?',
            [current_price, notes, is_active, investmentId]
        );

        res.status(200).json({
            success: true,
            message: 'Investment updated successfully'
        });
    } catch (error) {
        console.error('Update investment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating investment',
            error: error.message
        });
    }
};

// Delete investment
const deleteInvestment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const investmentId = req.params.id;

        // Check if investment exists and belongs to user
        const existing = await executeQuery(
            'SELECT * FROM Investments WHERE investment_id = ? AND user_id = ?',
            [investmentId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        await executeQuery(
            'DELETE FROM Investments WHERE investment_id = ?',
            [investmentId]
        );

        res.status(200).json({
            success: true,
            message: 'Investment deleted successfully'
        });
    } catch (error) {
        console.error('Delete investment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting investment',
            error: error.message
        });
    }
};

// Sell investment (partial or full)
const sellInvestment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const investmentId = req.params.id;
        const { quantity, sell_price, notes } = req.body;

        // Get current investment
        const investments = await executeQuery(
            'SELECT * FROM Investments WHERE investment_id = ? AND user_id = ?',
            [investmentId, userId]
        );

        if (investments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        const investment = investments[0];

        if (quantity > investment.quantity) {
            return res.status(400).json({
                success: false,
                message: 'Sell quantity exceeds available quantity'
            });
        }

        const totalAmount = quantity * sell_price;

        // Record sell transaction
        await executeQuery(
            `INSERT INTO Transactions 
            (investment_id, user_id, transaction_type, quantity, price_per_unit, total_amount, notes) 
            VALUES (?, ?, 'SELL', ?, ?, ?, ?)`,
            [investmentId, userId, quantity, sell_price, totalAmount, notes]
        );

        // Update investment quantity
        const newQuantity = investment.quantity - quantity;
        const isActive = newQuantity > 0;

        await executeQuery(
            'UPDATE Investments SET quantity = ?, is_active = ? WHERE investment_id = ?',
            [newQuantity, isActive, investmentId]
        );

        res.status(200).json({
            success: true,
            message: 'Investment sold successfully',
            data: {
                sold_quantity: quantity,
                sell_price,
                total_amount: totalAmount,
                remaining_quantity: newQuantity
            }
        });
    } catch (error) {
        console.error('Sell investment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while selling investment',
            error: error.message
        });
    }
};

module.exports = {
    getInvestmentTypes,
    addInvestment,
    getInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment,
    sellInvestment
};
