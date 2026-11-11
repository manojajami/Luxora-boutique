# LUXORA – Boutique

A full-stack luxury fashion e-commerce website built with React, Node.js, Express and MongoDB.

## About

LUXORA is a MERN-stack boutique store, built as a learning project to practise real full-stack development: a React frontend talking to a REST API backed by MongoDB.

## Features

- Responsive homepage with a hero banner, curated collection, promotional banner, benefits strip and newsletter section
- Product catalogue with category, size and price filters, sorting and search
- User registration and login with JWT stored in secure HTTP-only cookies, and passwords hashed with bcrypt
- Shopping cart with size and colour selection, saved to the user's account
- Wishlist saved to the user's account
- Checkout with Cash on Delivery and coupon codes; the server recalculates all prices, discounts and shipping, so totals can't be changed from the browser
- Order history with order cancellation and stock restocking
- Admin dashboard with total orders, customers, products, revenue, monthly revenue, low-stock alerts, order status updates and product management
- Database seed script with 16 demo products, a demo coupon and an admin account

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios, Lucide icons, custom CSS |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose (aggregation pipelines for the dashboard) |
| Security | JWT, bcryptjs, HTTP-only cookies, protected and admin-only routes |

## Getting Started

1. Clone the repository and install everything:

   ```bash
   npm run setup
   ```

2. Copy `backend/.env.example` to `backend/.env` and fill in your MongoDB URI, JWT secret and admin login.

3. Add the demo data:

   ```bash
   npm run seed
   ```

4. Start the project:

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173

## Author

Designed and developed by **Manoja**, B.Tech Computer Science and Engineering student at Pragati Engineering College.

- GitHub: [manojajami](https://github.com/manojajami)
- LinkedIn: [Manoja Jami](https://www.linkedin.com/in/manojajami-3b1004380/)