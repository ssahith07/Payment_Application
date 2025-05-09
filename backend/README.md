
# Payment App Backend

This is the backend API for the Payment App, built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Create a `.env` file based on the provided `.env.example`
- Set your MongoDB connection string, JWT secret, and other configuration

3. Start the development server:
```bash
npm run dev
```

4. Start for production:
```bash
npm start
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get current user profile (requires authentication)

### Users
- `GET /api/users` - Get all users (requires authentication)

### Transactions
- `POST /api/transfer` - Transfer money to another user (requires authentication)
- `GET /api/transactions` - Get user's transactions (requires authentication)
- `GET /api/balance` - Get user's balance (requires authentication)

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
