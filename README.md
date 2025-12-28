# Nursing Voice - Premium Awareness Platform

A premium, modern platform for nursing trainees to learn about their rights, share experiences anonymously, and access support resources.

## Features

* **Premium Design**: Glassmorphism effects, animated backgrounds, and smooth transitions
* **Anonymous Voice**: Share experiences safely and anonymously
* **Rights & Guidance**: Learn about your legal rights as a nursing trainee
* **Contact & Support**: Form to contact training institutions when rights are not respected
* **How It Works**: Interactive timeline showing the three-step process
* **Articles & Resources**: Educational content and guidance
* **Admin Panel**: Moderation system for anonymous voices

## Tech Stack

* Next.js 14 (App Router)
* TypeScript
* TailwindCSS
* React 18
* Framer Motion (animations)
* Lucide React (icons)
* Prisma (database ORM)
* SQLite (local) / PostgreSQL/MySQL (production)

## Getting Started

### Prerequisites

* Node.js 18+ installed
* npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tahaneffai/azubistimme-pflege.git
cd azubistimme-pflege
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Option 1: Run the setup script (recommended)
node scripts/setup-env.js

# Option 2: Manually create .env.local file
# Copy .env.example to .env.local and update values
```

The `.env.local` file should contain:
```env
DATABASE_URL="file:./prisma/dev.db"
ADMIN_PASSWORD=12345678
ADMIN_SECRET=change-this-to-a-random-secret-in-production
```

**Important**: The `DATABASE_URL` environment variable is required. If it's not set, the application will use a default value in development, but Prisma requires it to be explicitly set.

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

**⚠️ Important**: SQLite file-based storage does NOT work on Vercel's serverless functions. You must use a serverless database.

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Vercel Setup:

1. **Choose a database** (Vercel Postgres, Turso, or PlanetScale)
2. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL` - Your database connection string
   - `ADMIN_PASSWORD` - Default admin password (optional)
   - `ADMIN_SECRET` - Secret for session cookies (required)
3. **Deploy**: Push to GitHub and Vercel will auto-deploy

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── voices/       # Public voices API
│   │   └── admin/        # Admin API (protected)
│   ├── admin/            # Admin dashboard pages
│   ├── voices/           # Anonymous voices page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   ├── admin/            # Admin components
│   ├── Hero.tsx          # Hero section
│   ├── Navbar.tsx        # Navigation
│   └── ...               # Other components
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── db-utils.ts       # Database utilities
│   └── admin-auth.ts     # Admin authentication
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── middleware.ts         # Next.js middleware
```

## Design

The website features a premium, modern healthcare-focused design with:

* Dark green gradient backgrounds (#0F2D22 to #335842)
* Gold accents (#C7AB50)
* Off-white text (#F4F5F4)
* Glassmorphism effects with backdrop blur
* Animated floating blobs and particles
* Subtle grain overlay
* Smooth scroll animations
* Hover micro-interactions
* Responsive design for mobile and desktop

## Admin Access

1. Click the Shield icon in the navbar
2. Enter default password: `13121312`
3. Access the admin dashboard to moderate voices

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for more details.

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | `file:./prisma/dev.db` (local) |
| `ADMIN_PASSWORD` | Default admin password | No | `13121312` |
| `ADMIN_SECRET` | Secret for session cookies | Yes (prod) | `default-secret-change-in-production` |
| `NODE_ENV` | Node environment | No | `development` |

## License

This project is created for educational and awareness purposes.

## About

Live at: [azubistimme-pflege.vercel.app](https://azubistimme-pflege.vercel.app)
