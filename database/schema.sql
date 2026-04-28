-- =====================================================
-- PortfolioMate Database Schema
-- A Smart Investment Management System
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS portfoliomate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portfoliomate;

-- =====================================================
-- 1. USERS TABLE
-- Stores user account information
-- =====================================================
CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. INVESTMENT_TYPES TABLE
-- Stores different types of investments
-- =====================================================
CREATE TABLE IF NOT EXISTS Investment_Types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default investment types
INSERT INTO Investment_Types (type_name, description) VALUES
('Stock', 'Individual company stocks and shares'),
('Mutual Fund', ' professionally managed investment funds'),
('Crypto', 'Cryptocurrency investments'),
('ETF', 'Exchange Traded Funds'),
('Bond', 'Government and corporate bonds'),
('Real Estate', 'Real estate investment trusts and properties');

-- =====================================================
-- 3. INVESTMENTS TABLE
-- Stores individual investment records
-- =====================================================
CREATE TABLE IF NOT EXISTS Investments (
    investment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    asset_name VARCHAR(100) NOT NULL,
    asset_symbol VARCHAR(20),
    quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
    buy_price DECIMAL(15,4) NOT NULL,
    current_price DECIMAL(15,4) DEFAULT NULL,
    purchase_date DATE NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES Investment_Types(type_id),
    INDEX idx_user_investments (user_id),
    INDEX idx_asset_name (asset_name),
    INDEX idx_purchase_date (purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 4. TRANSACTIONS TABLE
-- Stores buy/sell transactions for investments
-- =====================================================
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    investment_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    price_per_unit DECIMAL(15,4) NOT NULL,
    total_amount DECIMAL(15,4) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (investment_id) REFERENCES Investments(investment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_investment_transactions (investment_id),
    INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 5. PORTFOLIO_SUMMARY TABLE (Materialized View Alternative)
-- Stores cached portfolio summary for faster dashboard loading
-- =====================================================
CREATE TABLE IF NOT EXISTS Portfolio_Summary (
    summary_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    total_invested DECIMAL(15,2) DEFAULT 0,
    total_current_value DECIMAL(15,2) DEFAULT 0,
    total_profit_loss DECIMAL(15,2) DEFAULT 0,
    profit_loss_percentage DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 6. PRICE_HISTORY TABLE (Optional - for tracking price changes)
-- Stores historical price data for assets
-- =====================================================
CREATE TABLE IF NOT EXISTS Price_History (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    investment_id INT NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investment_id) REFERENCES Investments(investment_id) ON DELETE CASCADE,
    INDEX idx_price_history (investment_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to calculate portfolio summary for a user
CREATE PROCEDURE IF NOT EXISTS CalculatePortfolioSummary(IN p_user_id INT)
BEGIN
    DECLARE v_total_invested DECIMAL(15,2);
    DECLARE v_total_current_value DECIMAL(15,2);
    DECLARE v_total_profit_loss DECIMAL(15,2);
    DECLARE v_profit_loss_percentage DECIMAL(5,2);

    -- Calculate total invested
    SELECT COALESCE(SUM(quantity * buy_price), 0)
    INTO v_total_invested
    FROM Investments
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Calculate total current value
    SELECT COALESCE(SUM(quantity * COALESCE(current_price, buy_price)), 0)
    INTO v_total_current_value
    FROM Investments
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Calculate profit/loss
    SET v_total_profit_loss = v_total_current_value - v_total_invested;

    -- Calculate percentage
    IF v_total_invested > 0 THEN
        SET v_profit_loss_percentage = (v_total_profit_loss / v_total_invested) * 100;
    ELSE
        SET v_profit_loss_percentage = 0;
    END IF;

    -- Update or insert portfolio summary
    INSERT INTO Portfolio_Summary 
        (user_id, total_invested, total_current_value, total_profit_loss, profit_loss_percentage)
    VALUES 
        (p_user_id, v_total_invested, v_total_current_value, v_total_profit_loss, v_profit_loss_percentage)
    ON DUPLICATE KEY UPDATE
        total_invested = v_total_invested,
        total_current_value = v_total_current_value,
        total_profit_loss = v_total_profit_loss,
        profit_loss_percentage = v_profit_loss_percentage,
        last_updated = CURRENT_TIMESTAMP;

    SELECT 
        v_total_invested as total_invested,
        v_total_current_value as total_current_value,
        v_total_profit_loss as total_profit_loss,
        v_profit_loss_percentage as profit_loss_percentage;
END //

-- Procedure to get investment performance
CREATE PROCEDURE IF NOT EXISTS GetInvestmentPerformance(IN p_user_id INT)
BEGIN
    SELECT 
        i.investment_id,
        i.asset_name,
        i.asset_symbol,
        it.type_name,
        i.quantity,
        i.buy_price,
        COALESCE(i.current_price, i.buy_price) as current_price,
        i.quantity * i.buy_price as invested_amount,
        i.quantity * COALESCE(i.current_price, i.buy_price) as current_value,
        (COALESCE(i.current_price, i.buy_price) - i.buy_price) * i.quantity as profit_loss,
        CASE 
            WHEN i.buy_price > 0 THEN ((COALESCE(i.current_price, i.buy_price) - i.buy_price) / i.buy_price) * 100
            ELSE 0
        END as profit_loss_percentage,
        i.purchase_date
    FROM Investments i
    JOIN Investment_Types it ON i.type_id = it.type_id
    WHERE i.user_id = p_user_id AND i.is_active = TRUE
    ORDER BY i.purchase_date DESC;
END //

DELIMITER ;

-- =====================================================
-- SAMPLE QUERIES FOR REFERENCE
-- =====================================================

-- 1. Get user's total portfolio value
-- SELECT 
--     user_id,
--     SUM(quantity * buy_price) as total_invested,
--     SUM(quantity * COALESCE(current_price, buy_price)) as current_value,
--     SUM((COALESCE(current_price, buy_price) - buy_price) * quantity) as profit_loss
-- FROM Investments
-- WHERE user_id = 1 AND is_active = TRUE
-- GROUP BY user_id;

-- 2. Get investments by type
-- SELECT 
--     it.type_name,
--     COUNT(*) as investment_count,
--     SUM(i.quantity * i.buy_price) as total_invested
-- FROM Investments i
-- JOIN Investment_Types it ON i.type_id = it.type_id
-- WHERE i.user_id = 1
-- GROUP BY it.type_name;

-- 3. Get monthly investment summary
-- SELECT 
--     DATE_FORMAT(purchase_date, '%Y-%m') as month,
--     COUNT(*) as investments_count,
--     SUM(quantity * buy_price) as total_invested
-- FROM Investments
-- WHERE user_id = 1
-- GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
-- ORDER BY month DESC;
