# ZFORCE DMS - EV Dealership Management System

## Overview

ZFORCE DMS is an enterprise-grade Electric Vehicle Dealership Management System designed for managing sales, service, spare parts, warranty, CRM, and finance operations. The application follows a modern full-stack architecture with a React frontend and Express backend, using PostgreSQL for data persistence.

The system is built for multi-role access (Head Office, Dealer, Technician, Customer) with role-based layouts and permissions. Core modules include vehicle bookings, deliveries, inventory management, job cards for service, and comprehensive dashboard analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Charts**: Recharts for data visualization
- **Design System**: Material Design-inspired enterprise patterns with Inter/Roboto Mono typography

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful JSON APIs under `/api/*` prefix
- **Build Tool**: esbuild for server bundling, Vite for client
- **Development**: Hot module replacement via Vite middleware

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's pgTable definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Storage Interface**: Abstracted via `IStorage` interface in `server/storage.ts` for swappable implementations

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # Reusable UI components
│   ├── components/ui/   # shadcn/ui primitives
│   ├── pages/           # Route page components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route definitions
│   └── storage.ts       # Data access layer
├── shared/              # Shared code between client/server
│   └── schema.ts        # Drizzle database schema
└── migrations/          # Drizzle migration files
```

### Key Design Patterns
- **Shared Schema**: Database types and validation schemas shared between frontend and backend
- **Database Storage**: `DatabaseStorage` class in `server/storage.ts` provides PostgreSQL persistence via Drizzle ORM
- **Auto-Seeding**: Initial demo data is seeded on first startup (dealers, bookings, job cards, inventory)
- **Component Composition**: Extensive use of Radix UI primitives wrapped with shadcn/ui styling
- **Query-Based Data Fetching**: All API data fetched via React Query with automatic caching

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations and schema pushing (`npm run db:push`)
- **connect-pg-simple**: Session storage in PostgreSQL

### UI Libraries
- **Radix UI**: Complete set of accessible UI primitives (dialog, dropdown, tabs, etc.)
- **Recharts**: Composable charting library for dashboard visualizations
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **cmdk**: Command palette component
- **vaul**: Drawer component

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Fast server-side bundling
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type checking across the entire codebase

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration with React Hook Form