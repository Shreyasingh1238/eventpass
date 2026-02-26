# EventPass Pro Frontend

React (Vite) frontend for Virtual Event Ticketing and QR Check-In, connected to the backend API.

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios (API integration)
- Recharts
- React Hot Toast

## Run

```bash
npm install
npm run dev
```

## Notes

- Configure API URL with `.env`:
  - `VITE_API_BASE_URL=http://localhost:5000/api`
- Auth uses HTTP-only cookies from backend.
- Routes include landing, auth, events, dashboard, QR view, scanner, admin, contact, and terms pages.
