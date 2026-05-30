# DriveLegal Server

Dependency-free Node.js REST API for the DriveLegal rule engine.

## Run

```bash
npm run dev
```

The API listens on `http://localhost:4000`.

If port `4000` is already busy, either stop the existing Node process or run with a different port:

```bash
$env:PORT=4001; npm start
```

## MongoDB

Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB Atlas connection string.

When `MONGODB_URI` is present, the server connects to MongoDB, seeds the configured database from the local rule data, and serves catalog reads from MongoDB. If MongoDB is unavailable, it falls back to the in-memory store so the app remains usable.

Check runtime database status:

```bash
GET /api/v1/status
```

Seed the canonical DriveLegal collections from the implementation plan:

```bash
npm run seed:drivelegal
```

The seed command upserts 20 records into each planned collection: `countries`, `jurisdictions`, `vehicleTypes`, `laws`, `violations`, `fineRules`, `challanCalculators`, `legalDocuments`, `users`, and `auditLogs`. Use `npm run seed:drivelegal -- --replace` only when you want those collections cleared before inserting the 20-record seed set.

Demo credentials:

- `driver@drivelegal.in` / `DriveLegal@123`
- `admin@drivelegal.in` / `DriveLegal@123`

## Key Endpoints

- `GET /api/v1/laws`
- `GET /api/v1/traffic-rules`
- `GET /api/v1/violations`
- `POST /api/v1/location/detect`
- `GET /api/v1/fines`
- `POST /api/v1/fines/lookup`
- `GET /api/v1/documents`
- `GET /api/v1/zones/nearby?lat=28.6328&lng=77.2197`
- `POST /api/v1/geo/lookup`
- `POST /api/v1/chat`
- `POST /api/v1/challans/decode`
- `POST /api/v1/challans/calculate`
- `POST /api/v1/compliance/score`
- `POST /api/v1/routes/check`
- `GET /api/docs`

Monitoring and infrastructure items from the brief are intentionally excluded: Winston, Morgan, health checks, Docker, Docker Compose, and Nginx.
