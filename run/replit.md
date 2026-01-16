# Sentinel AI - Universal Security Auditor

## Overview

Sentinel AI is an agentic security platform designed for the Gemini 3 Flash Developer Challenge. It performs holistic security audits across Web2 (APIs/Frontend), Web3 (Smart Contracts), and DLT (Distributed Ledger Technology) codebases. The platform leverages Google's Gemini AI with its large context window to analyze entire codebases, detect vulnerabilities, generate proof-of-concept exploit code, and produce professional security reports formatted for bug bounty platforms like Immunefi and HackerOne.

The application features a cyberpunk-themed UI with neon cyan/green aesthetics, allowing security researchers to create projects, run AI-powered audits, view detected vulnerabilities with severity classifications, and export professional reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyberpunk theme (dark mode, neon colors, monospace fonts)
- **Animations**: Framer Motion for UI transitions
- **Code Display**: react-syntax-highlighter for PoC code snippets
- **Charts**: Recharts for vulnerability severity visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Build Tool**: Vite for frontend, esbuild for server bundling
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation schemas

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines all tables
- **Core Tables**: users, sessions, projects, audits, vulnerabilities, reports, conversations, messages
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication
- **Method**: Replit Auth via OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Implementation**: Passport.js with custom OIDC strategy in `server/replit_integrations/auth/`

### AI Integration
- **Provider**: Google Gemini via Replit AI Integrations
- **Models**: gemini-2.5-flash (fast), gemini-2.5-pro (advanced), gemini-2.5-flash-image (images)
- **Client**: @google/genai SDK configured with Replit's proxy endpoint
- **Features**: Chat conversations, image generation, batch processing with rate limiting

### Project Structure
```
client/src/          # React frontend
  components/        # UI components (Shadcn + custom)
  pages/             # Route pages (Landing, Dashboard, ProjectDetails, AuditDetails)
  hooks/             # React Query hooks for API calls
  lib/               # Utilities

server/              # Express backend
  replit_integrations/  # Auth, Chat, Image, Batch AI modules
  routes.ts          # API endpoint definitions
  storage.ts         # Database operations
  db.ts              # Drizzle connection

shared/              # Shared types/schemas
  schema.ts          # Drizzle table definitions
  routes.ts          # API contract with Zod schemas
  models/            # Auth and Chat model definitions
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management

### AI Services
- **Replit AI Integrations**: Provides Gemini API access without separate API key
  - Requires: AI_INTEGRATIONS_GEMINI_API_KEY, AI_INTEGRATIONS_GEMINI_BASE_URL
  - Used for security analysis, vulnerability detection, PoC generation

### Authentication
- **Replit Auth (OIDC)**: User authentication
  - Requires: ISSUER_URL, REPL_ID, SESSION_SECRET
  - Provides: User identity, profile information

### Key npm Packages
- @google/genai - Gemini AI client
- drizzle-orm, drizzle-kit - Database ORM
- express, express-session - Web server
- @tanstack/react-query - Data fetching
- react-syntax-highlighter - Code display
- framer-motion - Animations
- recharts - Charts
- zod - Runtime validation