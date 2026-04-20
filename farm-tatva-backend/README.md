# FarmTatva Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/farmtatva"
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