import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { investmentService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import type { Investment, InvestmentType } from '@/types';

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [investmentsRes, typesRes] = await Promise.all([
        investmentService.getAll(),
        investmentService.getTypes(),
      ]);

      if (investmentsRes.success) {
        setInvestments(investmentsRes.data);
      }

      if (typesRes.success) {
        setInvestmentTypes(typesRes.data);
      }
    } catch (error) {
      toast.error('Failed to load investments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investment?')) {
      return;
    }

    try {
      const response = await investmentService.delete(id.toString());
      if (response.success) {
        toast.success('Investment deleted successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete investment');
    }
  };

  const filteredInvestments = investments.filter((investment) => {
    const matchesSearch = 
      investment.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (investment.asset_symbol && investment.asset_symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || investment.type_id.toString() === selectedType;
    
    return matchesSearch && matchesType;
  });

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
    return <InvestmentsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Investments</h2>
          <p className="text-muted-foreground">
            Manage and track all your investments
          </p>
        </div>
        <Button asChild>
          <Link to="/investments/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Investment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {investmentTypes.map((type) => (
                  <SelectItem key={type.type_id} value={type.type_id.toString()}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
          <CardDescription>
            {filteredInvestments.length} investment{filteredInvestments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvestments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Buy Price</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvestments.map((investment) => (
                    <TableRow key={investment.investment_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{investment.asset_name}</p>
                          {investment.asset_symbol && (
                            <p className="text-sm text-muted-foreground">
                              {investment.asset_symbol}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{investment.type_name}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {investment.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(investment.buy_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(investment.current_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${
                          (investment.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(investment.profit_loss || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {formatCurrency(investment.profit_loss || 0)}
                          </span>
                        </div>
                        <span className={`text-xs ${
                          (investment.profit_loss_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(investment.profit_loss_percentage || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/investments/${investment.investment_id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/investments/${investment.investment_id}?edit=true`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(investment.investment_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No investments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first investment'}
              </p>
              {!searchQuery && selectedType === 'all' && (
                <Button asChild>
                  <Link to="/investments/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Investment
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Loading Skeleton
const InvestmentsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Investments;
