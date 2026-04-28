const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

let db;

// Initialize database
const initDb = async () => {
    if (db) return db;
    
    db = await open({
        filename: path.join(__dirname, '../database.sqlite'),
        driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create Tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Investment_Types (
            type_id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO Investment_Types (type_id, type_name, description) VALUES
        (1, 'Stock', 'Individual company stocks and shares'),
        (2, 'Mutual Fund', ' professionally managed investment funds'),
        (3, 'Crypto', 'Cryptocurrency investments'),
        (4, 'ETF', 'Exchange Traded Funds'),
        (5, 'Bond', 'Government and corporate bonds'),
        (6, 'Real Estate', 'Real estate investment trusts and properties');

        CREATE TABLE IF NOT EXISTS Investments (
            investment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type_id INTEGER NOT NULL,
            asset_name TEXT NOT NULL,
            asset_symbol TEXT,
            quantity REAL NOT NULL DEFAULT 0,
            buy_price REAL NOT NULL,
            current_price REAL DEFAULT NULL,
            purchase_date DATE NOT NULL,
            notes TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (type_id) REFERENCES Investment_Types(type_id)
        );

        CREATE TABLE IF NOT EXISTS Transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            investment_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            quantity REAL NOT NULL,
            price_per_unit REAL NOT NULL,
            total_amount REAL NOT NULL,
            transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (investment_id) REFERENCES Investments(investment_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
        );
    `);
    
    return db;
};

// Test database connection
const testConnection = async () => {
    try {
        await initDb();
        console.log('✅ SQLite Database connected and initialized successfully!');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query helper
const executeQuery = async (sql, params = []) => {
    try {
        const database = await initDb();
        
        const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('WITH');
        
        if (isSelect) {
            const results = await database.all(sql, params);
            return results;
        } else {
            const result = await database.run(sql, params);
            return {
                insertId: result.lastID,
                affectedRows: result.changes,
                ...result
            };
        }
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

// Transaction helper
const withTransaction = async (callback) => {
    const database = await initDb();
    try {
        await database.run('BEGIN TRANSACTION');
        const result = await callback(database);
        await database.run('COMMIT');
        return result;
    } catch (error) {
        await database.run('ROLLBACK');
        throw error;
    }
};

module.exports = {
    testConnection,
    executeQuery,
    withTransaction
};
