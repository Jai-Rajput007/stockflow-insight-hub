
"""
Script to seed the MongoDB database with sample data for all collections.
This will populate data for all pages of the StockFlow application.
"""

import asyncio
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB connection info
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "stockflow")

# Create data generators
def generate_items(n=20):
    """Generate sample items"""
    categories = ["Clothing", "Electronics", "Home", "Books", "Beauty", "Food", "Toys"]
    brands = ["TopBrand", "Quality Co", "Premium", "Standard", "Luxury", "Basic", "Elite"]
    
    items = []
    for i in range(1, n+1):
        category = random.choice(categories)
        item_type = {
            "Clothing": ["T-Shirt", "Jeans", "Hoodie", "Jacket", "Socks", "Hat"],
            "Electronics": ["Phone", "Laptop", "Tablet", "Headphones", "Speaker", "Charger"],
            "Home": ["Pillow", "Lamp", "Vase", "Frame", "Candle", "Rug"],
            "Books": ["Fiction", "Non-Fiction", "Biography", "Cookbook", "Self-Help"],
            "Beauty": ["Shampoo", "Lotion", "Cream", "Perfume", "Makeup"],
            "Food": ["Snack", "Cereal", "Coffee", "Tea", "Spices"],
            "Toys": ["Doll", "Car", "Puzzle", "Game", "Blocks"]
        }[category]
        
        quantity = random.randint(1, 100)
        threshold = random.randint(5, 20)
        
        # Ensure some items have low stock for testing notifications
        if i % 5 == 0:
            quantity = random.randint(1, threshold - 1)
            
        items.append({
            "name": f"{random.choice(item_type)} {i}",
            "brand": f"{random.choice(brands)}",
            "type": category,
            "quantity": quantity,
            "lowStockThreshold": threshold,
            "createdAt": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
            "updatedAt": datetime.now().isoformat()
        })
    
    return items

def generate_sales(items, n=50):
    """Generate sample sales based on items"""
    sales = []
    
    for i in range(n):
        item = random.choice(items)
        item_id = str(item["_id"])
        quantity = random.randint(1, 5)
        price = random.uniform(9.99, 99.99)
        days_ago = random.randint(0, 180)  # Sales over past 6 months
        
        sales.append({
            "itemId": item_id,
            "itemName": item["name"],
            "quantity": quantity,
            "total": round(quantity * price, 2),
            "saleDate": (datetime.now() - timedelta(days=days_ago)).isoformat()
        })
    
    return sales

def generate_cashflows(n=40):
    """Generate sample cash flows"""
    inflow_descriptions = [
        "Sales revenue", "Investment", "Refund", "Online orders",
        "Wholesale purchase", "Business loan", "Tax refund"
    ]
    
    outflow_descriptions = [
        "Rent", "Utilities", "Salaries", "Inventory purchase", 
        "Equipment", "Marketing", "Insurance", "Maintenance"
    ]
    
    cashflows = []
    
    for i in range(n):
        is_inflow = random.choice([True, False])
        descriptions = inflow_descriptions if is_inflow else outflow_descriptions
        amount = round(random.uniform(100, 5000), 2)
        days_ago = random.randint(0, 180)  # Cash flows over past 6 months
        
        cashflows.append({
            "description": random.choice(descriptions),
            "amount": amount,
            "isInflow": is_inflow,
            "date": (datetime.now() - timedelta(days=days_ago)).isoformat()
        })
    
    return cashflows

async def seed_database():
    """Main function to seed the database with sample data"""
    try:
        # Connect to MongoDB
        logger.info(f"Connecting to MongoDB: {MONGODB_URI}")
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        
        # Force connection
        await client.server_info()
        logger.info("Successfully connected to MongoDB")
        
        # Get database
        db = client[DATABASE_NAME]
        logger.info(f"Using database: {DATABASE_NAME}")
        
        # Check existing collections
        collections = await db.list_collection_names()
        logger.info(f"Existing collections: {collections}")
        
        # Clear existing data
        if "items" in collections:
            await db.items.delete_many({})
            logger.info("Cleared items collection")
        else:
            await db.create_collection("items")
            logger.info("Created items collection")
            
        if "sales" in collections:
            await db.sales.delete_many({})
            logger.info("Cleared sales collection")
        else:
            await db.create_collection("sales")
            logger.info("Created sales collection")
            
        if "cashflows" in collections:
            await db.cashflows.delete_many({})
            logger.info("Cleared cashflows collection")
        else:
            await db.create_collection("cashflows")
            logger.info("Created cashflows collection")
        
        # Generate and insert items
        items_data = generate_items(20)
        result = await db.items.insert_many(items_data)
        logger.info(f"Inserted {len(result.inserted_ids)} items")
        
        # Fetch inserted items to use their IDs for sales
        items = await db.items.find().to_list(100)
        
        # Generate and insert sales
        sales_data = generate_sales(items, 50)
        result = await db.sales.insert_many(sales_data)
        logger.info(f"Inserted {len(result.inserted_ids)} sales")
        
        # Generate and insert cash flows
        cashflow_data = generate_cashflows(40)
        result = await db.cashflows.insert_many(cashflow_data)
        logger.info(f"Inserted {len(result.inserted_ids)} cash flows")
        
        logger.info("Database seeding complete!")
        
        # Display some summary statistics
        logger.info("\n--- Database Summary ---")
        logger.info(f"Items: {await db.items.count_documents({})}")
        logger.info(f"Sales: {await db.sales.count_documents({})}")
        logger.info(f"Cash Flows: {await db.cashflows.count_documents({})}")
        logger.info("----------------------\n")
        
        # Display connection string for users
        masked_uri = MONGODB_URI.replace(MONGODB_URI.split('@')[0], "mongodb+srv://[username]:[password]")
        logger.info(f"Your MongoDB is now populated at: {masked_uri}")
        logger.info(f"Database name: {DATABASE_NAME}")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        if 'client' in locals():
            client.close()
            logger.info("MongoDB connection closed")

if __name__ == "__main__":
    # Run the async function
    asyncio.run(seed_database())
