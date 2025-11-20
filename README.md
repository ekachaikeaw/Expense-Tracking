# Expense Tracking API

A REST API for personal expense management built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 JWT-based Authentication
- 💰 Multi-account management (Cash, Bank, Credit Card, E-Wallet)
- 📊 Transaction recording with image attachments
- 📈 Monthly summaries and category-based reports
- 🏷️ Income and expense category management

## Tech Stack

- **Backend**: Node.js v22.18.0, Express v5.1.0
- **Database**: PostgreSQL (via Drizzle ORM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **Language**: TypeScript

## Installation

### Prerequisites

- Node.js v22.18.0 or higher
- PostgreSQL
- npm or yarn

### Setup Instructions

1. Clone the repository

```bash
git clone <repository-url>
cd Expense-Tracking
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory

```env
PORT=3000
DB_URL=postgresql://username:password@localhost:5432/expense_db
JWT_SECRET=your-secret-key-here
```

4. Generate and migrate database schema

```bash
npm run generate
npm run migrate
```

5. Start the server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## API Documentation

### Authentication

#### Register
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "token": "jwt-token",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Accounts (Authorization Required)

#### Create Account
```http
POST /accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Main Wallet",
  "type": "cash",
  "balance": "10000.00"
}
```

**Account Types**: `cash`, `bank`, `credit_card`, `e_wallet`

#### Delete Account
```http
DELETE /accounts/:id
Authorization: Bearer <token>
```

### Categories (Authorization Required)

#### Create Category
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Food",
  "type": "expense"
}
```

**Category Types**: `income`, `expense`

#### Delete Category
```http
DELETE /categories/:id
Authorization: Bearer <token>
```

### Transactions (Authorization Required)

#### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "accountId": "1",
  "categoryId": "1",
  "transactionType": "expense",
  "amount": "500.00",
  "transactionDate": "2024-01-15",
  "transactionTime": "14:30:00",
  "note": "Lunch expense",
  "referenceNumber": "REF001",
  "attachment": <file>
}
```

**Transaction Types**: `income`, `expense`, `transfer`

#### Get Monthly Summary
```http
GET /transactions/monthly-summary
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "month": "2024-01",
    "transactionType": "income",
    "total": "50000.00"
  },
  {
    "month": "2024-01",
    "transactionType": "expense",
    "total": "25000.00"
  }
]
```

#### Get Categories Summary
```http
GET /transactions/categories-summary?type=expense
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "categoryName": "Food",
    "total": "5000.00"
  },
  {
    "categoryName": "Transportation",
    "total": "3000.00"
  }
]
```

#### Get Custom Transaction Summary
```http
GET /transactions/summary?year=2024&month=1&transactionType=expense&accountId=1
Authorization: Bearer <token>
```

**Query Parameters:**
- `year`: Year (optional)
- `month`: Month (optional)
- `transactionType`: Transaction type (optional)
- `accountId`: Account ID (optional)

**Response:**
```json
{
  "summary": [
    {
      "categoryName": "Food",
      "total": "5000.00"
    }
  ],
  "total": "5000.00"
}
```

#### Get All Transactions (Paginated)
```http
POST /transactions/summary2
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2024,
  "month": 1,
  "categoryId": 1,
  "accountId": 1,
  "page": 1,
  "perPage": 10
}
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Database Schema

### Users
- id (UUID, Primary Key)
- email (Unique)
- hashed_password
- created_at, updated_at

### Accounts
- id (Serial, Primary Key)
- user_id (Foreign Key → Users)
- name
- type (cash, bank, credit_card, e_wallet)
- balance
- is_active
- created_at, updated_at

### Categories
- id (Serial, Primary Key)
- name
- type (income, expense)
- parent_category_id (Self-referencing)
- is_active
- created_at, updated_at

### Transactions
- id (Serial, Primary Key)
- account_id (Foreign Key → Accounts)
- category_id (Foreign Key → Categories)
- transaction_type (income, expense, transfer)
- amount
- transaction_date
- transaction_time
- note
- reference_number
- created_at, updated_at

### Transaction Attachments
- id (Serial, Primary Key)
- transaction_id (Foreign Key → Transactions)
- file_name
- file_path
- file_type
- file_size
- uploaded_at

## File Storage

Uploaded files are stored in `public/uploads/` directory with auto-generated filenames to prevent conflicts.

**File Requirements:**
- Types: JPEG, JPG, PNG, GIF
- Maximum size: 5MB

## Error Handling

The API returns the following HTTP status codes:

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (Invalid data)
- `401` - Unauthorized (No access rights)
- `403` - Forbidden (Access denied)
- `404` - Not Found (Resource not found)
- `500` - Internal Server Error

**Example Error Response:**
```json
{
  "error": "Invalid email or password"
}
```

## Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm start

# Generate database migration files
npm run generate

# Run database migrations
npm run migrate
```

## Security Features

- Passwords are encrypted using bcrypt
- Authentication via JWT tokens
- JWT expires after 1 hour (configurable in config)
- File uploads are restricted by type and size

## Project Structure

```
Expense-Tracking/
├── src/
│   ├── configs/         # Configuration files
│   ├── controllers/     # Request handlers
│   ├── db/             # Database schema and migrations
│   ├── middlewares/    # Express middlewares
│   ├── repositories/   # Data access layer
│   ├── services/       # Business logic layer
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── config.ts       # Application configuration
│   └── index.ts        # Application entry point
├── public/             # Static files and uploads
├── .env                # Environment variables
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DB_URL | PostgreSQL connection string | postgresql://user:pass@localhost:5432/db |
| JWT_SECRET | Secret key for JWT signing | your-secret-key |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Author

Ekachaikeaw

---

**Note**: Make sure to change `JWT_SECRET` and database credentials in `.env` file for security purposes.