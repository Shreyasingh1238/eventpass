# EventPass Backend

Node.js + Express + MongoDB backend for auth, events, tickets, QR check-in, admin analytics/export, and optional Razorpay payment flow.

## Run

```bash
npm install
npm run dev
```

## Env

Copy `.env.example` to `.env` and set values.

Required:
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`

Optional:
- `QR_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

