# Database Setup Instructions

## Local Development Setup

1. **Update Database Credentials**
   - Replace `YOUR_ACTUAL_PASSWORD` in the `.env` file with your actual Supabase database password
   - The password can be found in your Supabase project: Settings → Database

2. **Environment Variables**
   Update `.env` file:

   ```
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.ajmydfeuebvdomaizywz.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.ajmydfeuebvdomaizywz.supabase.co:5432/postgres"
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Production Setup (Vercel)

Add these environment variables in Vercel dashboard:

```
DATABASE_URL = postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.ajmydfeuebvdomaizywz.supabase.co:5432/postgres
NEXTAUTH_SECRET = uMzNszfXWaj2KL1yqWe0tzLJd5ftm3DTwPiNAOChlFw=
NEXTAUTH_URL = https://cinifob-x9gt.vercel.app
TMDB_API_KEY = 4b2d7f043029d0e91365e363cd5c1c1f
TMDB_API_URL = https://api.themoviedb.org/3
```

## Important Notes

- Never commit real passwords to version control
- The database password must match your Supabase project's actual password
- After updating environment variables in Vercel, redeploy the application
