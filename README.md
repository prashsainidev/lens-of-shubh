# 📸 Lens of Shubh

Professional photography & videography portfolio website for Shubham Singh.

**Live:** [https://lens-of-shubh.vercel.app](https://lens-of-shubh.vercel.app)

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Vanilla CSS Modules |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma 6 |
| Auth | NextAuth.js |
| Storage | Supabase Storage |
| Deploy | Vercel |

---

## ✨ Features

### Public Website
- **Hero Showcase**: Premium dynamic background transitions highlighting Shubham's finest moments.
- **About Section**: Professional biography with custom stable portrait grid layouts.
- **Portfolio Gallery**: Media grids featuring dynamic category tabs, EXIF details, and responsive glassmorphic lightboxes.
- **Services & Packages**: Clear service offerings and pricing tiers managed dynamically.
- **Wall of Love**: An infinite vertical scrolling marquee of verified reviews, categorized by platform origin (WhatsApp, Instagram, Google).
- **Contact Form**: Secure inquiry submissions with integrated honeypot spam protection.

### Admin Panel (`/login`)
- **Secure Authentication**: NextAuth credentials session controller.
- **Dashboard Hub**: Metric summaries showing total inquiries, pending reviews, and portfolio count.
- **Portfolio Manager**: Dynamic CRUD forms supporting image/video replacements uploaded directly to Supabase storage.
- **Services Editor**: Fully managed package rates, features lists, and toggle states.
- **Testimonials Moderation Queue**: Approve, archive/hide, edit ratings, platform origins, and upload client screenshot proofs.
- **Inquiry Leads tracker**: Filter inquiries by status (New, Read, Replied, Archived) and manage client briefs.
- **Site Assets Manager**: Swap background layouts and hero assets directly from the admin dashboard.

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account with Storage Bucket

### Installation

```bash
# Clone the repository
git clone https://github.com/prashsainidev/lens-of-shubh.git
cd lens-of-shubh

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Open .env.local and fill in your keys (see section below)

# Initialize database schema & seed data
npx prisma generate
npx prisma db push
npx prisma db seed

# Spin up development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Your `.env.local` (and production environment) must define:

```env
DATABASE_URL="postgresql://..." # Supabase PgBouncer transaction pooling URL (Port 6543)
DIRECT_URL="postgresql://..."   # Supabase direct connection string (Port 5432)
NEXTAUTH_SECRET="your-jwt-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/     # Public sections (Hero, About, Portfolio, Services, Testimonials)
│   ├── (admin)/      # Secure administrative workspace (Login, Dashboard routes)
│   └── api/          # Serverless endpoints for inquiries, moderations, portfolio and auth
├── components/
│   ├── public/       # Client-facing interactive components
│   └── admin/        # Panel utilities, sidebar menu links, and data tables
├── hooks/            # Reusable React state & database fetch hooks
├── lib/              # Client instances for Prisma DB, Auth, and Supabase Storage
└── types/            # Type-safe model interfaces

prisma/
├── schema.prisma     # Database models & client generation schema
└── seed.ts           # Idempotent seed data script
```

---

## 👨‍💻 Developer

Built by **Prashant Saini (prashsainidev)**
- GitHub: [@prashsainidev](https://github.com/prashsainidev)
- Project Repository: [https://github.com/prashsainidev/lens-of-shubh](https://github.com/prashsainidev/lens-of-shubh)

---

## 📄 License

Private project — All rights reserved © 2026 Shubham Singh
