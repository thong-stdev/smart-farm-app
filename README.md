# Smart Farm Management & Shop Platform

## 🌾 Project Overview

A comprehensive farm management platform built with Next.js 16 that supports both web and LINE LIFF (mobile) interfaces. The system enables farmers to manage their plots, track planting cycles, log activities, and monitor costs/income, while admins can oversee all farms and manage master data.

## 📋 Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Auth.js v5 (NextAuth)
  - Credentials (Username/Password)
  - LINE OAuth
  - Google OAuth
  - Facebook OAuth
- **UI:** Tailwind CSS + Shadcn/ui
- **Maps:** Leaflet (OpenStreetMap)
- **Image Upload:** Ready for Cloudinary integration

## 🗂️ Project Structure

```
Farm_Store/
├── actions/                    # Server Actions
│   ├── plot-actions.ts        # Plot CRUD operations
│   ├── cycle-actions.ts       # Planting cycle management
│   ├── activity-actions.ts    # Activity log operations
│   └── admin-actions.ts       # Admin management functions
├── app/
│   ├── (auth)/                # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (user)/                # Farmer routes (mobile-first)
│   │   ├── dashboard/
│   │   └── plots/
│   │       ├── page.tsx       # Plot list
│   │       ├── [id]/page.tsx  # Plot detail
│   │       ├── new/page.tsx   # Create plot
│   │       └── [id]/
│   │           ├── add-activity/
│   │           ├── start-cycle/
│   │           └── history/
│   ├── (admin)/               # Admin routes (web dashboard)
│   │   ├── dashboard/
│   │   ├── surveillance/      # Map view of all plots
│   │   └── master-data/
│   │       ├── crops/
│   │       ├── varieties/
│   │       └── templates/
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx             # Root layout with LIFF SDK
│   └── globals.css
├── components/
│   ├── ui/                    # Shadcn/ui components
│   ├── liff-provider.tsx      # LIFF context provider
│   ├── map-picker.tsx         # GPS coordinate picker
│   ├── plot-form.tsx          # Plot creation form
│   ├── cycle-card.tsx         # Active cycle display
│   ├── activity-form.tsx      # Activity log form
│   └── activity-list.tsx      # Activity list view
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── liff.ts                # LIFF utility functions
│   └── utils.ts               # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
├── auth.ts                    # Auth.js configuration
├── middleware.ts              # Route protection
├── .env.example               # Environment variables template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🗄️ Database Schema

### Core Concepts

1. **User** - Farmers and Admins with role-based access
2. **Plot** - Land parcels with GPS coordinates and size
3. **PlantingCycle** - Temporal tracking of crops (ACTIVE/COMPLETED/ABANDONED)
4. **Activity** - Individual tasks/events within a cycle
5. **CropType & CropVariety** - Master data for crop classification
6. **StandardPlan & PlanTask** - Templates for planting schedules

### Key Relationships

- One Plot can have **multiple cycles** (history), but only **one ACTIVE cycle**
- Activities are always linked to a **PlantingCycle**, not directly to Plot
- Each cycle references a **CropVariety** and optionally a **StandardPlan**
- Cascading deletes ensure data integrity

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- LINE Developers account (for LIFF)
- Google/Facebook OAuth apps (optional)

### 2. Installation

```bash
# Clone or navigate to project directory
cd d:/Dev/Learning/Farm_Store

# Install dependencies
npm install

# Copy environment template
copy .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart_farm?schema=public"

# Auth.js
AUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# LINE OAuth
AUTH_LINE_ID="your-line-channel-id"
AUTH_LINE_SECRET="your-line-channel-secret"

# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Facebook OAuth
AUTH_FACEBOOK_ID="your-facebook-app-id"
AUTH_FACEBOOK_SECRET="your-facebook-app-secret"

# LINE LIFF
NEXT_PUBLIC_LIFF_ID="your-liff-app-id"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed master data (optional)
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔐 Authentication

### Providers Configured

1. **Credentials** - Username/Password with bcrypt hashing
2. **LINE** - Auto-login in LIFF browser
3. **Google** - Standard OAuth flow
4. **Facebook** - Standard OAuth flow

### User Roles

- **FARMER** (default) - Access to plot management
- **ADMIN** - Access to admin dashboard and master data

### Route Protection

Middleware automatically redirects:
- Unauthenticated users to `/login`
- Non-admin users away from `/admin/*`
- Authenticated users away from auth pages

## 📱 LINE LIFF Integration

### Setup Steps

1. Create a LINE Login channel at [LINE Developers Console](https://developers.line.biz/)
2. Create a LIFF app in your channel
3. Set LIFF Endpoint URL to your deployment URL
4. Copy LIFF ID to `.env` as `NEXT_PUBLIC_LIFF_ID`
5. Configure OAuth redirect URL in LINE console

### LIFF Features Implemented

- Auto-initialization on page load
- Profile fetching for LINE users
- Conditional rendering based on LIFF context
- Mobile-optimized UI for LIFF browser

### Usage in Components

```tsx
import { useLiff } from '@/components/liff-provider'

function MyComponent() {
  const { isLiff, isLoggedIn, profile } = useLiff()
  
  if (isLiff && profile) {
    return <div>Welcome, {profile.displayName}!</div>
  }
  
  return <div>Web version</div>
}
```

## 🗺️ Maps Integration

### Current: Leaflet (OpenStreetMap)

- Free and open-source
- No API key required
- Included in `map-picker.tsx` component

### Alternative: Google Maps

1. Get API key from Google Cloud Console
2. Add to `.env` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Replace Leaflet component with `@react-google-maps/api`

## 📸 Image Upload

### Current Implementation

- Placeholder for local/cloud storage
- `images` field in Activity model (string array)

### Cloudinary Integration (Recommended)

1. Create Cloudinary account
2. Add credentials to `.env`
3. Install: `npm install cloudinary`
4. Create upload API route:

```typescript
// app/api/upload/route.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file, {
    folder: 'farm-activities',
  })
  
  return Response.json({ url: result.secure_url })
}
```

## 📊 Key Server Actions

### Plot Management

```typescript
import { createPlot, getPlotsByUser, getPlotWithActiveCycle } from '@/actions/plot-actions'

// Create plot
await createPlot({
  name: "Rice Field #1",
  sizeRai: 5,
  latitude: 13.7563,
  longitude: 100.5018,
})

// Get user's plots
const plots = await getPlotsByUser()

// Get plot with active cycle and activities
const plot = await getPlotWithActiveCycle(plotId)
```

### Planting Cycle

```typescript
import { startPlantingCycle, completeCycle } from '@/actions/cycle-actions'

// Start new cycle
await startPlantingCycle(plotId, varietyId, new Date())

// Complete cycle
await completeCycle(cycleId, new Date())
```

### Activity Log

```typescript
import { addActivity } from '@/actions/activity-actions'

// Add activity with images
await addActivity(cycleId, {
  type: 'FERTILIZING',
  description: 'Applied organic fertilizer',
  cost: 500,
  activityDate: new Date(),
}, ['https://cloudinary.com/image1.jpg'])
```

## 🎨 UI Components (Shadcn/ui)

### Install Components

```bash
npx shadcn@latest init
npx shadcn@latest add button card input label select toast
```

### Included Components

- Button
- Card
- Input
- Label
- Select
- Toast
- Dialog
- Dropdown Menu

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Build verification
npm run build

# Lint
npm run lint

# Database Studio (visual editor)
npm run db:studio
```

## 📦 Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Hosting

- **Neon** (Serverless Postgres, free tier)
- **Supabase** (Postgres with extras)
- **Railway** (Managed Postgres)

### Post-Deployment

1. Update `AUTH_URL` to production URL
2. Update LIFF Endpoint URL in LINE console
3. Update OAuth redirect URLs for Google/Facebook
4. Run `npx prisma migrate deploy` for production

## 🔧 Development Tips

### Prisma Commands

```bash
npx prisma studio          # Visual database editor
npx prisma migrate dev     # Create migration
npx prisma migrate reset   # Reset database
npx prisma db push         # Sync schema without migration
npx prisma generate        # Regenerate client
```

### Useful Scripts

```bash
npm run dev                # Start dev server with Turbopack
npm run build              # Production build
npm run type-check         # TypeScript check
npm run db:seed            # Seed database
```

## 🐛 Troubleshooting

### LIFF not initializing

- Check LIFF ID in `.env`
- Ensure LIFF SDK script is loaded in `app/layout.tsx`
- Test in LINE app, not external browser

### OAuth errors

- Verify redirect URLs match exactly
- Check credentials in `.env`
- Ensure AUTH_URL is correct

### Prisma errors

- Run `npx prisma generate` after schema changes
- Check DATABASE_URL format
- Ensure PostgreSQL is running

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Leaflet Documentation](https://leafletjs.com)

## 📝 License

MIT
