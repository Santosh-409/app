# 🚀 PortfolioMate - Smart Investment Tracker

A comprehensive full-stack web application for tracking investments, monitoring profit/loss, managing portfolios, and getting insights through interactive charts and reports.

![PortfolioMate Banner](https://img.shields.io/badge/PortfolioMate-Smart%20Investment%20Tracker-blue)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql)


# Project Members
1. Santosh--->       RA2411030030063
2. Siddharth Sagar-> RA2411030030076


## 📁 Project Documents

| Sr | Description | Link |
|----|-------------|------|
| 1  | 💻 Project Code (Entire Repository) | [View on GitHub](https://github.com/Santosh-409/app/tree/main/PortfolioMate(Project)) |
| 2  | 📝 Project Report (DBMS) | [View PDF](https://github.com/Santosh-409/app/blob/main/Project%20report/Final%20project%20report(DBMS).pdf) |
| 3  | 📊 Initial PPT (PDF) | [View PDF](https://github.com/Santosh-409/app/blob/main/PPT/PortfolioMate%20PPT(Initial).pdf) |
| 4  | 📊 Final PPT (PPTX) | [Download PPTX](https://github.com/Santosh-409/app/blob/main/PPT/PortfolioMate%20ppt(final).pptx) |
| 5  | 📋 Course Report — Santosh (RA2411030030063) | [View PDF](https://github.com/Santosh-409/app/blob/main/Course%20Certificate/RA2411030030063_Course%20Certificate.pdf) |
| 6  | 📋 Course Report — Siddharth (RA2411030030076) | [View PDF](https://github.com/Santosh-409/app/blob/main/Course%20Report/RA2411030030076_Course_Report.pdf) |
| 7  | 🏅 Certificate — Santosh (RA2411030030063) | [View PDF](https://github.com/Santosh-409/app/blob/main/certificate/santosh%20certificate.pdf) |
| 8  | 🏅 Certificate — Siddharth (RA2411030030076) | [View PDF](https://github.com/Santosh-409/app/blob/main/Course%20Certificate/RA2411030030076_Course%20Certificate.pdf) |


## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)

## Features

### User Features
- 🔐 **Secure Authentication** - JWT-based login/registration system
- 📊 **Interactive Dashboard** - Real-time portfolio overview with charts
- 💼 **Investment Management** - Add, edit, delete, and track investments
- 📈 **Profit/Loss Tracking** - Automatic calculation of gains and losses
- 🔍 **Advanced Filtering** - Search and filter investments by type
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📊 **Visual Analytics** - Charts and graphs for portfolio analysis

### Investment Types Supported
- 📈 Stocks
- 💰 Mutual Funds
- ₿ Cryptocurrency
- 📋 ETFs
- 📜 Bonds
- 🏢 Real Estate

### Dashboard Features
- Portfolio summary cards
- Asset allocation pie chart
- Investment trend line chart
- Top performers list
- Recent transactions
- Profit/Loss calculations

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Recharts** - Interactive charts
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **express-validator** - Input validation

### Database
- **MySQL 8.0+** - Relational database

##  Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | 18.x or higher | [Download](https://nodejs.org/) |
| MySQL | 8.0 or higher | [Download](https://dev.mysql.com/downloads/) |
| npm | 9.x or higher | Comes with Node.js |
| Git | Latest | [Download](https://git-scm.com/) |

### Verify Installation

Open your terminal/command prompt and run:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MySQL version
mysql --version

# Check Git version
git --version
```

##  Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/portfoliomate.git
cd portfoliomate
```

### Step 2: Install Frontend Dependencies

```bash
# In the root directory
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

##  Database Setup

### Step 1: Start MySQL Server

**Windows:**
```cmd
# MySQL usually runs as a service
# Start via Services app or:
net start MySQL80
```

**macOS:**
```bash
# Using Homebrew
brew services start mysql

# Or manually
mysql.server start
```

**Linux:**
```bash
# Using systemd
sudo systemctl start mysql

# Or using service
sudo service mysql start
```

### Step 2: Create Database

```bash
# Login to MySQL (enter your password when prompted)
mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE portfoliomate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 3: Import Schema

```bash
# From the project root directory
mysql -u root -p portfoliomate < database/schema.sql
```

### Step 4: Configure Database Connection

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portfoliomate

# JWT Secret
JWT_SECRET=your_secret_key_here_change_in_production
```

##  Running the Application

### Option 1: Run Both Frontend and Backend Together

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
# In the root directory
npm run dev
```

### Option 2: Using Concurrently (Optional)

You can install `concurrently` to run both with one command:

```bash
# Install globally
npm install -g concurrently

# Run both
concurrently "cd backend && npm start" "npm run dev"
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

##  API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/change-password` | Change password |

### Investment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investments/types` | Get investment types |
| GET | `/api/investments` | Get all investments |
| GET | `/api/investments/:id` | Get investment by ID |
| POST | `/api/investments` | Add new investment |
| PUT | `/api/investments/:id` | Update investment |
| DELETE | `/api/investments/:id` | Delete investment |
| POST | `/api/investments/:id/sell` | Sell investment |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Portfolio summary |
| GET | `/api/dashboard/by-type` | Investments by type |
| GET | `/api/dashboard/monthly` | Monthly investments |
| GET | `/api/dashboard/top-performers` | Top performing investments |
| GET | `/api/dashboard/recent-transactions` | Recent transactions |
| GET | `/api/dashboard/complete` | Complete dashboard data |

## Project Structure

```
portfoliomate/
├── backend/                    # Backend API
│   ├── config/                 # Configuration files
│   │   └── database.js         # Database connection
│   ├── controllers/            # Route controllers
│   │   ├── userController.js
│   │   ├── investmentController.js
│   │   └── dashboardController.js
│   ├── middleware/             # Custom middleware
│   │   └── auth.js             # JWT authentication
│   ├── models/                 # Database models (optional)
│   ├── routes/                 # API routes
│   │   ├── userRoutes.js
│   │   ├── investmentRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server.js               # Entry point
├── database/                   # Database files
│   └── schema.sql              # Database schema
├── src/                        # Frontend source
│   ├── components/             # React components
│   │   └── ProtectedRoute.tsx
│   ├── context/                # React context
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                  # Custom hooks
│   ├── layouts/                # Page layouts
│   │   ├── AuthLayout.tsx
│   │   └── MainLayout.tsx
│   ├── pages/                  # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Investments.tsx
│   │   ├── AddInvestment.tsx
│   │   ├── InvestmentDetail.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Analytics.tsx
│   │   ├── Profile.tsx
│   │   └── NotFound.tsx
│   ├── services/               # API services
│   │   └── api.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example                # Frontend env template
├── index.html
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

##  Screenshots

### Login Page
![Login](https://github.com/Santosh-409/app/blob/main/PortfolioMate(Project)/images/Login%20ss.png)

### Dashboard
![Dashboard](https://github.com/Santosh-409/app/blob/main/PortfolioMate(Project)/images/Dashboard%20ss.png)

### Investments List
![Investments](https://github.com/Santosh-409/app/blob/main/PortfolioMate(Project)/images/Investment%20list%20ss.png)

### Add Investment
![Add Investment](https://github.com/Santosh-409/app/blob/main/PortfolioMate(Project)/images/Add%20Investment%20s.png)

### Portfolio Analytics
![Analytics](https://github.com/Santosh-409/app/blob/main/PortfolioMate(Project)/images/Analytics%20ss.png)

### Portfolio 
![Portfolio](https://github.com/Santosh-409/app/blob/main/PortfolioMate(Project)/images/PortfolioMate%20ss.png)

##  Future Enhancements

- [ ] Real-time stock price integration (Alpha Vantage, Yahoo Finance)
- [ ] Email notifications for price alerts
- [ ] Export portfolio reports (PDF, Excel)
- [ ] Multi-currency support
- [ ] Dividend tracking
- [ ] Tax reporting features
- [ ] Mobile app (React Native)
- [ ] Social features (share portfolios)
- [ ] AI-powered investment recommendations
- [ ] Import from brokerages

##  Troubleshooting

### Common Issues

#### 1. MySQL Connection Error
```
Error: Can't connect to MySQL server
```
**Solution:**
- Ensure MySQL service is running
- Check your database credentials in `.env`
- Verify MySQL port (default: 3306)

#### 2. Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=5001
```

#### 3. CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that CORS middleware is properly configured

#### 4. JWT Token Error
```
Error: Invalid token
```
**Solution:**
- Clear browser localStorage
- Re-login to generate new token
- Check JWT_SECRET is set correctly

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for interactive charts
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS

## 📞 Support

For support, email dreamachieve409@gmail.com  


---

**Made with ❤️ by PortfolioMate Team**
