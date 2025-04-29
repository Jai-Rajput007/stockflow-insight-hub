import { Item, Sale, CashFlow, DashboardStats } from '@/types';
import { mongodb } from './mongodb';
import { ObjectId } from 'mongodb';

// Helper function to simulate API delay (keeping for development purposes)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// MongoDB API service
export const api = {
  // Items
  getItems: async (): Promise<Item[]> => {
    try {
      const db = await mongodb.connect();
      const itemsCollection = db.collection(mongodb.COLLECTIONS.ITEMS);
      const items = await itemsCollection.find({}).toArray();
      
      return items.map(mongodb.convertItemFromMongo);
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },
  
  addItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    try {
      const db = await mongodb.connect();
      const itemsCollection = db.collection(mongodb.COLLECTIONS.ITEMS);
      
      // Check if item exists
      const existingItem = await itemsCollection.findOne({
        name: item.name,
        brand: item.brand,
        type: item.type
      });
      
      if (existingItem) {
        // Update quantity
        const updatedItem = {
          ...existingItem,
          quantity: existingItem.quantity + item.quantity,
          updatedAt: new Date().toISOString()
        };
        
        await itemsCollection.updateOne(
          { _id: existingItem._id },
          { $set: updatedItem }
        );
        
        return mongodb.convertItemFromMongo(updatedItem);
      } else {
        // Create new item
        const newItem = {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const result = await itemsCollection.insertOne(mongodb.convertItemToMongo(newItem));
        
        return {
          id: result.insertedId.toString(),
          ...newItem
        };
      }
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  },
  
  // Sales
  getSales: async (): Promise<Sale[]> => {
    try {
      const db = await mongodb.connect();
      const salesCollection = db.collection(mongodb.COLLECTIONS.SALES);
      const sales = await salesCollection.find({}).sort({ saleDate: -1 }).toArray();
      
      return sales.map(mongodb.convertSaleFromMongo);
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  },
  
  addSale: async (sale: Omit<Sale, 'id' | 'saleDate' | 'itemName' | 'total'>): Promise<Sale> => {
    try {
      const db = await mongodb.connect();
      const itemsCollection = db.collection(mongodb.COLLECTIONS.ITEMS);
      const salesCollection = db.collection(mongodb.COLLECTIONS.SALES);
      
      // Find the item
      const item = await itemsCollection.findOne({ _id: new ObjectId(sale.itemId) });
      
      if (!item) {
        throw new Error('Item not found');
      }
      
      if (item.quantity < sale.quantity) {
        throw new Error('Insufficient stock');
      }
      
      // Update item quantity
      await itemsCollection.updateOne(
        { _id: item._id },
        { 
          $inc: { quantity: -sale.quantity },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
      
      // Add sale
      const newSale = {
        itemId: sale.itemId,
        itemName: item.name,
        quantity: sale.quantity,
        total: sale.quantity * 19.99, // mock price calculation - consider storing price in items
        saleDate: new Date().toISOString(),
      };
      
      const result = await salesCollection.insertOne(mongodb.convertSaleToMongo(newSale));
      
      return {
        id: result.insertedId.toString(),
        ...newSale
      };
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  },
  
  // Cash Flow
  getCashFlows: async (): Promise<CashFlow[]> => {
    try {
      const db = await mongodb.connect();
      const cashFlowCollection = db.collection(mongodb.COLLECTIONS.CASH_FLOW);
      const cashFlows = await cashFlowCollection.find({}).sort({ date: -1 }).toArray();
      
      return cashFlows.map(mongodb.convertCashFlowFromMongo);
    } catch (error) {
      console.error("Error fetching cash flows:", error);
      throw error;
    }
  },
  
  addCashFlow: async (cashFlow: Omit<CashFlow, 'id' | 'date'>): Promise<CashFlow> => {
    try {
      const db = await mongodb.connect();
      const cashFlowCollection = db.collection(mongodb.COLLECTIONS.CASH_FLOW);
      
      const newCashFlow = {
        ...cashFlow,
        date: new Date().toISOString()
      };
      
      const result = await cashFlowCollection.insertOne(mongodb.convertCashFlowToMongo(newCashFlow));
      
      return {
        id: result.insertedId.toString(),
        ...newCashFlow
      };
    } catch (error) {
      console.error("Error adding cash flow:", error);
      throw error;
    }
  },
  
  // Low Stock Notifications
  getLowStockItems: async (): Promise<Item[]> => {
    try {
      const db = await mongodb.connect();
      const itemsCollection = db.collection(mongodb.COLLECTIONS.ITEMS);
      
      // Find items where quantity is less than lowStockThreshold
      const items = await itemsCollection.find({
        $expr: { $lt: ["$quantity", "$lowStockThreshold"] }
      }).toArray();
      
      return items.map(mongodb.convertItemFromMongo);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      throw error;
    }
  },
  
  // Monthly Report
  getMonthlyReport: async (): Promise<Item[]> => {
    try {
      // For monthly report, we'll simply use the low stock items function
      // In a real application, you might want more complex reporting logic
      return api.getLowStockItems();
    } catch (error) {
      console.error("Error generating monthly report:", error);
      throw error;
    }
  },
  
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const db = await mongodb.connect();
      const itemsCollection = db.collection(mongodb.COLLECTIONS.ITEMS);
      const salesCollection = db.collection(mongodb.COLLECTIONS.SALES);
      const cashFlowCollection = db.collection(mongodb.COLLECTIONS.CASH_FLOW);
      
      // Get total items and stock
      const items = await itemsCollection.find({}).toArray();
      const totalItems = items.length;
      const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Get low stock count
      const lowStockItems = items.filter(item => item.quantity < item.lowStockThreshold);
      const lowStockCount = lowStockItems.length;
      
      // Get cash balance
      const cashFlows = await cashFlowCollection.find({}).toArray();
      const inflows = cashFlows.filter(cf => cf.isInflow).reduce((sum, cf) => sum + cf.amount, 0);
      const outflows = cashFlows.filter(cf => !cf.isInflow).reduce((sum, cf) => sum + cf.amount, 0);
      const cashBalance = inflows - outflows;
      
      // Get recent sales
      const recentSales = await salesCollection.find({})
        .sort({ saleDate: -1 })
        .limit(5)
        .toArray();
      
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
        recentSales: recentSales.map(mongodb.convertSaleFromMongo),
        monthlySales
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
};
