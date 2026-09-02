# Creative Corner – Event Management Platform

A complete **Next.js** event management website and admin booking platform built for the New Tech Softs Web Development Internship – Task 03.

## Requirements covered

- Professional Creative Corner public website
- Home, About, Services, Packages, Events/Portfolio, Gallery, Booking and Contact pages
- Customer booking flow with client, event, location and additional requirements
- Booking reference generation
- Booking statuses: Pending, Under Review, Confirmed, In Progress, Completed, Cancelled
- Admin authentication and protected admin panel
- Dashboard statistics
- Booking management and status updates
- Client, service, package, event, gallery and inquiry data modules
- Notifications overview
- Search/filter-ready data APIs
- Responsive desktop/tablet/mobile UI
- Local image assets
- Prisma database schema and seed data
- README, database documentation and deployment notes

## Tech stack

- Next.js App Router
- React + TypeScript
- Prisma ORM
- PostgreSQL (Neon) for production / SQLite for local development
- JWT session cookie with `jose`
- `bcryptjs` password hashing
- Lucide icons
- Custom responsive CSS

## Requirements

Node.js 20+ and npm.

## Run locally

```bash
npm install
copy .env.example .env
npm run db:setup
npm run dev
```

Open `http://localhost:3000`.

### Admin

Open `http://localhost:3000/admin`.

Default development credentials:

- Email: `admin@creativecorner.pk`
- Password: `Admin@123`

**Change these credentials before deployment.**

## Database

The Prisma schema is in `prisma/schema.prisma`.

Main entities:

- Admin
- Client
- Booking
- Service
- Package
- Event
- GalleryItem
- Inquiry

For local development the project uses SQLite:

`DATABASE_URL="file:./dev.db"`

For production (Vercel) the project uses PostgreSQL hosted on Neon:

`DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"`

Commands:

```bash
npx prisma db push
npm run db:seed
npx prisma studio
```

## Booking workflow

Customer:

Explore Services → View Packages → Select Event Type → Select Package/Service → Select Date → Enter Location → Enter Client Details → Add Requirements → Submit → Receive Booking Reference.

Admin:

Login → Dashboard → View New Booking → Review Client/Event Details → Change Status → Manage business content.

## Production deployment

The project uses SQLite for local development and PostgreSQL (Neon) for production on Vercel. The Prisma schema is configured for PostgreSQL. When deploying to Vercel, set the `DATABASE_URL` environment variable to your Neon PostgreSQL connection string. The build script runs `prisma db push` to create/update the database schema automatically.

Recommended environment variables:

```env
DATABASE_URL="your-production-database-url"
AUTH_SECRET="a-long-random-production-secret"
ADMIN_EMAIL="your-admin-email"
ADMIN_PASSWORD="your-admin-password"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

## Internship submission checklist

The assignment requires:

- Complete source code
- GitHub repository
- README
- Database/system documentation
- Screenshots
- Demo video
- Live deployment URL
- Admin login credentials
- Daily LinkedIn progress posts
- NewTechSofts tagging

Remember that the assignment states daily LinkedIn progress is mandatory for attendance/evaluation.

## Suggested daily LinkedIn progress

Day 1: Planning, architecture and UI structure  
Day 2: Navbar, hero, About, services and footer  
Day 3: Packages, pricing, gallery and portfolio  
Day 4: Booking form and event scheduling  
Day 5: Booking storage, reference and status flow  
Day 6: Admin login, dashboard and statistics  
Day 7: Client/service/package/event/gallery/inquiry modules  
Day 8: Public website ↔ admin integration and notifications  
Day 9: Testing, validation and responsive polish  
Day 10: Bug fixes, documentation, screenshots, demo and deployment

Tag NewTechSofts as required by the assignment.

## Important note

The source is deliberately self-contained and uses local SVG artwork so the project works immediately without waiting for an image CDN. Replace the SVGs with real event photography before the final commercial-style presentation if desired.
