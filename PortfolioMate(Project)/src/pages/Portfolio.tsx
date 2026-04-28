import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  Target,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import type { PortfolioSummary, InvestmentByType, MonthlyInvestment } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Portfolio = () => {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [investmentsByType, setInvestmentsByType] = useState<InvestmentByType[]>([]);
  const [monthlyInvestments, setMonthlyInvestments] = useState<MonthlyInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, byTypeRes, monthlyRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getByType(),
        dashboardService.getMonthly(),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (byTypeRes.success) {
        setInvestmentsByType(byTypeRes.data);
      }
      if (monthlyRes.success) {
        setMonthlyInvestments(monthlyRes.data);
      }
    } catch (error) {
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No portfolio data available</h3>
        <p className="text-muted-foreground">Start by adding your first investment</p>
        <Button asChild className="mt-4">
          <a href="/investments/add">Add Investment</a>
        </Button>
      </div>
    );
  }

  const isProfitable = summary.total_profit_loss >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive view of your investment portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPortfolioData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Invested"
          value={formatCurrency(summary.total_invested)}
          icon={DollarSign}
          description="Initial capital"
        />
        <MetricCard
          title="Current Value"
          value={formatCurrency(summary.total_current_value)}
          icon={PieChartIcon}
          description="Portfolio worth today"
          trend={summary.total_current_value >= summary.total_invested ? 'up' : 'down'}
        />
        <MetricCard
          title="Net Profit/Loss"
          value={formatCurrency(summary.total_profit_loss)}
          icon={isProfitable ? TrendingUp : TrendingDown}
          description={formatPercentage(summary.profit_loss_percentage)}
          trend={isProfitable ? 'up' : 'down'}
          highlight
        />
        <MetricCard
          title="Total Investments"
          value={summary.total_investments.toString()}
          icon={Target}
          description={`${summary.profitable_investments} profitable, ${summary.loss_investments} loss`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Distribution by investment type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {investmentsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investmentsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="invested_amount"
                      nameKey="type_name"
                      label={({ type_name, percent }) => 
                        `${type_name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {investmentsByType.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Type</CardTitle>
            <CardDescription>Profit/Loss by investment category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {investmentsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={investmentsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                    <YAxis dataKey="type_name" type="category" width={100} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="invested_amount" name="Invested" fill="#0088FE" />
                    <Bar dataKey="current_value" name="Current Value" fill="#00C49F" />
                  </BarChart>
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

      {/* Investment Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Types Breakdown</CardTitle>
          <CardDescription>Detailed breakdown by investment category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {investmentsByType.length > 0 ? (
              investmentsByType.map((type, index) => {
                const percentage = summary.total_invested > 0 
                  ? (type.invested_amount / summary.total_invested) * 100 
                  : 0;
                const isTypeProfitable = (type.profit_loss || 0) >= 0;

                return (
                  <div key={type.type_name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{type.type_name}</span>
                        <Badge variant="outline">{type.count} investments</Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatCurrency(type.invested_amount)}</span>
                        <span className={`ml-2 text-sm ${isTypeProfitable ? 'text-green-600' : 'text-red-600'}`}>
                          ({formatCurrency(type.profit_loss || 0)})
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}% of portfolio
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No investment types found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Investment Trend</CardTitle>
          <CardDescription>Your investment activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyInvestments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyInvestments}>
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
                  <Bar dataKey="invested_amount" fill="#0088FE" name="Invested Amount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No monthly data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  trend?: 'up' | 'down';
  highlight?: boolean;
}

const MetricCard = ({ title, value, icon: Icon, description, trend, highlight }: MetricCardProps) => {
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
const PortfolioSkeleton = () => {
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
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
