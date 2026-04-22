# Ethiopian Airlines Knowledge Portal (EAKP)

A unified Knowledge Management System for Ethiopian Airlines Group, designed to capture, organize, and share institutional knowledge across all departments.

## Overview

The Ethiopian Airlines Knowledge Portal addresses critical knowledge management challenges:

- **Knowledge Silos**: Cross-departmental information sharing
- **Access Inequality**: Mobile-first design for frontline staff
- **Brain Drain Risk**: Systematic capture of expert knowledge
- **Fragmented Systems**: Unified search across all content

## Key Features

- **Knowledge Base**: Searchable repository of SOPs, manuals, and best practices
- **Expert Locator**: Directory of subject matter experts with availability tracking
- **Innovation Hub**: Structured idea submission, voting, and implementation tracking
- **Lessons Learned**: After-action reviews and incident reporting
- **Mobile-First PWA**: Offline access for regional stations
- **Multilingual**: English and Amharic interface support

## Technology Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Search**: PostgreSQL Full-Text Search
- **Deployment**: Vercel

## Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Purpose |
|----------|---------|
| [Project Overview](docs/01-project-overview.md) | Executive summary and scope |
| [KM Assessment](docs/02-km-assessment.md) | Current state analysis and audit findings |
| [Strategy Framework](docs/03-strategy-framework.md) | Innovation, Quality, and Localization strategies |
| [Technical Architecture](docs/04-technical-architecture.md) | System design and tech stack |
| [Implementation Roadmap](docs/05-implementation-roadmap.md) | Phased implementation plan |
| [User Guide](docs/06-user-guide.md) | End-user documentation |

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (for backend)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

## Project Structure

```
├── app/                    # Next.js app router
│   ├── (app)/             # Authenticated routes
│   ├── (auth)/            # Authentication routes
│   └── (public)/          # Public pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Application components
├── docs/                  # Documentation
├── lib/                   # Utilities and hooks
│   ├── hooks/            # Custom React hooks
│   └── supabase/         # Supabase clients
└── public/               # Static assets
```

## User Roles

- **Admin**: Full system access, user management, content moderation
- **Department Head**: Department content management, expert designation
- **Expert**: Content creation, profile visibility, inquiry responses
- **Staff**: Content consumption, idea submission, lessons learned
- **Trainee**: Limited read access, learning focus

## Contributing

This is an academic project developed for the Digital Ethiopia 2030 initiative. For production deployment, contact the Ethiopian Airlines Digital Transformation Team.

## License

© 2026 Ethiopian Airlines Group. Academic prototype - Digital Ethiopia 2030.

---

*Aligning with Digital Ethiopia 2030: Preserving institutional knowledge for the African aviation leader.*
