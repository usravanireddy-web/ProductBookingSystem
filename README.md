# Product Booking & Stock Workflow

React and Express/MongoDB application for creating a product booking, allocating its required quantity, manufacturing it once, and adding that quantity to stock.

## Run locally

1. Start MongoDB locally (or use a MongoDB Atlas connection string).
2. Copy `Backend/.env.example` to `Backend/.env` and set `MONGO_URI` and `JWT_SECRET`.
3. In `Backend`, run `npm install` then `npm run dev`.
4. In `Frontend`, run `npm install` then `npm run dev`.
5. Open the address shown by Vite (normally `http://localhost:5173`).

Login: `admin` / `admin123` (override with `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`).

The backend seeds `PROD-001` / Product A and `PROD-002` / Product B, each with zero stock.

## Workflow and API

All endpoints except `POST /api/login` require `Authorization: Bearer <token>`.

- `POST /api/login`
- `POST /api/users` (admin only; creates another login account)
- `GET /api/products`
- `GET, POST /api/bookings`
- `POST /api/bookings/:id/allocate`
- `POST /api/bookings/:id/manufacture`
- `GET /api/stock-inventory`
- `GET /api/booking-history` (optionally pass `?bookingId=<bookingMongoId>`)

Partial allocations keep a booking **Open**. Once allocation equals the required quantity it becomes **Allocated**. Manufacture records the **Manufactured** and **Complete** transitions in its persisted audit history, marks the booking Complete, and atomically prevents a second manufacture action. The UI disables an action while its request is pending.
