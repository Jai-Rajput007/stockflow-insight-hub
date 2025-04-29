
export interface Item {
  id: string;
  name: string;
  brand: string;
  type: string;
  quantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  saleDate: string;
  total: number;
}

export interface CashFlow {
  id: string;
  description: string;
  amount: number;
  isInflow: boolean;
  date: string;
}

export interface DashboardStats {
  totalItems: number;
  totalStock: number;
  lowStockCount: number;
  cashBalance: number;
  recentSales: Sale[];
  monthlySales: { month: string; total: number }[];
}
