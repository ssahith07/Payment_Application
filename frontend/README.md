
# Payment App Frontend

This is the frontend for the Payment App, built with React, Tailwind CSS, and shadcn UI components.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

Before running the app, you need to replace all occurrences of `YOUR_BACKEND_URL` with the actual URL of your backend API. For example:

```javascript
// Before
const response = await fetch('YOUR_BACKEND_URL/api/auth/login', ...);

// After
const response = await fetch('http://localhost:5000/api/auth/login', ...);
```

## Features

- User authentication (login/signup)
- Dashboard with account balance
- Send money to contacts
- View transaction history
- User profile management

## Technologies Used

- React
- React Router
- Tailwind CSS
- shadcn UI components
- React Query for data fetching
