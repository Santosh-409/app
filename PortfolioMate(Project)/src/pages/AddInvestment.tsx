import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investmentService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import type { InvestmentType } from '@/types';

const AddInvestment = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [formData, setFormData] = useState({
    type_id: '',
    asset_name: '',
    asset_symbol: '',
    quantity: '',
    buy_price: '',
    current_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchInvestmentTypes();
  }, []);

  const fetchInvestmentTypes = async () => {
    try {
      const response = await investmentService.getTypes();
      if (response.success) {
        setInvestmentTypes(response.data);
      }
    } catch (error) {
      toast.error('Failed to load investment types');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type_id || !formData.asset_name || !formData.quantity || !formData.buy_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await investmentService.create({
        type_id: parseInt(formData.type_id),
        asset_name: formData.asset_name,
        asset_symbol: formData.asset_symbol || undefined,
        quantity: parseFloat(formData.quantity),
        buy_price: parseFloat(formData.buy_price),
        current_price: formData.current_price ? parseFloat(formData.current_price) : undefined,
        purchase_date: formData.purchase_date,
        notes: formData.notes || undefined,
      });

      if (response.success) {
        toast.success('Investment added successfully');
        navigate('/investments');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add investment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.buy_price) || 0;
    return (quantity * price).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add Investment</h2>
          <p className="text-muted-foreground">
            Add a new investment to your portfolio
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
          <CardDescription>
            Enter the details of your investment below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Investment Type */}
            <div className="space-y-2">
              <Label htmlFor="type_id">
                Investment Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select investment type" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map((type) => (
                    <SelectItem key={type.type_id} value={type.type_id.toString()}>
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Name & Symbol */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="asset_name">
                  Asset Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="asset_name"
                  name="asset_name"
                  placeholder="e.g., Apple Inc."
                  value={formData.asset_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_symbol">Symbol/Ticker</Label>
                <Input
                  id="asset_symbol"
                  name="asset_symbol"
                  placeholder="e.g., AAPL"
                  value={formData.asset_symbol}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Quantity & Buy Price */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buy_price">
                  Buy Price (per unit) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="buy_price"
                  name="buy_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 150.00"
                  value={formData.buy_price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Current Price & Purchase Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current_price">Current Price (optional)</Label>
                <Input
                  id="current_price"
                  name="current_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 175.00"
                  value={formData.current_price}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">
                  Purchase Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Total Investment Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm">Total Investment</span>
              </div>
              <p className="text-2xl font-bold">
                ${calculateTotal()}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes about this investment..."
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Investment'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddInvestment;
