
import { Item, Sale, CashFlow, DashboardStats } from '@/types';
import { mongodb } from './mongodb';

// API base URL - change to your backend URL when deployed
const API_BASE_URL = 'http://localhost:8000/api';

// API service with fallback to mock implementation
export const api = {
  // Items
  getItems: async (): Promise<Item[]> => {
    try {
      console.log("Fetching items from API");
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/items`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("API items response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching items from API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.getItems();
    }
  },
  
  addItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    try {
      console.log("Adding item via API:", item);
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      console.log("API add item response:", data);
      return data;
    } catch (error) {
      console.error("Error adding item using API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.addItem(item);
    }
  },
  
  // Sales
  getSales: async (): Promise<Sale[]> => {
    try {
      console.log("Fetching sales from API");
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/sales`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("API sales response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching sales from API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.getSales();
    }
  },
  
  addSale: async (sale: Omit<Sale, 'id' | 'saleDate' | 'itemName' | 'total'>): Promise<Sale> => {
    try {
      console.log("Adding sale via API:", sale);
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      console.log("API add sale response:", data);
      return data;
    } catch (error) {
      console.error("Error adding sale using API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.addSale(sale);
    }
  },
  
  // Cash Flow
  getCashFlows: async (): Promise<CashFlow[]> => {
    try {
      console.log("Fetching cash flows from API");
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/cashflows`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("API cash flows response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching cash flows from API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.getCashFlows();
    }
  },
  
  addCashFlow: async (cashFlow: Omit<CashFlow, 'id' | 'date'>): Promise<CashFlow> => {
    try {
      console.log("Adding cash flow via API:", cashFlow);
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/cashflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cashFlow),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      console.log("API add cash flow response:", data);
      return data;
    } catch (error) {
      console.error("Error adding cash flow using API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.addCashFlow(cashFlow);
    }
  },
  
  // Low Stock Notifications
  getLowStockItems: async (): Promise<Item[]> => {
    try {
      console.log("Fetching low stock items from API");
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/lowstock`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("API low stock items response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching low stock items from API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.getLowStockItems();
    }
  },
  
  // Monthly Report
  getMonthlyReport: async (): Promise<Item[]> => {
    try {
      // Use low stock items endpoint for report
      return api.getLowStockItems();
    } catch (error) {
      console.error("Error generating monthly report:", error);
      throw error;
    }
  },
  
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      console.log("Fetching dashboard stats from API");
      // Try to use the backend API
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("API dashboard stats response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching dashboard stats from API, falling back to mock:", error);
      // Fallback to mock implementation
      return mongodb.getDashboardStats();
    }
  }
};
