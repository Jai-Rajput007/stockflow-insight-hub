
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from bson import ObjectId
from fastapi.encoders import jsonable_encoder

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
MONGODB_URI = "mongodb+srv://jaisrajputdev:JHyuuDEj6mpf4X7C@stockflow.saaoepn.mongodb.net/?retryWrites=true&w=majority&appName=Stockflow"
client = AsyncIOMotorClient(MONGODB_URI)
db = client.stockflow  # Database name

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
    items = await db.items.find().to_list(1000)
    return [fix_id(item) for item in items]

@app.post("/api/items", response_model=Item)
async def add_item(item: ItemBase):
    # Check if item exists
    existing_item = await db.items.find_one({
        "name": item.name,
        "brand": item.brand,
        "type": item.type
    })
    
    now = datetime.now().isoformat()
    
    if existing_item:
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
    sales = await db.sales.find().sort("saleDate", -1).to_list(1000)
    return [fix_id(sale) for sale in sales]

@app.post("/api/sales", response_model=Sale)
async def add_sale(sale: SaleBase):
    # Find the item
    item = await db.items.find_one({"_id": ObjectId(sale.itemId)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item["quantity"] < sale.quantity:
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
    cashflows = await db.cashflows.find().sort("date", -1).to_list(1000)
    return [fix_id(cf) for cf in cashflows]

@app.post("/api/cashflows", response_model=CashFlow)
async def add_cash_flow(cashflow: CashFlowBase):
    new_cashflow = cashflow.dict()
    new_cashflow["date"] = datetime.now().isoformat()
    
    result = await db.cashflows.insert_one(new_cashflow)
    created_cashflow = await db.cashflows.find_one({"_id": result.inserted_id})
    return fix_id(created_cashflow)

# Low Stock Items
@app.get("/api/lowstock", response_model=List[Item])
async def get_low_stock_items():
    pipeline = [
        {"$match": {"$expr": {"$lt": ["$quantity", "$lowStockThreshold"]}}},
    ]
    low_stock_items = await db.items.aggregate(pipeline).to_list(1000)
    return [fix_id(item) for item in low_stock_items]

# Dashboard stats
@app.get("/api/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
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
    
    # Mock monthly sales data (in a real app, this would use aggregation)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
