# FarmTatva Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with:
   ```
   # Prisma is configured for MySQL (see prisma/schema.prisma)
   # Tip: set a low connection_limit if your MySQL server is small to avoid hitting max connections
   DATABASE_URL="mysql://username:password@localhost:3306/farmtatva?connection_limit=5&pool_timeout=20"
   JWT_SECRET="your-secret-key"
   ```

3. Run database migrations:
   ```bash
    npx prisma migrate dev
   ```

4. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

## Admin User Creation

### Automatic (via seed)
The seed script creates a default admin user:
- Email: `admin@farmtatva.com`
- Password: `admin123`

### Manual Creation
To create additional admin users interactively:
```bash
npm run create-admin
```

This will prompt you for:
- Admin name
- Admin email
- Admin password

## Development

Start the development server:
```bash
npm run dev
```

## Production

Start the production server:
```bash
npm start
```

## Production stability notes

- MySQL connection exhaustion typically shows up as APIs “hanging” while waiting for a DB connection. If you run multiple Node instances, total DB connections = instances × `connection_limit`.
- You can tune server timeouts with:
  - `REQUEST_TIMEOUT_MS` (default `30000`)
  - `KEEP_ALIVE_TIMEOUT_MS` (default `65000`)
  - `HEADERS_TIMEOUT_MS` (default `66000`)
  - `SHUTDOWN_TIMEOUT_MS` (default `15000`)
