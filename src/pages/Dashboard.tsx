
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Bell, ChartBar, Plus, ShoppingCart } from 'lucide-react';
import { api } from '@/services/api';
import { DashboardStats } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-xl font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-stockflow-text-light">Welcome to your stock management system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalItems || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats?.totalStock || 0} units in stock
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cash Balance</CardDescription>
            <CardTitle className="text-3xl">${stats?.cashBalance.toFixed(2) || "0.00"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center text-xs ${stats?.cashBalance && stats?.cashBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {stats?.cashBalance && stats?.cashBalance >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              Current balance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recent Sales</CardDescription>
            <CardTitle className="text-3xl">{stats?.recentSales.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              In the last 7 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low Stock Alerts</CardDescription>
            <CardTitle className="text-3xl">{stats?.lowStockCount || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-red-500 flex items-center">
              <Bell className="h-4 w-4 mr-1" />
              Items below threshold
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.monthlySales}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6E59A5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentSales.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center">
                  No recent sales
                </div>
              ) : (
                stats?.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium">{sale.itemName}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {sale.quantity} • {new Date(sale.saleDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-semibold">${sale.total.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/add-stock">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="bg-stockflow-primary p-2 rounded-md">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Add Stock</CardTitle>
                <CardDescription>Add new items to inventory</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/sales">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="bg-stockflow-secondary p-2 rounded-md">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Record Sale</CardTitle>
                <CardDescription>Enter new sales transactions</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/report">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="bg-stockflow-accent p-2 rounded-md">
                <ChartBar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">View Report</CardTitle>
                <CardDescription>Check monthly restock report</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
