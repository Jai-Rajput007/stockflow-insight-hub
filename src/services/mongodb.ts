
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { Item, Sale, CashFlow } from '@/types';

// MongoDB connection string - this should be moved to environment variables in production
const uri = "mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collections names
const DB_NAME = 'stockflow';
const COLLECTIONS = {
  ITEMS: 'items',
  SALES: 'sales',
  CASH_FLOW: 'cashflow'
};

// Connect to MongoDB
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    return client.db(DB_NAME);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Type definitions for MongoDB documents
export interface ItemDocument extends Omit<Item, 'id'> {
  _id?: ObjectId;
}

export interface SaleDocument extends Omit<Sale, 'id'> {
  _id?: ObjectId;
}

export interface CashFlowDocument extends Omit<CashFlow, 'id'> {
  _id?: ObjectId;
}

// Helper function to convert MongoDB document to application model
export function convertItemFromMongo(doc: ItemDocument): Item {
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString() || '',
    ...rest
  };
}

export function convertSaleFromMongo(doc: SaleDocument): Sale {
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString() || '',
    ...rest
  };
}

export function convertCashFlowFromMongo(doc: CashFlowDocument): CashFlow {
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString() || '',
    ...rest
  };
}

// Helper function to convert application model to MongoDB document
export function convertItemToMongo(item: Partial<Item>): ItemDocument {
  const { id, ...rest } = item as any;
  return rest;
}

export function convertSaleToMongo(sale: Partial<Sale>): SaleDocument {
  const { id, ...rest } = sale as any;
  return rest;
}

export function convertCashFlowToMongo(cashFlow: Partial<CashFlow>): CashFlowDocument {
  const { id, ...rest } = cashFlow as any;
  return rest;
}

export const mongodb = {
  client,
  connect: connectToMongoDB,
  convertItemFromMongo,
  convertSaleFromMongo,
  convertCashFlowFromMongo,
  convertItemToMongo,
  convertSaleToMongo,
  convertCashFlowToMongo,
  COLLECTIONS
};
