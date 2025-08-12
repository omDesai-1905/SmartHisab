# SmartHisab - Digital Ledger Application

A complete digital hisab (accounting ledger) application built with React (Vite) frontend and Node.js backend.

## Features

### Core Functionality

- **User Authentication**: Signup and Login with validation
- **Dashboard**: View all customers with their current balances
- **Customer Management**: Add, edit, and delete customers with name and phone
- **Transaction Management**: Add, edit, and delete debit/credit transactions for each customer
- **Balance Calculation**: Automatic balance calculation with color coding (red/green)
- **Analytics Dashboard**: Comprehensive business analytics with customer insights
- **Cashbook Management**: Separate income and expense tracking system
- **Profile Management**: Update user profile and business information

### Enhanced User Experience

- **Responsive Design**: Modern UI that works on all devices
- **Smart Search Functionality**: Search customers on dashboard and transactions on customer detail pages
- **Sidebar Navigation**: Consistent navigation across all pages with user information
- **Real-time Notifications**: Success and error messages with auto-dismiss
- **Modal Confirmations**: Safe deletion with confirmation dialogs
- **Icon-free Analytics**: Clean analytics interface with gradient backgrounds
- **Loading States**: Visual feedback during data operations

## Tech Stack

### Frontend

- React 19.1.0 (Latest version)
- Vite 7.0.4 (Fast build tool)
- React Router DOM 7.8.0 (Client-side routing)
- Axios 1.11.0 (HTTP client)
- TailwindCSS 4.1.11 (Utility-first CSS)
- Modern CSS with responsive design

### Backend

- Node.js (Latest)
- Express.js 4.18.2
- MongoDB with Mongoose 7.8.7
- JWT Authentication 9.0.2
- bcryptjs 2.4.3 (Password hashing)
- CORS 2.8.5 (Cross-origin resource sharing)

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

## Usage - Step by Step Application Flow

### 1. User Registration (Signup Page)

- Create a new account with required information:
  - Full Name (3+ characters)
  - Email Address (valid email format)
  - Mobile Number (10 digits)
  - Password (6+ characters)
  - Confirm Password
- Form validation ensures all fields are properly filled
- Successful registration redirects to login page

### 2. User Authentication (Login Page)

- Sign in with your registered credentials:
  - Email Address
  - Password
- JWT token authentication for secure sessions
- Successful login redirects to dashboard

### 3. Dashboard (Main Customer Overview)

- View all your customers with their current balances
- **Search Functionality**: Find customers by name or phone using the search bar
- **Color-coded Balances**:
  - Green: Customer owes you money (you will get)
  - Red: You owe customer money (you will give)
  - Black: No outstanding balance
- **Quick Actions**:
  - Add New Customer
  - View Analytics
  - Click customer name to view transaction details

### 4. Customer Management

- **Add Customer**: Create new customer with name and phone validation
- **Edit Customer**: Modify customer information using edit button
- **Delete Customer**: Remove customer and all associated transactions (with confirmation)
- **Customer Search**: Real-time search through customer list

### 5. Customer Details & Transaction Management

- **View Transaction History**: See all transactions for selected customer
- **Search Transactions**: Find transactions by description or type
- **Add Transactions**:
  - Debit: Money you gave to customer
  - Credit: Money customer gave to you
- **Transaction Details**: Amount, description, date selection
- **Edit/Delete Transactions**: Modify or remove with validation and confirmations
- **Real-time Balance**: Automatic calculation based on all transactions

### 6. Analytics Dashboard

- **Business Overview**:
  - Total number of customers
  - Total debit and credit amounts
  - Net balance calculation
- **Customer Analytics**:
  - Top customers you owe money to
  - Top customers who owe you money
- **Monthly Summary**: Current month financial overview
- **Visual Interface**: Clean gradient design without icons

### 7. Cashbook Management

- **Navigate to Cashbook**: Access via sidebar navigation
- **Income Tracking**:
  - Add income entries with amount, description, date
  - View monthly income totals
- **Expense Management**:
  - Record expenses with detailed descriptions
  - Track monthly spending patterns
- **Summary Cards**: Visual overview of income, expenses, and net balance
- **Edit/Delete Entries**: Full CRUD operations with confirmations
- **Separate System**: Independent from customer transactions

### 8. Profile Management

- **View Profile**: Display user information and business details
- **Edit Profile**: Update business name
- **Account Settings**: Manage account information
- **Logout**: Secure session termination

## API Endpoints

### Authentication

- `POST /api/signup` - User registration with validation
- `POST /api/login` - User authentication
- `GET /api/verify-token` - Token verification
- `PUT /api/profile` - Update user profile

### Customers

- `GET /api/customers` - Get all customers with calculated balances
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer information
- `DELETE /api/customers/:id` - Delete customer and all transactions
- `GET /api/customers/analytics` - Get business analytics data

### Transactions

- `GET /api/customers/:id/transactions` - Get customer transaction history
- `POST /api/customers/:id/transactions` - Add new transaction
- `PUT /api/customers/:id/transactions/:transactionId` - Update transaction
- `DELETE /api/customers/:id/transactions/:transactionId` - Delete transaction

### Cashbook

- `GET /api/cashbook` - Get all cashbook entries
- `POST /api/cashbook` - Create new cashbook entry
- `PUT /api/cashbook/:id` - Update cashbook entry
- `DELETE /api/cashbook/:id` - Delete cashbook entry

## Recent Updates & Improvements

### UI/UX Enhancements

- **Search Bar Relocation**: Moved search functionality from sidebar to main content areas for better accessibility
- **Icon Removal**: Cleaned up Analytics page by removing all emoji icons while preserving gradient backgrounds
- **Consistent Navigation**: Implemented unified sidebar navigation across all pages
- **Gradient to Solid Colors**: Converted linear gradients to solid colors throughout the application (except Analytics page)

### Functionality Improvements

- **Enhanced Search**: Added search functionality to both Dashboard (customer search) and Customer Detail pages (transaction search)
- **Better User Experience**: Improved form validations, error handling, and user feedback
- **Profile Updates**: Added business name editing capability in user profile
- **Transaction Management**: Enhanced transaction editing and deletion with proper confirmations

### Technical Updates

- **React 19.1.0**: Updated to latest React version
- **Vite 7.0.4**: Using latest Vite for improved development experience
- **TailwindCSS Integration**: Added TailwindCSS for better styling capabilities
- **Code Quality**: Implemented ESLint for code quality and consistency

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
