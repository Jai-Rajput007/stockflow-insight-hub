
# StockFlow Backend

This directory contains the backend API and database seeding script for StockFlow.

## Setup and Running

### Prerequisites
- Python 3.7 or higher
- MongoDB Atlas account (or local MongoDB)

### Installation
1. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Backend
1. Start the FastAPI server:
   ```bash
   python main.py
   ```
   Or with uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. The API will be available at: http://localhost:8000

### Populating the Database
To populate the database with sample data:

1. Run the seed script:
   ```bash
   python seed_data.py
   ```

2. This will:
   - Clear existing data in all collections
   - Create 20 inventory items (some with low stock)
   - Create 50 sales records
   - Create 40 cash flow records
   - Display a summary of the database

### API Endpoints
- GET /api/items - Get all inventory items
- POST /api/items - Add a new item
- GET /api/sales - Get all sales
- POST /api/sales - Record a new sale
- GET /api/cashflows - Get all cash flows
- POST /api/cashflows - Add a new cash flow
- GET /api/lowstock - Get low stock items
- GET /api/dashboard - Get dashboard statistics
- GET /health - Check API and database health

### Troubleshooting
- If you encounter connection issues, verify that the MongoDB URI in the `.env` file is correct
- Check that the MongoDB Atlas IP access list includes your IP address
