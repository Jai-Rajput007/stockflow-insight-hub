
import { Item, Sale, CashFlow, DashboardStats } from '@/types';
import { mongodb } from './mongodb';

// API service using mock MongoDB implementation
export const api = {
  // Items
  getItems: async (): Promise<Item[]> => {
    try {
      // Use the mock implementation for now
      // In a real app, this would call your backend API
      const items = await mongodb.getItems();
      return items;
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },
  
  addItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    try {
      // Use the mock implementation for now
      // In a real app, this would call your backend API
      const newItem = await mongodb.addItem(item);
      return newItem;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  },
  
  // Sales
  getSales: async (): Promise<Sale[]> => {
    try {
      // Use the mock implementation for now
      const sales = await mongodb.getSales();
      return sales;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  },
  
  addSale: async (sale: Omit<Sale, 'id' | 'saleDate' | 'itemName' | 'total'>): Promise<Sale> => {
    try {
      // Use the mock implementation for now
      const newSale = await mongodb.addSale(sale);
      return newSale;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  },
  
  // Cash Flow
  getCashFlows: async (): Promise<CashFlow[]> => {
    try {
      // Use the mock implementation for now
      const cashFlows = await mongodb.getCashFlows();
      return cashFlows;
    } catch (error) {
      console.error("Error fetching cash flows:", error);
      throw error;
    }
  },
  
  addCashFlow: async (cashFlow: Omit<CashFlow, 'id' | 'date'>): Promise<CashFlow> => {
    try {
      // Use the mock implementation for now
      const newCashFlow = await mongodb.addCashFlow(cashFlow);
      return newCashFlow;
    } catch (error) {
      console.error("Error adding cash flow:", error);
      throw error;
    }
  },
  
  // Low Stock Notifications
  getLowStockItems: async (): Promise<Item[]> => {
    try {
      // Use the mock implementation for now
      const lowStockItems = await mongodb.getLowStockItems();
      return lowStockItems;
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      throw error;
    }
  },
  
  // Monthly Report
  getMonthlyReport: async (): Promise<Item[]> => {
    try {
      // For monthly report, we'll simply use the low stock items function
      return api.getLowStockItems();
    } catch (error) {
      console.error("Error generating monthly report:", error);
      throw error;
    }
  },
  
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Use the mock implementation for now
      const stats = await mongodb.getDashboardStats();
      return stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
};
