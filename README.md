# SmartHisab - Digital Ledger Application

A complete digital hisab (accounting ledger) application built with React (Vite) frontend and Node.js backend.

## Features

- **User Authentication**: Signup and Login with validation
- **Dashboard**: View all customers with their current balances
- **Customer Management**: Add new customers with name and phone
- **Transaction Management**: Add debit/credit transactions for each customer
- **Balance Calculation**: Automatic balance calculation with color coding (red/green)
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Axios
- Modern CSS with responsive design

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites

1. Node.js (v14 or higher)
2. MongoDB (local installation or MongoDB Atlas)

### Backend Setup

1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure MongoDB is running on your system
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## Usage

1. **Signup**: Create a new account with name, email, and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: View all your customers and their balances
4. **Add Customer**: Click "Add New Customer" to create a new customer
5. **Customer Details**: Click on any customer name to view their transactions
6. **Add Transactions**: Use the Debit/Credit buttons to add new transactions

## API Endpoints

### Authentication

- `POST /api/signup` - User registration
- `POST /api/login` - User login

### Customers

- `GET /api/customers` - Get all customers with balances
- `POST /api/customers` - Create new customer

### Transactions

- `GET /api/customers/:id/transactions` - Get customer transactions
- `POST /api/customers/:id/transactions` - Add new transaction

## Color Coding

- **Green**: Positive balance (You will get money)
- **Red**: Negative balance (You will give money)
- **Black**: Zero balance

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes
- Input validation
- CORS enabled

## Development

For development, you can use:

- Backend: `npm run dev` (uses nodemon for auto-restart)
- Frontend: `npm run dev` (Vite dev server with hot reload)

## Note

Make sure MongoDB is running before starting the backend server. If you don't have MongoDB installed locally, you can:

1. Install MongoDB Community Edition
2. Use MongoDB Atlas (cloud)
3. Use Docker: `docker run -d -p 27017:27017 mongo`
