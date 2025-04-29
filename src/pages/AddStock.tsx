
import React, { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form schema validation
const addStockSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  type: z.string().min(1, 'Type is required'),
  quantity: z.number().positive('Quantity must be positive').int('Quantity must be an integer'),
  lowStockThreshold: z.number().positive('Threshold must be positive').int('Threshold must be an integer'),
});

type AddStockFormValues = z.infer<typeof addStockSchema>;

export default function AddStock() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Initialize form
  const form = useForm<AddStockFormValues>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      name: '',
      brand: '',
      type: '',
      quantity: 1,
      lowStockThreshold: 10,
    },
  });

  const onSubmit = async (values: AddStockFormValues) => {
    setLoading(true);
    try {
      const result = await api.addItem(values);
      toast({
        title: "Success",
        description: `${result.name} has been added to inventory`,
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Add Stock</h1>
        <p className="text-stockflow-text-light">Add new items or update existing inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Enter the details of the item you want to add to inventory. If the item already exists (same name, brand, and type), its quantity will be updated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="T-Shirt" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="Fashion Co" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type/Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Clothing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          min="1" 
                        />
                      </FormControl>
                      <FormDescription>
                        Number of items to add to stock
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </FormControl>
                      <FormDescription>
                        Alert when stock falls below this value
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Item to Inventory'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
