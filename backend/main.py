
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
import logging
import asyncio
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="StockFlow API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "stockflow")

# Create motor client
client = None
db = None

@app.on_event("startup")
async def startup_db_client():
    global client, db
    logger.info(f"Connecting to MongoDB: {MONGODB_URI}")
    
    try:
        # Create a test client connection to verify
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Force a connection to verify
        await client.server_info()
        logger.info("Successfully connected to MongoDB")
        
        db = client[DATABASE_NAME]
        logger.info(f"Using database: {DATABASE_NAME}")
        
        # Initialize collections
        await initialize_collections()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def initialize_collections():
    """Initialize collections and add sample data if they're empty"""
    logger.info("Checking and initializing collections")
    
    # List existing collections
    collections = await db.list_collection_names()
    logger.info(f"Existing collections: {collections}")
    
    # Initialize items collection
    if "items" not in collections:
        logger.info("Creating items collection")
        await db.create_collection("items")
    
    # Add sample items if empty
    if await db.items.count_documents({}) == 0:
        logger.info("Adding sample items")
        sample_items = [
            {
                "name": "T-Shirt",
                "brand": "Example Brand",
                "type": "Clothing",
                "quantity": 50,
                "lowStockThreshold": 10,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            },
            {
                "name": "Jeans",
                "brand": "Denim Co",
                "type": "Clothing",
                "quantity": 5,
                "lowStockThreshold": 8,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            },
            {
                "name": "Sunglasses",
                "brand": "Sun Co",
                "type": "Accessories",
                "quantity": 15,
                "lowStockThreshold": 5,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            },
            {
                "name": "Sneakers",
                "brand": "FootWear Inc",
                "type": "Footwear",
                "quantity": 20,
                "lowStockThreshold": 7,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            },
            {
                "name": "Watch",
                "brand": "TimeCo",
                "type": "Accessories",
                "quantity": 8,
                "lowStockThreshold": 10,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
        ]
        result = await db.items.insert_many(sample_items)
        logger.info(f"Inserted {len(result.inserted_ids)} sample items")
    
    # Initialize sales collection
    if "sales" not in collections:
        logger.info("Creating sales collection")
        await db.create_collection("sales")
    
    # Add sample sales if empty
    if await db.sales.count_documents({}) == 0:
        logger.info("Adding sample sales")
        
        # Get some item IDs to reference
        items = await db.items.find().to_list(length=3)
        
        if items:
            sample_sales = []
            for i, item in enumerate(items):
                # Create multiple sales per item with different dates
                for j in range(3):
                    days_ago = i * 2 + j
                    sale_date = datetime.now()
                    
                    sample_sales.append({
                        "itemId": str(item["_id"]),
                        "itemName": item["name"],
                        "quantity": j + 1,
                        "total": (j + 1) * 19.99,
                        "saleDate": sale_date.isoformat()
                    })
            
            if sample_sales:
                result = await db.sales.insert_many(sample_sales)
                logger.info(f"Inserted {len(result.inserted_ids)} sample sales")
    
    # Initialize cashflows collection
    if "cashflows" not in collections:
        logger.info("Creating cashflows collection")
        await db.create_collection("cashflows")
    
    # Add sample cashflows if empty
    if await db.cashflows.count_documents({}) == 0:
        logger.info("Adding sample cashflows")
        sample_cashflows = [
            {
                "description": "Initial investment",
                "amount": 5000.00,
                "isInflow": True,
                "date": datetime.now().isoformat()
            },
            {
                "description": "Rent payment",
                "amount": 1200.00,
                "isInflow": False,
                "date": datetime.now().isoformat()
            },
            {
                "description": "Sales revenue",
                "amount": 3500.00,
                "isInflow": True,
                "date": datetime.now().isoformat()
            },
            {
                "description": "Utilities",
                "amount": 350.00,
                "isInflow": False,
                "date": datetime.now().isoformat()
            },
            {
                "description": "Online orders",
                "amount": 2200.00,
                "isInflow": True,
                "date": datetime.now().isoformat()
            }
        ]
        result = await db.cashflows.insert_many(sample_cashflows)
        logger.info(f"Inserted {len(result.inserted_ids)} sample cashflows")

@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")

# Helper function to convert ObjectId to string in all documents
def fix_id(item):
    if item and "_id" in item:
        item["id"] = str(item["_id"])
        del item["_id"]
    return item

# Models
class ItemBase(BaseModel):
    name: str
    brand: str
    type: str
    quantity: int
    lowStockThreshold: int

class Item(ItemBase):
    id: str
    createdAt: str
    updatedAt: str

class SaleBase(BaseModel):
    itemId: str
    quantity: int

class Sale(BaseModel):
    id: str
    itemId: str
    itemName: str
    quantity: int
    saleDate: str
    total: float

class CashFlowBase(BaseModel):
    description: str
    amount: float
    isInflow: bool

class CashFlow(BaseModel):
    id: str
    description: str
    amount: float
    isInflow: bool
    date: str

class MonthSale(BaseModel):
    month: str
    total: float

class DashboardStats(BaseModel):
    totalItems: int
    totalStock: int
    lowStockCount: int
    cashBalance: float
    recentSales: List[Sale]
    monthlySales: List[MonthSale]

# Routes

# Items routes
@app.get("/api/items", response_model=List[Item])
async def get_items():
    logger.info("Getting all items")
    items = await db.items.find().to_list(1000)
    return [fix_id(item) for item in items]

@app.post("/api/items", response_model=Item)
async def add_item(item: ItemBase):
    logger.info(f"Adding/updating item: {item.name}")
    # Check if item exists
    existing_item = await db.items.find_one({
        "name": item.name,
        "brand": item.brand,
        "type": item.type
    })
    
    now = datetime.now().isoformat()
    
    if existing_item:
        logger.info(f"Updating existing item: {item.name}")
        # Update quantity
        result = await db.items.update_one(
            {"_id": existing_item["_id"]},
            {"$set": {
                "quantity": existing_item["quantity"] + item.quantity,
                "updatedAt": now
            }}
        )
        updated_item = await db.items.find_one({"_id": existing_item["_id"]})
        return fix_id(updated_item)
    else:
        logger.info(f"Creating new item: {item.name}")
        # Create new item
        new_item = item.dict()
        new_item["createdAt"] = now
        new_item["updatedAt"] = now
        result = await db.items.insert_one(new_item)
        created_item = await db.items.find_one({"_id": result.inserted_id})
        return fix_id(created_item)

# Sales routes
@app.get("/api/sales", response_model=List[Sale])
async def get_sales():
    logger.info("Getting all sales")
    sales = await db.sales.find().sort("saleDate", -1).to_list(1000)
    return [fix_id(sale) for sale in sales]

@app.post("/api/sales", response_model=Sale)
async def add_sale(sale: SaleBase):
    logger.info(f"Adding sale for item ID: {sale.itemId}")
    # Find the item
    try:
        item = await db.items.find_one({"_id": ObjectId(sale.itemId)})
    except Exception as e:
        logger.error(f"Error finding item: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid item ID format: {sale.itemId}")
        
    if not item:
        logger.error(f"Item not found with ID: {sale.itemId}")
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item["quantity"] < sale.quantity:
        logger.error(f"Insufficient stock for item: {sale.itemId}")
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Update item quantity
    await db.items.update_one(
        {"_id": item["_id"]},
        {"$set": {
            "quantity": item["quantity"] - sale.quantity,
            "updatedAt": datetime.now().isoformat()
        }}
    )
    
    # Add sale with a mock price calculation
    new_sale = {
        "itemId": sale.itemId,
        "itemName": item["name"],
        "quantity": sale.quantity,
        "total": sale.quantity * 19.99,  # Mock price calculation
        "saleDate": datetime.now().isoformat()
    }
    
    result = await db.sales.insert_one(new_sale)
    created_sale = await db.sales.find_one({"_id": result.inserted_id})
    return fix_id(created_sale)

# Cash Flow routes
@app.get("/api/cashflows", response_model=List[CashFlow])
async def get_cash_flows():
    logger.info("Getting all cash flows")
    cashflows = await db.cashflows.find().sort("date", -1).to_list(1000)
    return [fix_id(cf) for cf in cashflows]

@app.post("/api/cashflows", response_model=CashFlow)
async def add_cash_flow(cashflow: CashFlowBase):
    logger.info(f"Adding cash flow: {cashflow.description}")
    new_cashflow = cashflow.dict()
    new_cashflow["date"] = datetime.now().isoformat()
    
    result = await db.cashflows.insert_one(new_cashflow)
    created_cashflow = await db.cashflows.find_one({"_id": result.inserted_id})
    return fix_id(created_cashflow)

# Low Stock Items
@app.get("/api/lowstock", response_model=List[Item])
async def get_low_stock_items():
    logger.info("Getting low stock items")
    pipeline = [
        {"$match": {"$expr": {"$lt": ["$quantity", "$lowStockThreshold"]}}},
    ]
    low_stock_items = await db.items.aggregate(pipeline).to_list(1000)
    return [fix_id(item) for item in low_stock_items]

# Dashboard stats
@app.get("/api/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    logger.info("Getting dashboard stats")
    # Get total items and stock
    items_count = await db.items.count_documents({})
    
    pipeline = [
        {"$group": {"_id": None, "totalStock": {"$sum": "$quantity"}}}
    ]
    stock_result = await db.items.aggregate(pipeline).to_list(1)
    total_stock = stock_result[0]["totalStock"] if stock_result else 0
    
    # Get low stock count
    low_stock_count = await db.items.count_documents(
        {"$expr": {"$lt": ["$quantity", "$lowStockThreshold"]}}
    )
    
    # Get cash balance
    inflow_pipeline = [
        {"$match": {"isInflow": True}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    
    outflow_pipeline = [
        {"$match": {"isInflow": False}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    
    inflows_result = await db.cashflows.aggregate(inflow_pipeline).to_list(1)
    outflows_result = await db.cashflows.aggregate(outflow_pipeline).to_list(1)
    
    inflows = inflows_result[0]["total"] if inflows_result else 0
    outflows = outflows_result[0]["total"] if outflows_result else 0
    cash_balance = inflows - outflows
    
    # Get recent sales
    recent_sales = await db.sales.find().sort("saleDate", -1).limit(5).to_list(5)
    recent_sales = [fix_id(sale) for sale in recent_sales]
    
    # Generate monthly sales data based on actual data
    pipeline = [
        {
            "$group": {
                "_id": {"$substr": ["$saleDate", 0, 7]},  # Group by YYYY-MM
                "total": {"$sum": "$total"}
            }
        },
        {"$sort": {"_id": 1}},  # Sort by date
        {"$limit": 6}  # Get last 6 months
    ]
    
    monthly_sales_data = await db.sales.aggregate(pipeline).to_list(6)
    
    # Format the monthly sales data
    monthly_sales = []
    
    # If we have real data, use it
    if monthly_sales_data:
        for item in monthly_sales_data:
            # Convert YYYY-MM to month name
            try:
                year_month = item["_id"].split("-")
                month_num = int(year_month[1])
                month_name = datetime(2000, month_num, 1).strftime("%b")
                monthly_sales.append({"month": month_name, "total": item["total"]})
            except Exception as e:
                logger.error(f"Error formatting monthly sales: {e}")
    
    # If no real data, use mock data
    if not monthly_sales:
        monthly_sales = [
            {"month": "Jan", "total": 5000},
            {"month": "Feb", "total": 6200},
            {"month": "Mar", "total": 4800},
            {"month": "Apr", "total": 5600},
            {"month": "May", "total": 7500},
            {"month": "Jun", "total": 8200},
        ]
    
    return {
        "totalItems": items_count,
        "totalStock": total_stock,
        "lowStockCount": low_stock_count,
        "cashBalance": cash_balance,
        "recentSales": recent_sales,
        "monthlySales": monthly_sales
    }

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the StockFlow API"}

# Simple health check endpoint to verify MongoDB connection
@app.get("/health")
async def health():
    try:
        if not client:
            return {"status": "error", "message": "MongoDB client not initialized"}
            
        # Ping the database
        await client.admin.command('ping')
        
        # Get database stats
        db_stats = await db.command("dbstats")
        
        # Get collection counts
        items_count = await db.items.count_documents({})
        sales_count = await db.sales.count_documents({})
        cashflows_count = await db.cashflows.count_documents({})
        
        return {
            "status": "healthy",
            "mongodb": "connected",
            "database": DATABASE_NAME,
            "collections": {
                "items": items_count,
                "sales": sales_count,
                "cashflows": cashflows_count
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
