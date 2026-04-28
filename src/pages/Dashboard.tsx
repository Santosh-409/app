import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { DashboardData } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getCompleteDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No data available</h3>
        <p className="text-muted-foreground">Start by adding your first investment</p>
        <Button asChild className="mt-4">
          <Link to="/investments/add">Add Investment</Link>
        </Button>
      </div>
    );
  }

  const { portfolioSummary, investmentsByType, monthlyInvestments, topPerformers, recentTransactions } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your portfolio.
          </p>
        </div>
        <Button asChild>
          <Link to="/investments/add">
            <TrendingUp className="mr-2 h-4 w-4" />
            Add Investment
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Invested"
          value={formatCurrency(portfolioSummary.total_invested)}
          icon={Wallet}
          description="Total amount invested"
        />
        <SummaryCard
          title="Current Value"
          value={formatCurrency(portfolioSummary.total_current_value)}
          icon={DollarSign}
          description="Current portfolio value"
          trend={portfolioSummary.total_current_value >= portfolioSummary.total_invested ? 'up' : 'down'}
        />
        <SummaryCard
          title="Profit/Loss"
          value={formatCurrency(portfolioSummary.total_profit_loss)}
          icon={portfolioSummary.total_profit_loss >= 0 ? TrendingUp : TrendingDown}
          description={formatPercentage(portfolioSummary.profit_loss_percentage)}
          trend={portfolioSummary.total_profit_loss >= 0 ? 'up' : 'down'}
          highlight
        />
        <SummaryCard
          title="Total Investments"
          value={portfolioSummary.total_investments.toString()}
          icon={PieChart}
          description={`${portfolioSummary.profitable_investments} profitable`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
            <CardDescription>Investment breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {investmentsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={investmentsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type_name, percent }) => 
                        `${type_name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="invested_amount"
                      nameKey="type_name"
                    >
                      {investmentsByType.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Investment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Trend</CardTitle>
            <CardDescription>Monthly investment over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyInvestments.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyInvestments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="invested_amount"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Your best performing investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((performer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{performer.asset_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {performer.asset_symbol}
                        </p>
                      </div>
                    </div>
                    <Badge variant={performer.return_percentage >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage(performer.return_percentage)}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No investments yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest buy/sell activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/investments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.transaction_type === 'BUY'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.transaction_type === 'BUY' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.asset_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.transaction_type} • {transaction.quantity} units
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(transaction.total_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No transactions yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  trend?: 'up' | 'down';
  highlight?: boolean;
}

const SummaryCard = ({ title, value, icon: Icon, description, trend, highlight }: SummaryCardProps) => {
  return (
    <Card className={highlight ? 'border-primary/50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-muted-foreground'
        }`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
