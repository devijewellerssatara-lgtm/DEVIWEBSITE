Rates API (PostgreSQL + Express)

Setup
1) Create a PostgreSQL database and obtain a connection string.
2) Copy .env.example to .env and set DATABASE_URL. If your provider requires SSL, set PGSSLMODE=require.
3) Install dependencies:
   cd server
   npm install
4) Start the API:
   npm run dev

Endpoints
- GET /api/rates
  Returns the current rates record:
  {
    "vedhani": number | null,
    "ornaments22k": number | null,
    "ornaments18k": number | null,
    "silver": number | null,
    "updated_at": string
  }

- POST /api/rates
  Body:
  {
    "vedhani": number,
    "ornaments22K": number,
    "ornaments18K": number,
    "silver": number
  }
  Note: ornaments22K/ornaments18K are also accepted as ornaments22k/ornaments18k.

Frontend Dev
The React app proxies API calls to http://localhost:5000 (see package.json "proxy").
Run both:
- In /server: npm run dev
- In project root: npm start

Database Schema
The server will auto-create a single-row table named rates if it does not exist. You can also run:
  psql "$DATABASE_URL" -f sql/init.sql