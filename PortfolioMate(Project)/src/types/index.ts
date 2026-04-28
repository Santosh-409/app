// User Types
export interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  token?: string;
}

// Investment Types
export interface InvestmentType {
  type_id: number;
  type_name: string;
  description?: string;
}

export interface Investment {
  investment_id: number;
  user_id?: number;
  type_id: number;
  type_name?: string;
  asset_name: string;
  asset_symbol?: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  purchase_date: string;
  notes?: string;
  is_active: boolean;
  invested_amount?: number;
  current_value?: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

// Transaction Types
export interface Transaction {
  transaction_id: number;
  investment_id: number;
  user_id?: number;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  transaction_date: string;
  notes?: string;
  asset_name?: string;
  asset_symbol?: string;
}

// Dashboard Types
export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  total_investments: number;
  profitable_investments: number;
  loss_investments: number;
  profit_loss_percentage: number;
}

export interface InvestmentByType {
  type_name: string;
  count: number;
  invested_amount: number;
  current_value: number;
  profit_loss: number;
}

export interface MonthlyInvestment {
  month: string;
  investments_count?: number;
  invested_amount: number;
  current_value?: number;
}

export interface TopPerformer {
  asset_name: string;
  asset_symbol?: string;
  type_name?: string;
  buy_price?: number;
  current_price?: number;
  return_percentage: number;
  profit_loss?: number;
}

export interface DashboardData {
  portfolioSummary: PortfolioSummary;
  investmentsByType: InvestmentByType[];
  monthlyInvestments: MonthlyInvestment[];
  topPerformers: TopPerformer[];
  recentTransactions: Transaction[];
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface InvestmentFormData {
  type_id: string;
  asset_name: string;
  asset_symbol: string;
  quantity: string;
  buy_price: string;
  current_price: string;
  purchase_date: string;
  notes: string;
}

export interface SellFormData {
  quantity: string;
  sell_price: string;
  notes: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}
