
import { Item, Sale, CashFlow, DashboardStats } from '@/types';

// Mock data
let items: Item[] = [
  {
    id: '1',
    name: 'T-Shirt',
    brand: 'Fashion Brand',
    type: 'Clothing',
    quantity: 50,
    lowStockThreshold: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jeans',
    brand: 'Denim Co',
    type: 'Clothing',
    quantity: 30,
    lowStockThreshold: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Sneakers',
    brand: 'Footwear Inc',
    type: 'Shoes',
    quantity: 8,
    lowStockThreshold: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Backpack',
    brand: 'Travel Gear',
    type: 'Accessories',
    quantity: 15,
    lowStockThreshold: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Watch',
    brand: 'Time Co',
    type: 'Accessories',
    quantity: 5,
    lowStockThreshold: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let sales: Sale[] = [
  {
    id: '1',
    itemId: '1',
    itemName: 'T-Shirt',
    quantity: 2,
    saleDate: new Date().toISOString(),
    total: 29.98
  },
  {
    id: '2',
    itemId: '2',
    itemName: 'Jeans',
    quantity: 1,
    saleDate: new Date().toISOString(),
    total: 49.99
  },
  {
    id: '3',
    itemId: '3',
    itemName: 'Sneakers',
    quantity: 1,
    saleDate: new Date().toISOString(),
    total: 89.99
  }
];

let cashFlows: CashFlow[] = [
  {
    id: '1',
    description: 'Initial Investment',
    amount: 10000,
    isInflow: true,
    date: new Date().toISOString()
  },
  {
    id: '2',
    description: 'Rent Payment',
    amount: 1500,
    isInflow: false,
    date: new Date().toISOString()
  },
  {
    id: '3',
    description: 'Sales Revenue',
    amount: 2500,
    isInflow: true,
    date: new Date().toISOString()
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const api = {
  // Items
  getItems: async (): Promise<Item[]> => {
    await delay(500);
    return [...items];
  },
  
  addItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    await delay(500);
    
    // Check if item exists
    const existingItem = items.find(i => 
      i.name === item.name && 
      i.brand === item.brand && 
      i.type === item.type
    );
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += item.quantity;
      existingItem.updatedAt = new Date().toISOString();
      return existingItem;
    } else {
      // Create new item
      const newItem: Item = {
        id: (items.length + 1).toString(),
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.push(newItem);
      return newItem;
    }
  },
  
  // Sales
  getSales: async (): Promise<Sale[]> => {
    await delay(500);
    return [...sales];
  },
  
  addSale: async (sale: Omit<Sale, 'id' | 'saleDate' | 'itemName' | 'total'>): Promise<Sale> => {
    await delay(500);
    
    const item = items.find(i => i.id === sale.itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    if (item.quantity < sale.quantity) {
      throw new Error('Insufficient stock');
    }
    
    // Update item quantity
    item.quantity -= sale.quantity;
    item.updatedAt = new Date().toISOString();
    
    // Add sale
    const newSale: Sale = {
      id: (sales.length + 1).toString(),
      itemName: item.name,
      total: sale.quantity * 19.99, // mock price calculation
      saleDate: new Date().toISOString(),
      ...sale
    };
    
    sales.push(newSale);
    return newSale;
  },
  
  // Cash Flow
  getCashFlows: async (): Promise<CashFlow[]> => {
    await delay(500);
    return [...cashFlows];
  },
  
  addCashFlow: async (cashFlow: Omit<CashFlow, 'id' | 'date'>): Promise<CashFlow> => {
    await delay(500);
    
    const newCashFlow: CashFlow = {
      id: (cashFlows.length + 1).toString(),
      date: new Date().toISOString(),
      ...cashFlow
    };
    
    cashFlows.push(newCashFlow);
    return newCashFlow;
  },
  
  // Low Stock Notifications
  getLowStockItems: async (): Promise<Item[]> => {
    await delay(500);
    return items.filter(item => item.quantity < item.lowStockThreshold);
  },
  
  // Monthly Report
  getMonthlyReport: async (): Promise<Item[]> => {
    await delay(500);
    return items.filter(item => item.quantity < item.lowStockThreshold);
  },
  
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(500);
    
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = items.filter(item => item.quantity < item.lowStockThreshold).length;
    
    const inflows = cashFlows.filter(cf => cf.isInflow).reduce((sum, cf) => sum + cf.amount, 0);
    const outflows = cashFlows.filter(cf => !cf.isInflow).reduce((sum, cf) => sum + cf.amount, 0);
    const cashBalance = inflows - outflows;
    
    const recentSales = sales.slice(-5).reverse();
    
    const monthlySales = [
      { month: 'Jan', total: 5000 },
      { month: 'Feb', total: 6200 },
      { month: 'Mar', total: 4800 },
      { month: 'Apr', total: 5600 },
      { month: 'May', total: 7500 },
      { month: 'Jun', total: 8200 },
    ];
    
    return {
      totalItems,
      totalStock,
      lowStockCount,
      cashBalance,
      recentSales,
      monthlySales
    };
  }
};
