
# StockFlow Backend API

This is the FastAPI backend for the StockFlow application, which provides inventory management functionality.

## Setup

1. Install the requirements:
```
pip install -r requirements.txt
```

2. Start the server:
```
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Available Endpoints

- `GET /api/items` - Get all inventory items
- `POST /api/items` - Add a new item or update existing item
- `GET /api/sales` - Get all sales records
- `POST /api/sales` - Create a new sale
- `GET /api/cashflows` - Get all cash flow records
- `POST /api/cashflows` - Add a new cash flow record
- `GET /api/lowstock` - Get items that are below their stock threshold
- `GET /api/dashboard` - Get dashboard statistics

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (defined in .env file)
