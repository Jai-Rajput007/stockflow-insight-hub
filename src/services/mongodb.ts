
import { Item, Sale, CashFlow } from '@/types';

// This is a mock implementation for browser environments
// In a real-world scenario, you would use a backend API to connect to MongoDB

// Type definitions for mock documents
export interface ItemDocument extends Omit<Item, 'id'> {
  _id?: string;
}

export interface SaleDocument extends Omit<Sale, 'id'> {
  _id?: string;
}

export interface CashFlowDocument extends Omit<CashFlow, 'id'> {
  _id?: string;
}

// Mock database storage
const mockDB = {
  items: [] as ItemDocument[],
  sales: [] as SaleDocument[],
  cashflow: [] as CashFlowDocument[]
};

// Generate a simple ID (in a real app, use a proper ID generation library)
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to convert mock document to application model
export function convertItemFromMongo(doc: ItemDocument): Item {
  return {
    id: doc._id || generateId(),
    name: doc.name,
    brand: doc.brand,
    type: doc.type,
    quantity: doc.quantity,
    lowStockThreshold: doc.lowStockThreshold,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export function convertSaleFromMongo(doc: SaleDocument): Sale {
  return {
    id: doc._id || generateId(),
    itemId: doc.itemId,
    itemName: doc.itemName,
    quantity: doc.quantity,
    saleDate: doc.saleDate,
    total: doc.total
  };
}

export function convertCashFlowFromMongo(doc: CashFlowDocument): CashFlow {
  return {
    id: doc._id || generateId(),
    description: doc.description,
    amount: doc.amount,
    isInflow: doc.isInflow,
    date: doc.date
  };
}

// Helper function to convert application model to mock document
export function convertItemToMongo(item: Partial<Item>): ItemDocument {
  const { id, ...rest } = item as any;
  return {
    _id: id || generateId(),
    ...rest
  };
}

export function convertSaleToMongo(sale: Partial<Sale>): SaleDocument {
  const { id, ...rest } = sale as any;
  return {
    _id: id || generateId(),
    ...rest
  };
}

export function convertCashFlowToMongo(cashFlow: Partial<CashFlow>): CashFlowDocument {
  const { id, ...rest } = cashFlow as any;
  return {
    _id: id || generateId(),
    ...rest
  };
}

// Mock MongoDB client interface
export const mongodb = {
  connect: async () => {
    console.log("Connected to mock MongoDB database");
    return {
      collection: (collectionName: string) => {
        const getCollection = () => {
          switch (collectionName) {
            case 'items': return mockDB.items;
            case 'sales': return mockDB.sales;
            case 'cashflow': return mockDB.cashflow;
            default: throw new Error(`Collection ${collectionName} not found`);
          }
        };

        return {
          find: (query = {}) => ({
            sort: (sortOptions = {}) => ({
              limit: (limit?: number) => ({
                toArray: async () => {
                  let results = [...getCollection()];
                  
                  // Basic query filtering (very simplified)
                  if (query.$expr && query.$expr.$lt) {
                    // Handle low stock query
                    results = results.filter((item: any) => 
                      item.quantity < item.lowStockThreshold
                    );
                  }
                  
                  // Apply limit if provided
                  if (limit) {
                    results = results.slice(0, limit);
                  }
                  
                  return results;
                }
              }),
              toArray: async () => {
                let results = [...getCollection()];
                
                // Handle sorting (very simplified)
                if (sortOptions && Object.keys(sortOptions).length > 0) {
                  const sortField = Object.keys(sortOptions)[0];
                  const sortOrder = sortOptions[sortField];
                  
                  results.sort((a: any, b: any) => {
                    if (sortOrder === -1) {
                      return a[sortField] > b[sortField] ? -1 : 1;
                    } else {
                      return a[sortField] < b[sortField] ? -1 : 1;
                    }
                  });
                }
                
                return results;
              }
            })
          }),
          findOne: async (query: any) => {
            const collection = getCollection();
            // Very simplified query matching
            if (query._id) {
              return collection.find((item: any) => item._id === query._id) || null;
            } else {
              // Match all fields in query
              return collection.find((item: any) => {
                return Object.keys(query).every(key => item[key] === query[key]);
              }) || null;
            }
          },
          insertOne: async (doc: any) => {
            const id = doc._id || generateId();
            const newDoc = { ...doc, _id: id };
            getCollection().push(newDoc);
            return { insertedId: id };
          },
          updateOne: async (query: any, update: any) => {
            const collection = getCollection();
            const index = collection.findIndex((item: any) => {
              if (query._id) {
                return item._id === query._id;
              }
              return false;
            });
            
            if (index !== -1) {
              // Handle $inc operator
              if (update.$inc) {
                Object.keys(update.$inc).forEach(key => {
                  collection[index][key] += update.$inc[key];
                });
              }
              
              // Handle $set operator
              if (update.$set) {
                collection[index] = { ...collection[index], ...update.$set };
              }
              
              return { modifiedCount: 1 };
            }
            
            return { modifiedCount: 0 };
          }
        };
      }
    };
  },
  convertItemFromMongo,
  convertSaleFromMongo,
  convertCashFlowFromMongo,
  convertItemToMongo,
  convertSaleToMongo,
  convertCashFlowToMongo,
  COLLECTIONS: {
    ITEMS: 'items',
    SALES: 'sales',
    CASH_FLOW: 'cashflow'
  }
};

// Seed some initial data
// Add some sample items
const seedData = () => {
  // Sample items
  mockDB.items = [
    {
      _id: generateId(),
      name: "T-Shirt",
      brand: "Example Brand",
      type: "Clothing",
      quantity: 50,
      lowStockThreshold: 10,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateId(),
      name: "Jeans",
      brand: "Denim Co",
      type: "Clothing",
      quantity: 5,
      lowStockThreshold: 8,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateId(),
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
      _id: generateId(),
      itemId: mockDB.items[0]._id!,
      itemName: mockDB.items[0].name,
      quantity: 2,
      total: 39.98,
      saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: generateId(),
      itemId: mockDB.items[1]._id!,
      itemName: mockDB.items[1].name,
      quantity: 1,
      total: 49.99,
      saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Sample cash flows
  mockDB.cashflow = [
    {
      _id: generateId(),
      description: "Initial investment",
      amount: 5000,
      isInflow: true,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: generateId(),
      description: "Rent payment",
      amount: 1200,
      isInflow: false,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Seed data when module loads
seedData();
