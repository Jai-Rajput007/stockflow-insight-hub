
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CashFlow } from '@/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowDown, ArrowUp } from 'lucide-react';

// Form schema validation - make all fields required
const cashFlowSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  isInflow: z.boolean(),
});

// This ensures form values match what the API expects
type CashFlowFormValues = z.infer<typeof cashFlowSchema>;

export default function CashflowPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [loadingCashFlows, setLoadingCashFlows] = useState(true);
  
  // Calculate balance
  const inflows = cashFlows.filter(cf => cf.isInflow).reduce((sum, cf) => sum + cf.amount, 0);
  const outflows = cashFlows.filter(cf => !cf.isInflow).reduce((sum, cf) => sum + cf.amount, 0);
  const balance = inflows - outflows;

  // Initialize form with required values
  const form = useForm<CashFlowFormValues>({
    resolver: zodResolver(cashFlowSchema),
    defaultValues: {
      description: '',
      amount: 0,
      isInflow: true,
    },
  });

  // Fetch cash flows on load
  useEffect(() => {
    const fetchCashFlows = async () => {
      try {
        const data = await api.getCashFlows();
        setCashFlows(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load cash flow data",
          variant: "destructive",
        });
      } finally {
        setLoadingCashFlows(false);
      }
    };

    fetchCashFlows();
  }, [toast]);

  const onSubmit = async (values: CashFlowFormValues) => {
    setLoading(true);
    try {
      // Since values is now guaranteed to have all required fields, we can pass it directly
      const result = await api.addCashFlow(values);
      
      // Update cash flows list
      setCashFlows(prev => [result, ...prev]);
      
      toast({
        title: "Success",
        description: `Cash flow entry added: ${values.description}`,
      });
      
      // Reset form
      form.reset();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add cash flow entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Cash Flow</h1>
        <p className="text-stockflow-text-light">Track money coming in and going out of your business</p>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Cash Balance</CardDescription>
            <CardTitle className={`text-3xl ${balance >= 0 ? 'text-stockflow-success' : 'text-stockflow-danger'}`}>
              ${balance.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Current balance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-3xl text-stockflow-success">${inflows.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1" />
              Money in
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-3xl text-stockflow-danger">${outflows.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-red-500 flex items-center">
              <ArrowDown className="h-4 w-4 mr-1" />
              Money out
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Cash Flow Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Entry</CardTitle>
            <CardDescription>
              Record money coming in or going out of your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rent payment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                          step="0.01"
                          min="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isInflow"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="inflow" />
                            <Label htmlFor="inflow" className="flex items-center">
                              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
                              Income
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="outflow" />
                            <Label htmlFor="outflow" className="flex items-center">
                              <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
                              Expense
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Add Cash Flow Entry'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Cash Flow Entries List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest cash flow entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCashFlows ? (
              <div className="text-center p-8">Loading transactions...</div>
            ) : cashFlows.length > 0 ? (
              <div className="space-y-4">
                {cashFlows.map((cashFlow) => (
                  <div key={cashFlow.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{cashFlow.description}</div>
                      <div className={`font-semibold ${cashFlow.isInflow ? 'text-stockflow-success' : 'text-stockflow-danger'}`}>
                        {cashFlow.isInflow ? '+' : '-'}${cashFlow.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-xs text-stockflow-text-light mt-1">
                      {new Date(cashFlow.date).toLocaleDateString()} | {new Date(cashFlow.date).toLocaleTimeString()}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        cashFlow.isInflow ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cashFlow.isInflow ? 'Income' : 'Expense'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
