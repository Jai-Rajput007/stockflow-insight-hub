
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Item } from '@/types';
import { Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Notifications() {
  const { toast } = useToast();
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const items = await api.getLowStockItems();
        setLowStockItems(items);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load low stock items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockItems();
  }, [toast]);

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Notifications</h1>
        <p className="text-stockflow-text-light">Items requiring attention in your inventory</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-stockflow-danger" />
              <CardTitle>Low Stock Alerts</CardTitle>
            </div>
            <div className="text-sm text-stockflow-danger font-semibold">
              {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'} below threshold
            </div>
          </div>
          <CardDescription>
            Items that need to be restocked soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading notifications...</div>
          ) : lowStockItems.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Threshold</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => {
                    const stockPercentage = (item.quantity / item.lowStockThreshold) * 100;
                    let stockStatusClass = '';
                    
                    if (stockPercentage < 30) stockStatusClass = 'text-stockflow-danger font-bold';
                    else if (stockPercentage < 70) stockStatusClass = 'text-stockflow-warning font-semibold';
                    else stockStatusClass = 'text-stockflow-text-light';
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell className={`text-center ${stockStatusClass}`}>
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-center text-stockflow-text-light">
                          {item.lowStockThreshold}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to="/add-stock">
                            <Button variant="ghost" size="sm" className="text-stockflow-primary">
                              Restock
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-green-50 rounded-md">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="bg-green-100 p-3 rounded-full">
                  <Bell className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800">All good!</h3>
                <p className="text-green-700">No items are below the stock threshold</p>
              </div>
            </div>
          )}
          
          {lowStockItems.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Link to="/add-stock">
                <Button>
                  Restock Items
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
