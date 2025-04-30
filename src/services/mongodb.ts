
import { Item, Sale, CashFlow, DashboardStats } from '@/types';

// This is a mock implementation for browser environments
// In a real-world scenario, you would use a backend API to connect to MongoDB

// Mock database storage
const mockDB = {
  items: [] as Item[],
  sales: [] as Sale[],
  cashFlow: [] as CashFlow[]
};

// Generate a simple ID (in a real app, use a proper ID generation library)
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper to simulate API delay (for realistic experience)
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://jaisrajputdev:JHyuuDEj6mpf4X7C@stockflow.saaoepn.mongodb.net/?retryWrites=true&w=majority&appName=Stockflow";

// Console log the connection info (for debugging purposes)
console.log("MongoDB connection info:", {
  uri: MONGODB_URI.replace(/\/\/.*:.*@/, "//[USERNAME:PASSWORD]@") // Hide credentials in logs
});

// Warning: We're using a mock implementation because MongoDB cannot be used directly in browser
console.warn("Using mock MongoDB implementation. In production, you would connect to MongoDB through a backend API.");

export const mongodb = {
  // Items collection operations
  getItems: async (): Promise<Item[]> => {
    console.log("Mock: Fetching items");
    await delay();
    return [...mockDB.items];
  },
  
  addItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    console.log("Mock: Adding item", item);
    await delay();
    
    // Check if item exists
    const existingItemIndex = mockDB.items.findIndex(
      i => i.name === item.name && i.brand === item.brand && i.type === item.type
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity
      const existingItem = mockDB.items[existingItemIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
        updatedAt: new Date().toISOString()
      };
      
      mockDB.items[existingItemIndex] = updatedItem;
      return updatedItem;
    } else {
      // Create new item
      const newItem: Item = {
        id: generateId(),
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockDB.items.push(newItem);
      return newItem;
    }
  },
  
  // Sales collection operations
  getSales: async (): Promise<Sale[]> => {
    console.log("Mock: Fetching sales");
    await delay();
    return [...mockDB.sales].sort((a, b) => 
      new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
    );
  },
  
  addSale: async (sale: Omit<Sale, 'id' | 'saleDate' | 'itemName' | 'total'>): Promise<Sale> => {
    console.log("Mock: Adding sale", sale);
    await delay();
    
    // Find the item
    const item = mockDB.items.find(i => i.id === sale.itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    if (item.quantity < sale.quantity) {
      throw new Error('Insufficient stock');
    }
    
    // Update item quantity
    const itemIndex = mockDB.items.findIndex(i => i.id === sale.itemId);
    mockDB.items[itemIndex] = {
      ...item,
      quantity: item.quantity - sale.quantity,
      updatedAt: new Date().toISOString()
    };
    
    // Add sale
    const newSale: Sale = {
      id: generateId(),
      itemId: sale.itemId,
      itemName: item.name,
      quantity: sale.quantity,
      total: sale.quantity * 19.99, // mock price calculation
      saleDate: new Date().toISOString(),
    };
    
    mockDB.sales.push(newSale);
    return newSale;
  },
  
  // Cash Flow collection operations
  getCashFlows: async (): Promise<CashFlow[]> => {
    console.log("Mock: Fetching cash flows");
    await delay();
    return [...mockDB.cashFlow].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  
  addCashFlow: async (cashFlow: Omit<CashFlow, 'id' | 'date'>): Promise<CashFlow> => {
    console.log("Mock: Adding cash flow", cashFlow);
    await delay();
    
    const newCashFlow: CashFlow = {
      id: generateId(),
      ...cashFlow,
      date: new Date().toISOString()
    };
    
    mockDB.cashFlow.push(newCashFlow);
    return newCashFlow;
  },
  
  // Low Stock Notifications
  getLowStockItems: async (): Promise<Item[]> => {
    console.log("Mock: Fetching low stock items");
    await delay();
    
    // Find items where quantity is less than lowStockThreshold
    return mockDB.items.filter(item => item.quantity < item.lowStockThreshold);
  },
  
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    console.log("Mock: Fetching dashboard stats");
    await delay();
    
    // Get total items and stock
    const totalItems = mockDB.items.length;
    const totalStock = mockDB.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Get low stock count
    const lowStockItems = mockDB.items.filter(item => item.quantity < item.lowStockThreshold);
    const lowStockCount = lowStockItems.length;
    
    // Get cash balance
    const inflows = mockDB.cashFlow
      .filter(cf => cf.isInflow)
      .reduce((sum, cf) => sum + cf.amount, 0);
    const outflows = mockDB.cashFlow
      .filter(cf => !cf.isInflow)
      .reduce((sum, cf) => sum + cf.amount, 0);
    const cashBalance = inflows - outflows;
    
    // Get recent sales
    const recentSales = [...mockDB.sales]
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5);
    
    // For monthly sales, we would ideally query with aggregation
    // This is simplified for demonstration purposes
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

// Seed some initial data
const seedData = () => {
  // Sample items
  mockDB.items = [
    {
      id: generateId(),
      name: "T-Shirt",
      brand: "Example Brand",
      type: "Clothing",
      quantity: 50,
      lowStockThreshold: 10,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      name: "Jeans",
      brand: "Denim Co",
      type: "Clothing",
      quantity: 5,
      lowStockThreshold: 8,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      name: "Sunglasses",
      brand: "Sun Co",
      type: "Accessories",
      quantity: 15,
      lowStockThreshold: 5,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample sales
  mockDB.sales = [
    {
      id: generateId(),
      itemId: mockDB.items[0].id,
      itemName: mockDB.items[0].name,
      quantity: 2,
      total: 39.98,
      saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      itemId: mockDB.items[1].id,
      itemName: mockDB.items[1].name,
      quantity: 1,
      total: 49.99,
      saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Sample cash flows
  mockDB.cashFlow = [
    {
      id: generateId(),
      description: "Initial investment",
      amount: 5000,
      isInflow: true,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      description: "Rent payment",
      amount: 1200,
      isInflow: false,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Seed data when module loads
seedData();
