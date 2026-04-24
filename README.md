Here's the deployment checklist:

**Backend Requirements:**

- ✅ Prisma migrations ready (9 migrations included)
- ✅ Admin user seeding script
- ✅ MySQL schema defined
- ⚠️ Need environment variables configured

**Frontend Requirements:**

- Need to build: `pnpm build`
- ⚠️ API endpoint configured to production backend

Let me check if there are any production configurations missing:

Read [](file:///Users/kaleedas/FarmTatva/application/farm-tatva-backend/.env)

Read [](file:///Users/kaleedas/FarmTatva/application/farm-tatva-web-react/src/app/lib/api.ts#1-1), lines 1 to 30

**Deployment Checklist:**

To deploy with a MySQL server, you need to:

### 1. Backend Setup (on server)

```bash
# Clone/push code
cd farm-tatva-backend

# Install dependencies
pnpm install

# Create production .env
cat > .env << EOF
PORT=8000
DATABASE_URL="mysql://farmer:password@your-db-host:3306/farmtatva"
JWT_SECRET="your-secure-random-secret-here"
EOF

# Run migrations
npx prisma migrate deploy

# Seed database (creates admin user)
pnpm run db:seed

# Start server
pnpm start
```

### 2. Frontend Setup (on server or build machine)

```bash
cd farm-tatva-web-react

# Build for production
VITE_API_URL="https://your-backend-domain/api" pnpm build

# Output is in dist/ folder - serve with nginx/vercel/etc
```

### ⚠️ Security Issues to Fix:

1. **JWT_SECRET** - Currently `"supersecret"`. Change to a strong random value:

   ```bash
   openssl rand -base64 32
   ```

2. **Database Password** - Change from `fresh@tomato` in production to `Lkjpoi54321`

3. **CORS** - Check if backend has proper CORS configured for your frontend domain

Let me check the CORS setup:

Read [](file:///Users/kaleedas/FarmTatva/application/farm-tatva-backend/src/app.js#1-1), lines 1 to 20

Update CORS for production:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

### **Quick Deployment Summary:**

✅ **You can deploy!** Just make sure to:

1. Update .env with production values (database URL, JWT_SECRET)
2. Run `npx prisma migrate deploy`
3. Run `pnpm run db:seed` (creates admin user)
4. Build frontend with `VITE_API_URL="your-backend-url/api" pnpm build`
5. Update CORS to only allow your frontend domain
6. Start backend with `pnpm start`

**Default Admin Credentials:**

- Email: `admin@farmtatva.com`
- Password: `admin123`
