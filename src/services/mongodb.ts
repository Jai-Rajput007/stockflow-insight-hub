
import { MongoClient, ServerApiVersion, ObjectId, Document, WithId } from 'mongodb';
import { Item, Sale, CashFlow } from '@/types';

// MongoDB connection string with the provided credentials
const uri = "mongodb+srv://jaisrajputdev:JHyuuDEj6mpf4X7C@stockflow.saaoepn.mongodb.net/?retryWrites=true&w=majority&appName=Stockflow";

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
export function convertItemFromMongo(doc: WithId<Document>): Item {
  return {
    id: doc._id.toString(),
    name: doc.name as string,
    brand: doc.brand as string,
    type: doc.type as string,
    quantity: doc.quantity as number,
    lowStockThreshold: doc.lowStockThreshold as number,
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string
  };
}

export function convertSaleFromMongo(doc: WithId<Document>): Sale {
  return {
    id: doc._id.toString(),
    itemId: doc.itemId as string,
    itemName: doc.itemName as string,
    quantity: doc.quantity as number,
    saleDate: doc.saleDate as string,
    total: doc.total as number
  };
}

export function convertCashFlowFromMongo(doc: WithId<Document>): CashFlow {
  return {
    id: doc._id.toString(),
    description: doc.description as string,
    amount: doc.amount as number,
    isInflow: doc.isInflow as boolean,
    date: doc.date as string
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
