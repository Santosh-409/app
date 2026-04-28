import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Skeleton } from '@/components/ui/skeleton';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Award,
  BarChart3,
  Target,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import type { TopPerformer, MonthlyInvestment, PortfolioSummary } from '@/types';

const Analytics = () => {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, performersRes, monthlyRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getTopPerformers(10),
        dashboardService.getMonthly(),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (performersRes.success) {
        setTopPerformers(performersRes.data);
      }
      if (monthlyRes.success) {
        setMonthlyData(monthlyRes.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics data');
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

  // Calculate analytics
  const calculateAnalytics = () => {
    if (!summary || topPerformers.length === 0) return null;

    const bestPerformer = topPerformers[0];
    const worstPerformer = [...topPerformers].sort((a, b) => a.return_percentage - b.return_percentage)[0];
    const avgReturn = topPerformers.reduce((acc, curr) => acc + curr.return_percentage, 0) / topPerformers.length;

    return {
      bestPerformer,
      worstPerformer,
      avgReturn,
      totalReturn: summary.profit_loss_percentage,
      winRate: summary.total_investments > 0 
        ? (summary.profitable_investments / summary.total_investments) * 100 
        : 0,
    };
  };

  const analytics = calculateAnalytics();

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Deep insights into your investment performance
          </p>
        </div>
        <Button variant="outline" onClick={fetchAnalyticsData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Key Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard
            title="Average Return"
            value={formatPercentage(analytics.avgReturn)}
            icon={BarChart3}
            trend={analytics.avgReturn >= 0 ? 'up' : 'down'}
            description="Across all investments"
          />
          <AnalyticsCard
            title="Win Rate"
            value={`${analytics.winRate.toFixed(1)}%`}
            icon={Target}
            description={`${summary?.profitable_investments} of ${summary?.total_investments} profitable`}
          />
          <AnalyticsCard
            title="Best Performer"
            value={analytics.bestPerformer.asset_name}
            icon={Award}
            trend="up"
            description={formatPercentage(analytics.bestPerformer.return_percentage)}
          />
          <AnalyticsCard
            title="Total Return"
            value={formatPercentage(analytics.totalReturn)}
            icon={analytics.totalReturn >= 0 ? TrendingUp : TrendingDown}
            trend={analytics.totalReturn >= 0 ? 'up' : 'down'}
            description="Overall portfolio performance"
            highlight
          />
        </div>
      )}

      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance Over Time</CardTitle>
          <CardDescription>Track your investment growth month by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="invested_amount"
                    stroke="#0088FE"
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                    name="Monthly Investment"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No historical data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Rankings</CardTitle>
          <CardDescription>Performance ranking of all your investments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((performer, index) => {
                const isPositive = performer.return_percentage >= 0;
                const rank = index + 1;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        rank === 2 ? 'bg-gray-100 text-gray-700' :
                        rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {rank}
                      </div>
                      <div>
                        <p className="font-semibold">{performer.asset_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {performer.asset_symbol} • {performer.type_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="font-bold">
                          {formatPercentage(performer.return_percentage)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(performer.profit_loss || 0)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No investment data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
            <CardDescription>Compare invested amount vs current value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
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
                    <Legend />
                    <Bar dataKey="invested_amount" fill="#0088FE" name="Invested" />
                    <Line type="monotone" dataKey="current_value" stroke="#00C49F" name="Current Value" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Return Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Return Distribution</CardTitle>
            <CardDescription>How your investments are performing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {summary && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Profitable Investments</span>
                      <span className="text-sm text-green-600 font-semibold">
                        {summary.profitable_investments}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ 
                          width: `${summary.total_investments > 0 
                            ? (summary.profitable_investments / summary.total_investments) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Loss Making Investments</span>
                      <span className="text-sm text-red-600 font-semibold">
                        {summary.loss_investments}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ 
                          width: `${summary.total_investments > 0 
                            ? (summary.loss_investments / summary.total_investments) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Best Return</p>
                        <p className="text-xl font-bold text-green-600">
                          {topPerformers.length > 0 
                            ? formatPercentage(topPerformers[0].return_percentage) 
                            : '0%'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Worst Return</p>
                        <p className="text-xl font-bold text-red-600">
                          {topPerformers.length > 0 
                            ? formatPercentage([...topPerformers].sort((a, b) => a.return_percentage - b.return_percentage)[0].return_percentage) 
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Analytics Card Component
interface AnalyticsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  trend?: 'up' | 'down';
  highlight?: boolean;
}

const AnalyticsCard = ({ title, value, icon: Icon, description, trend, highlight }: AnalyticsCardProps) => {
  return (
    <Card className={highlight ? 'border-primary/50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-lg font-bold truncate ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          ''
        }`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton
const AnalyticsSkeleton = () => {
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
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
