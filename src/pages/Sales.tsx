
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, Sale } from '@/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Form schema validation - make all fields required
const saleSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().positive('Quantity must be positive').int('Quantity must be an integer'),
});

// This ensures form values match what the API expects
type SaleFormValues = z.infer<typeof saleSchema>;

export default function Sales() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  // Initialize form with required values
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      itemId: '',
      quantity: 1,
    },
  });

  // Fetch items and recent sales on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsData = await api.getItems();
        setItems(itemsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load inventory items",
          variant: "destructive",
        });
      } finally {
        setLoadingItems(false);
      }

      try {
        const salesData = await api.getSales();
        setRecentSales(salesData.slice(0, 10).reverse()); // Get last 10 sales
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load recent sales",
          variant: "destructive",
        });
      } finally {
        setLoadingSales(false);
      }
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (values: SaleFormValues) => {
    setLoading(true);
    try {
      // Since values is now guaranteed to have all required fields due to the schema validation
      const result = await api.addSale(values);
      
      // Update recent sales list
      setRecentSales(prev => [result, ...prev.slice(0, 9)]);
      
      // Update item quantity in the items list
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === values.itemId 
            ? { ...item, quantity: item.quantity - values.quantity } 
            : item
        )
      );
      
      toast({
        title: "Sale Recorded",
        description: `Successfully sold ${values.quantity} units of ${result.itemName}`,
      });
      
      // Reset form
      form.reset();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = form.watch('itemId') 
    ? items.find(item => item.id === form.watch('itemId'))
    : null;

  const maxQuantity = selectedItem?.quantity || 0;
  
  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Sales</h1>
        <p className="text-stockflow-text-light">Record product sales and view recent transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Record Sale Form */}
        <Card>
          <CardHeader>
            <CardTitle>Record New Sale</CardTitle>
            <CardDescription>
              Enter the details of the sale you want to record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="text-center p-8">Loading inventory...</div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="itemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Item</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem 
                                key={item.id} 
                                value={item.id}
                                disabled={item.quantity === 0}
                              >
                                {item.name} - {item.brand} ({item.quantity} in stock)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            min="1"
                            max={maxQuantity}
                          />
                        </FormControl>
                        {selectedItem && (
                          <div className="text-sm text-muted-foreground">
                            Available: {selectedItem.quantity} units
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedItem && form.watch('quantity') > selectedItem.quantity && (
                    <div className="text-sm text-red-500">
                      Not enough stock available. Maximum: {selectedItem.quantity}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !selectedItem || form.watch('quantity') > maxQuantity}
                  >
                    {loading ? 'Processing...' : 'Record Sale'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Latest transactions recorded in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="text-center p-8">Loading recent sales...</div>
            ) : recentSales.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.itemName}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sales recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
