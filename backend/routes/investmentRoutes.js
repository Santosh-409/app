const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const investmentController = require('../controllers/investmentController');
const { authenticateToken } = require('../middleware/auth');

// Validation rules
const investmentValidation = [
    body('type_id')
        .notEmpty().withMessage('Investment type is required')
        .isInt().withMessage('Invalid investment type'),
    body('asset_name')
        .trim()
        .notEmpty().withMessage('Asset name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Asset name must be between 1 and 100 characters'),
    body('asset_symbol')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Asset symbol must be less than 20 characters'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isFloat({ min: 0.0001 }).withMessage('Quantity must be a positive number'),
    body('buy_price')
        .notEmpty().withMessage('Buy price is required')
        .isFloat({ min: 0 }).withMessage('Buy price must be a non-negative number'),
    body('current_price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Current price must be a non-negative number'),
    body('purchase_date')
        .notEmpty().withMessage('Purchase date is required')
        .isDate().withMessage('Invalid purchase date format'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const sellValidation = [
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isFloat({ min: 0.0001 }).withMessage('Quantity must be a positive number'),
    body('sell_price')
        .notEmpty().withMessage('Sell price is required')
        .isFloat({ min: 0 }).withMessage('Sell price must be a non-negative number'),
    body('notes')
        .optional()
        .trim()
];

// All routes require authentication
router.use(authenticateToken);

// Investment types (public within auth)
router.get('/types', investmentController.getInvestmentTypes);

// Investment CRUD routes
router.post('/', investmentValidation, investmentController.addInvestment);
router.get('/', investmentController.getInvestments);
router.get('/:id', investmentController.getInvestmentById);
router.put('/:id', investmentController.updateInvestment);
router.delete('/:id', investmentController.deleteInvestment);
router.post('/:id/sell', sellValidation, investmentController.sellInvestment);

module.exports = router;
