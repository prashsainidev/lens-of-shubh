# Lens of Shubh — Project Context

## Project Overview
Photographer/Videographer Shubham Singh ki full stack website.
- **Client**: Shubham Singh
- **Company**: Lens of Shubh
- **Location**: Aligarh, Uttar Pradesh
- **Live URL**: https://lens-of-shubh.vercel.app

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL) - Mumbai region
- **ORM**: Prisma 6
- **Auth**: NextAuth.js (Credentials Provider)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS / Vanilla CSS Modules
- **Deploy**: Vercel

---

## Project Structure
- `src/app/(public)/` → Public website pages (Home, Portfolio, Services, Testimonials)
- `src/app/(admin)/` → Admin panel pages (Login, Dashboard sections)
- `src/app/api/` → Backend API routes (Contact leads, Testimonials queue, Services, Portfolio)
- `src/components/public/` → Website frontend components (Hero, About, Gallery, Contact, CustomCursor)
- `src/components/admin/` → Admin panel components (Sidebar, counters, widgets)
- `src/lib/` → db.ts (Prisma client), auth.ts (NextAuth config), supabase.ts (Storage client)
- `src/types/` → TypeScript types and interfaces
- `src/proxy.ts` → Next.js Proxy Middleware entrypoint for route protection
- `prisma/` → schema.prisma

---

## Database Tables (Prisma Schema)
- **Admin** → Admin dashboard logins
- **Portfolio** → Uploaded photos/videos showcase
- **Service** → Packages, features, & realistic pricing
- **Inquiry** → Contact form submissions (leads)
- **Testimonial** → Client reviews (supports image screenshots and text reviews)

---

## API Routes
- `POST/GET /api/contact` → Inquiry table (creates leads & handles dashboard GET queries)
- `GET/POST /api/portfolio` → Portfolio table (fetches gallery items & uploads media)
- `GET/POST /api/services` → Service table (manages package data)
- `GET/POST /api/testimonials` → Testimonial table (fetches approved entries for main page)
- `PATCH/DELETE /api/testimonials/[id]` → Moderation route (approves, hides, or deletes reviews)
- `/api/auth/[...nextauth]` → NextAuth credentials session endpoint

---

## Environment Variables (.env.local & Vercel Dashboard)
- `DATABASE_URL` (Supabase PgBouncer transaction pooling URL - Port 6543)
- `DIRECT_URL` (Supabase direct connection string - Port 5432)
- `NEXTAUTH_SECRET` (JWT session encryption)
- `NEXTAUTH_URL` (Base deployment URL, e.g. http://localhost:3000 or https://lens-of-shubh.vercel.app)
- `NEXT_PUBLIC_SUPABASE_URL` (Storage asset uploads)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase public API)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (Fallback administrative credentials)

---

## 📊 Complete Progress Summary

### ✅ Jo Kaam Ho Gaya (Completed Tasks):

1. **Database & API Foundations**:
   - Supabase Postgres Database connected in Mumbai region with connection pooling (PgBouncer port `6543` used globally in both `.env` and `.env.local` to resolve timeout errors).
   - Prisma schema synchronized with Admin, Portfolio, Service, Inquiry, and Testimonial tables.
   - Dynamic `/api/contact` POST handler hooked up to frontend form to store real client leads.

2. **Frontend UI & Interactive Redesigns**:
   - Centered and symmetrically aligned headers, trust pillars, and 3 client phone mockups (WhatsApp Chat, Instagram Story, Instagram DM) in `Testimonials.tsx`.
   - Sized up custom cursor z-indexes (`999999` and `999998`) to overlay modals, and configured a secondary `mounted` `useEffect` hook to prevent Next.js hydration race conditions.
   - Refactored mobile About photo styles in `About.css` to maintain a stable vertical **`aspect-ratio: 3/4`** instead of flat horizontal crops.

3. **Date Picker & Form Accessibility**:
   - Replaced input pseudo-element styling with a solid absolute sibling `.date-placeholder` inside `.form-group`.
   - Programmed sibling selectors (`input[type="date"]:focus ~ .date-placeholder`) to render a muted browser placeholder (e.g. `dd/mm/yyyy`) when empty and focused, completely eliminating empty blank boxes.

4. **Vercel Build-time Optimization**:
   - Configured robust fallback strings in `src/lib/supabase.ts` for Supabase URL and key to prevent build-time static evaluation crashes.
   - Registered `"build": "prisma generate && next build"` in `package.json` to compile types automatically.
   - Confirmed `npx next build` compiles with **zero errors**.

5. **Route Protection & Security**:
   - Configured NextAuth session middleware in `src/proxy.ts` (Next.js proxy entrypoint) to protect `/dashboard` and `/dashboard/*` paths.
   - Programmed redirects to `/login` for unauthenticated sessions, and immediate redirects back to `/dashboard` for logged-in users trying to access `/login`.

6. **Moderation Queue & Hide/Archive Feature**:
   - Added a **"Hide"** action button to approved reviews in the `/dashboard/testimonials` panel.
   - Wired up a PATCH request to toggle `approved: false` in the database, allowing Shubham to archive reviews from the live homepage instantly without deleting them permanently.
   - Auto-routed hidden reviews back to the pending moderation list for simple future re-approval.

7. **Database Dynamic Data Binding (Full-Stack Specs)**:
   - Formulated a 100% idempotent database seeder (`prisma/seed.ts`) using `ts-node`/`tsx` targeting Supabase Postgres, incorporating smart existence checks to prevent duplicate records when re-run.
   - Built custom reusable React hooks (`usePortfolio.ts`, `useServices.ts`, `useTestimonials.ts`) inside `src/hooks/` to isolate state logic, clean up layout code, and handle dynamic transitions gracefully.
   - Restructured landing page components (`Portfolio.tsx`, `Services.tsx`, `Testimonials.tsx`) to pull directly from hooks and render elegant gold shimmer loading skeletons instead of hardcoded mockups.
   - Added custom pricing badges, category dynamic tab filters, and full grid responsive Next.js `<Image>` optimizations.

8. **Robust API Input Sanitization & Security Shields**:
   - Programmed Zod schemas to sanitize all write endpoint inputs and validate parameters strictly (minimum message constraints, rating boundaries `[1, 5]`, and email/phone structures).
   - Integrated a silent **Honeypot Shield (`website`)** inside `Contact.tsx` and `/api/contact` API endpoint to identify automated spam bots and discard them without touching the database.
   - Secured POST write operations on `/api/portfolio` and `/api/services` under active NextAuth administrative credentials verification.
   - Fixed all TypeScript compilation mismatches on Zod error arrays across all routes (`src/app/api/...`), guaranteeing 100% type-safety during `npx next build` execution.

9. **Testimonials Screenshot Uploader Form**:
   - Implemented a premium manual WhatsApp/Instagram screenshot uploader form modal inside `/dashboard/testimonials` that uploads screenshots to Supabase Storage `"portfolio-images"` bucket, transcribes chat review text, takes 1-5 ratings, and saves records dynamically.
   - Configured `POST /api/testimonials` route to parse admin sessions and automatically set `approved: true` for admin-generated reviews, publishing them instantly to the Wall of Love.

10. **Inquiries Status transitions & Archived Support**:
    - Fully mapped `"archived"` status across inquiries list filters (`All | New | Read | Replied | Archived`), desktop row dropdowns, mobile card selects, and View Details details popup modal.
    - Updated `getStatusDropdownColor` utility to highlight `"archived"` inquiries in premium purple theme.
    - Secured status update (PATCH) and delete (DELETE) routes inside `/api/contact/[id]` with active admin session checks.

11. **Portfolio Featured Toggling Manager**:
    - Created active `PATCH` endpoint inside `/api/portfolio/[id]` to toggle `featured` state, protected with admin session verification check.
    - Added interactive Star button next to category tags on each portfolio card layout to toggle status instantly on click and sync DB properties.

12. **Services Packages CRUD Deletion**:
    - Created active `DELETE` endpoint inside `/api/services/[id]` with admin auth protection to delete packages permanently.
    - Added Delete card button with confirm alerts next to the edit trigger on all service package cards to delete packages safely.

13. **Public Portfolio Visual Enhancements & Featured Badges**:
    - Programmed a gorgeous "Featured" gold badge featuring a glowing pulsing Lucide `Star` on `featured: true` cards on the public homepage.
    - Upgraded card design with a smooth border-radius (`14px`), sleek gold borders, and rich 3D drop-shadows.
    - Re-styled the EXIF pill overlay into a horizontal glassmorphic badge with backdrop-filter blur (`8px`), gold monospace typography, and micro-hover translations.
    - Preserved a consistent vertical `aspect-ratio: 4 / 5` on all viewports (desktop, tablet, mobile) for cohesive premium portfolio aesthetics.

14. **Admin Portfolio Dynamic Editing Modal Form**:
    - Upgraded dynamic `/api/portfolio/[id]` PATCH endpoint to securely handle editing for `title`, `description` (EXIF details), `category`, `imageUrl`, and `featured` fields.
    - Integrated a premium glassmorphic Edit Modal inside `/dashboard/portfolio` prefilled with existing card details.
    - Enabled optional asset replacement uploads that overwrite files in Supabase storage and clean up old resources automatically.
    - Placed a gold-tinted **Edit** button next to delete triggers on all dashboard grid cards to trigger modification states smoothly.

15. **Public Portfolio Lightbox Captions & Stacking Refinements**:
    - Created a premium, glassmorphic caption bar below the image in the public lightbox showing Title, Category, `★ FEATURED` badge, and EXIF specifications, completely resolving mobile touch-hover conflict.
    - Stacked badges vertically on all screens under `1024px` (tablets and mobile viewports) with explicit `order: 1` (Featured) and `order: 2` (EXIF) flexbox order rules to eliminate horizontal overlaps and tap conflicts on touch viewports.
    - Synced desktop paddings to `1.25rem` to vertical-align card overlays to a perfect vertical line on all screens.
    - Shrank overlay spacing to `0.85rem` on small mobile viewports (< 480px) to prevent badge clip/overflow down to `320px` viewports.

16. **Admin Dashboard Visual Polish & Hydration Safety Shield**:
    - Compacted card action buttons (`px-2 py-1 text-[9px]`) and date text (`text-[8px] sm:text-[9px]`) with `gap-1.5` container spacing to guarantee a spacious, clean single-row footer layout on `1024px` and `1240px` cards with zero squishing or text wrapping—looking exactly as spacious and perfect as on `1440px` desktop monitors.
    - Integrated `suppressHydrationWarning={true}` on all inputs, select dropdowns, textareas, checkboxes, and buttons inside both the main uploader form and the edit modal form to completely squash the React hydration mismatch console error caused by browser password managers or autofills.

---

## ⏳ Jo Kaam Baaki Hai (Remaining Tasks Checklist):

### 🔴 High Priority (Polishing & Assets Integration):
1. **[ ] Real Assets Integration**:
   - Swap stock placeholder visuals and local images with actual premium photography and cinematic video assets from Shubham.
2. **[ ] End-to-End User Verification & Production Deploy**:
   - Conduct final functional checks on Vercel preview environments across desktop and mobile devices.

---

## 📌 Prompt Order for Future AI Coding Cycles (AI Sync Guide):
*Use this prompt instruction sequence to continue working step-by-step in future chats:*

*   **Step 1**: Coordinate with Shubham to swap stock placeholder visuals and local images with actual premium photography and cinematic video assets in the public directory and database.
*   **Step 2**: Conduct final mobile/desktop layout audits, confirm that CORS, authentication, and honeypots work flawlessly on Vercel, and deploy the application to production!
