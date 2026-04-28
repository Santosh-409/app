# 📖 PortfolioMate - Complete Setup Guide

This guide will walk you through setting up PortfolioMate on different platforms.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] A computer with Windows, macOS, or Linux
- [ ] Internet connection
- [ ] Administrator privileges (for installation)
- [ ] At least 4GB RAM available
- [ ] 2GB free disk space

---

## 🪟 Windows Setup

### Step 1: Install Node.js

1. Download Node.js from [nodejs.org](https://nodejs.org/)
   - Download the **LTS** (Long Term Support) version
2. Run the installer
3. Follow the installation wizard
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### Step 2: Install MySQL

**Option A: MySQL Installer (Recommended)**
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer
3. Choose **"Server only"** or **"Full"** installation
4. Set root password when prompted (remember this!)
5. Complete the installation

**Option B: Using XAMPP (Easier)**
1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Install XAMPP
3. Open XAMPP Control Panel
4. Start **Apache** and **MySQL** services

### Step 3: Install Git (Optional)

1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer with default settings
3. Verify:
   ```cmd
   git --version
   ```

---

## 🍎 macOS Setup

### Step 1: Install Homebrew (Package Manager)

Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Node.js

```bash
brew install node
```

Verify:
```bash
node --version
npm --version
```

### Step 3: Install MySQL

```bash
brew install mysql
```

Start MySQL service:
```bash
brew services start mysql
```

Secure your installation:
```bash
mysql_secure_installation
```

---

## 🐧 Linux Setup (Ubuntu/Debian)

### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 3: Install MySQL

```bash
sudo apt install mysql-server -y

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

---

## 🗄 Database Configuration

### Step 1: Start MySQL

**Windows:**
```cmd
net start MySQL80
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### Step 2: Create Database

Login to MySQL:
```bash
mysql -u root -p
```

Enter your password when prompted, then run:
```sql
CREATE DATABASE portfoliomate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

### Step 3: Import Schema

Navigate to project directory and run:
```bash
mysql -u root -p portfoliomate < database/schema.sql
```

---

## 💻 Application Setup

### Step 1: Navigate to Project Directory

```bash
cd portfoliomate
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# Windows: notepad .env
# macOS/Linux: nano .env or vim .env
```

**Example .env file:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portfoliomate

JWT_SECRET=your_secret_key_here
```

### Step 3: Setup Frontend

```bash
# Go back to root
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

---

## 🚀 Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Database connected successfully!
🚀 PortfolioMate Server is running on port 5000
📊 API URL: http://localhost:5000
```

### Terminal 2: Start Frontend

Open a new terminal:
```bash
cd portfoliomate
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### Access the Application

Open your browser and go to:
- **Application:** http://localhost:5173
- **API Health:** http://localhost:5000/api/health

---

## 🧪 Testing the Setup

### 1. Test API Health

Open browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "PortfolioMate API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Register a Test User

1. Open http://localhost:5173
2. Click "Sign up"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: testpassword123
4. Click "Create account"

### 3. Add a Test Investment

1. Login with your credentials
2. Click "Add Investment"
3. Fill in:
   - Type: Stock
   - Asset Name: Apple Inc.
   - Symbol: AAPL
   - Quantity: 10
   - Buy Price: 150.00
   - Current Price: 175.00
   - Purchase Date: (today)
4. Click "Add Investment"

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to MySQL"

**Solution:**
```bash
# Check if MySQL is running
# Windows:
net start | findstr MySQL

# macOS:
brew services list | grep mysql

# Linux:
sudo systemctl status mysql

# If not running, start it:
# Windows:
net start MySQL80

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

### Issue 2: "Port 5000 already in use"

**Solution:**
```bash
# Find what's using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process or change port in .env
PORT=5001
```

### Issue 3: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: "CORS error in browser"

**Solution:**
- Check backend `.env` file
- Ensure `FRONTEND_URL=http://localhost:5173`
- Restart backend server

---

## 📱 Platform-Specific Notes

### Windows
- Use **Command Prompt** or **PowerShell** (not Git Bash for MySQL commands)
- MySQL service name might be `MySQL80` or `MySQL`
- If using XAMPP, MySQL runs on port 3306 by default

### macOS
- Homebrew installs MySQL without password by default
- To set password:
  ```bash
  mysqladmin -u root password 'your_new_password'
  ```

### Linux
- MySQL root user might use `auth_socket` plugin
- To fix:
  ```bash
  sudo mysql
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
  FLUSH PRIVILEGES;
  EXIT;
  ```

---

## 🎓 For Teachers/Evaluators

### Quick Demo Steps

1. **Start the application** (follow "Running the Application" above)
2. **Show Login Page** - Modern UI with gradient sidebar
3. **Register a new account** - Demonstrate user authentication
4. **Show Dashboard** - Highlight:
   - Summary cards with real-time calculations
   - Interactive pie chart (asset allocation)
   - Investment trend chart
5. **Add Investment** - Show form validation and submission
6. **View Investments List** - Demonstrate filtering and search
7. **Show Portfolio Page** - Advanced analytics and breakdowns
8. **Show Analytics Page** - Performance rankings and charts
9. **Database Schema** - Show ER diagram and SQL structure

### Key Features to Highlight

- ✅ **Clean Architecture** - MVC pattern with separate frontend/backend
- ✅ **Security** - JWT authentication, password hashing, input validation
- ✅ **Database Design** - Normalized schema with proper foreign keys
- ✅ **Real-time Calculations** - Automatic profit/loss computation
- ✅ **Responsive Design** - Works on all device sizes
- ✅ **Modern Tech Stack** - React, TypeScript, Node.js, MySQL

---

## 📞 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify all prerequisites are installed
5. Ensure database is running and accessible

---

**Good luck with your PortfolioMate setup! 🎉**
