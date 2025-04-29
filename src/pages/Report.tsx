
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Item } from '@/types';
import { FileText, Download, ChartBar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Report() {
  const { toast } = useToast();
  const [reportItems, setReportItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const items = await api.getMonthlyReport();
        setReportItems(items);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load monthly report data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [toast]);
  
  // Function to generate and download CSV
  const downloadCSV = () => {
    if (reportItems.length === 0) return;
    
    // CSV headers
    const headers = ['Item Name', 'Brand', 'Type', 'Current Stock', 'Threshold', 'Status'];
    
    // Create rows
    const rows = reportItems.map(item => [
      item.name,
      item.brand,
      item.type,
      item.quantity.toString(),
      item.lowStockThreshold.toString(),
      item.quantity < item.lowStockThreshold ? 'Low Stock' : 'OK'
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly-report-${currentDate.toISOString().slice(0, 7)}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Monthly Restock Report</h1>
        <p className="text-stockflow-text-light">
          Report for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-stockflow-primary" />
              <CardTitle>Restock Recommendations</CardTitle>
            </div>
            <Button variant="outline" onClick={downloadCSV} disabled={reportItems.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <CardDescription>
            Items that are below their stock threshold and need to be restocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Generating report...</div>
          ) : reportItems.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Threshold</TableHead>
                    <TableHead className="text-right">Qty to Reorder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportItems.map((item) => {
                    // Calculate recommended order quantity (2x threshold - current quantity)
                    const reorderQuantity = Math.max((item.lowStockThreshold * 2) - item.quantity, 1);
                    
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
                        <TableCell className="text-right font-medium">
                          {reorderQuantity}
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
                  <ChartBar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800">All good!</h3>
                <p className="text-green-700">No items require restocking at this time</p>
              </div>
            </div>
          )}
          
          {reportItems.length > 0 && (
            <div className="mt-6 text-sm text-stockflow-text-light">
              <p>This report shows items that are below their stock threshold and should be reordered.</p>
              <p className="mt-2">The suggested reorder quantity is calculated to bring your stock to twice the threshold level.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
