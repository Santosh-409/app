import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { investmentService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  DollarSign,
  Package,
  Tag,
  Save,
  X,
  ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner';
import type { Investment, Transaction } from '@/types';

const InvestmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    quantity: '',
    sell_price: '',
    notes: '',
  });
  const [editFormData, setEditFormData] = useState({
    current_price: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      fetchInvestmentDetail(id);
    }
  }, [id]);

  useEffect(() => {
    if (investment) {
      setEditFormData({
        current_price: investment.current_price?.toString() || '',
        notes: investment.notes || '',
        is_active: investment.is_active,
      });
    }
  }, [investment]);

  const fetchInvestmentDetail = async (investmentId: string) => {
    try {
      setIsLoading(true);
      const response = await investmentService.getById(investmentId);
      if (response.success) {
        setInvestment(response.data);
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      toast.error('Failed to load investment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    try {
      const response = await investmentService.update(id, {
        current_price: editFormData.current_price ? parseFloat(editFormData.current_price) : undefined,
        notes: editFormData.notes,
        is_active: editFormData.is_active,
      });

      if (response.success) {
        toast.success('Investment updated successfully');
        setIsEditing(false);
        fetchInvestmentDetail(id);
      }
    } catch (error) {
      toast.error('Failed to update investment');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this investment?')) {
      return;
    }

    try {
      const response = await investmentService.delete(id);
      if (response.success) {
        toast.success('Investment deleted successfully');
        navigate('/investments');
      }
    } catch (error) {
      toast.error('Failed to delete investment');
    }
  };

  const handleSell = async () => {
    if (!id) return;

    const quantity = parseFloat(sellFormData.quantity);
    const sellPrice = parseFloat(sellFormData.sell_price);

    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!sellPrice || sellPrice <= 0) {
      toast.error('Please enter a valid sell price');
      return;
    }

    if (investment && quantity > investment.quantity) {
      toast.error('Sell quantity exceeds available quantity');
      return;
    }

    try {
      const response = await investmentService.sell(id, {
        quantity,
        sell_price: sellPrice,
        notes: sellFormData.notes,
      });

      if (response.success) {
        toast.success('Investment sold successfully');
        setIsSellDialogOpen(false);
        setSellFormData({ quantity: '', sell_price: '', notes: '' });
        fetchInvestmentDetail(id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sell investment');
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
    return <InvestmentDetailSkeleton />;
  }

  if (!investment) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-lg font-semibold">Investment not found</h3>
        <Button onClick={() => navigate('/investments')} className="mt-4">
          Back to Investments
        </Button>
      </div>
    );
  }

  const profitLoss = investment.profit_loss || 0;
  const profitLossPercentage = investment.profit_loss_percentage || 0;
  const isProfitable = profitLoss >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/investments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{investment.asset_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{investment.type_name}</Badge>
              {investment.asset_symbol && (
                <span className="text-sm text-muted-foreground">{investment.asset_symbol}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Sell
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sell Investment</DialogTitle>
                    <DialogDescription>
                      Enter the details of your sale. Available: {investment.quantity} units
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="Enter quantity to sell"
                        value={sellFormData.quantity}
                        onChange={(e) => setSellFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sell Price (per unit)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter sell price"
                        value={sellFormData.sell_price}
                        onChange={(e) => setSellFormData((prev) => ({ ...prev, sell_price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        placeholder="Add notes about this sale..."
                        value={sellFormData.notes}
                        onChange={(e) => setSellFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSellDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSell}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Confirm Sale
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Quantity"
          value={investment.quantity.toString()}
          icon={Package}
        />
        <SummaryCard
          title="Buy Price"
          value={formatCurrency(investment.buy_price)}
          icon={Tag}
        />
        <SummaryCard
          title="Current Price"
          value={formatCurrency(investment.current_price)}
          icon={DollarSign}
        />
        <SummaryCard
          title="Profit/Loss"
          value={formatCurrency(profitLoss)}
          icon={isProfitable ? TrendingUp : TrendingDown}
          trend={isProfitable ? 'up' : 'down'}
          highlight
        />
      </div>

      {/* Investment Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
            <CardDescription>Detailed information about your investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.current_price}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, current_price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invested Amount</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(investment.invested_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(investment.current_value || 0)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Return %</p>
                    <p className={`text-lg font-semibold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(profitLossPercentage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(investment.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {investment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1">{investment.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All buy and sell transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.transaction_id}>
                        <TableCell>
                          <Badge
                            variant={transaction.transaction_type === 'BUY' ? 'default' : 'secondary'}
                          >
                            {transaction.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{transaction.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.price_per_unit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.total_amount)}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            )}
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
  trend?: 'up' | 'down';
  highlight?: boolean;
}

const SummaryCard = ({ title, value, icon: Icon, trend, highlight }: SummaryCardProps) => {
  return (
    <Card className={highlight ? 'border-primary/50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          ''
        }`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton
const InvestmentDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
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
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvestmentDetail;
