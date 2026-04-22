# Technical Architecture

## 1. System Overview

The Ethiopian Airlines Knowledge Portal (EAKP) is built as a modern web application using a serverless architecture optimized for scalability, security, and developer experience.

### 1.1 Architecture Principles

- **Mobile-First**: Progressive Web App (PWA) with offline capabilities
- **Security-First**: Row-level security, role-based access control
- **Scalability**: Serverless functions, CDN distribution
- **Developer Experience**: TypeScript, modern React patterns

---

## 2. Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Framework** | Next.js 16 (App Router) | React Server Components, API routes, optimized for production |
| **Language** | TypeScript | Type safety, better IDE support, industry standard |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Modern utility-first CSS, accessible components |
| **Backend** | Supabase (PostgreSQL) | Open source Firebase alternative, real-time, row-level security |
| **Auth** | Supabase Auth | Built-in email/password, OAuth, session management |
| **Storage** | Supabase Storage | File uploads, images, videos with CDN delivery |
| **Search** | PostgreSQL Full-Text Search | Native FTS with ranking, path to Algolia/Typesense |
| **Editor** | Tiptap | Headless rich text editor, collaborative ready |
| **i18n** | react-i18next | Amharic/English bilingual support |
| **Charts** | Recharts | React-based data visualization |
| **Deployment** | Vercel | Global CDN, serverless functions, Git integration |

### 2.1 Why This Stack?

**Supabase over PocketBase:**
- PostgreSQL (production-grade) vs SQLite (single-file)
- Real-time subscriptions for live updates
- Better TypeScript support and SDK
- Vercel edge deployment compatibility
- Row-level security policies for multi-tenant access

**Next.js over alternatives:**
- App Router for modern React patterns
- Server Components reduce client-side JavaScript
- Built-in API routes
- Excellent Vercel integration

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Web App     │  │  Mobile PWA  │  │  Admin Dashboard     │  │
│  │  (Next.js)   │  │  (Offline)   │  │  (Role-based)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Supabase Auth│  │  Search API  │  │  Knowledge Mgmt API  │  │
│  │ (RLS policies)│  │  (PG FTS)    │  │  (Server Actions)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │  Supabase    │  │  Knowledge Graph     │  │
│  │  (Supabase)  │  │  Storage     │  │  (Future: Neo4j)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 Core Tables

#### users (extends Supabase auth)
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'staff',
  department_id department_enum,
  is_expert BOOLEAN DEFAULT FALSE,
  expertise_tags TEXT[],
  seniority_level INTEGER,
  languages language_enum DEFAULT 'english',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Enums:**
- `user_role`: admin, department_head, expert, staff, trainee
- `department_enum`: flight_ops, engineering, customer_service, ground_ops, training, hr, cargo, maintenance
- `language_enum`: amharic, english, both

#### knowledge_articles
```sql
CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category knowledge_category,
  department_id department_enum,
  author_id UUID REFERENCES user_profiles(id),
  tags TEXT[],
  language language_enum DEFAULT 'english',
  attachments JSONB,
  video_url TEXT,
  status content_status DEFAULT 'draft',
  review_date DATE,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Enums:**
- `knowledge_category`: sop, lesson_learned, best_practice, innovation, safety, training
- `content_status`: draft, review, published, archived

#### expert_profiles
```sql
CREATE TABLE expert_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  bio TEXT,
  areas_of_expertise TEXT[],
  years_experience INTEGER,
  availability_status availability_enum DEFAULT 'available',
  contact_preferences contact_enum DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### lessons_learned
```sql
CREATE TABLE lessons_learned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_date DATE,
  department_id department_enum,
  flight_number TEXT,
  aircraft_type TEXT,
  summary TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  preventability preventability_enum,
  contributors UUID[],
  related_articles UUID[],
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### innovation_ideas
```sql
CREATE TABLE innovation_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  submitted_by UUID REFERENCES user_profiles(id),
  department_id department_enum,
  status idea_status DEFAULT 'submitted',
  votes INTEGER DEFAULT 0,
  voters UUID[],
  estimated_impact impact_enum,
  implementation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Row Level Security (RLS) Policies

```sql
-- Example: Knowledge articles can be read by all authenticated users
CREATE POLICY "Articles are viewable by authenticated users"
  ON knowledge_articles FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Example: Users can only edit their own articles
CREATE POLICY "Users can edit own articles"
  ON knowledge_articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Example: Admins can do everything
CREATE POLICY "Admins have full access"
  ON knowledge_articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 5. Key Features Implementation

### 5.1 Explicit Knowledge Repository

| Feature | Technical Implementation |
|---------|--------------------------|
| Smart Search | PostgreSQL FTS with ranking + React query params |
| Department Taxonomy | Collection filters + RLS-based access rules |
| Version Control | Record history + content diff tracking |
| Multilingual | i18n library + language-specific content fields |
| Document Preview | React-PDF + HTML5 video player |
| Offline Access | Service Workers + IndexedDB |

### 5.2 Tacit Knowledge Capture

| Feature | Technical Implementation |
|---------|--------------------------|
| Expert Locator | Profile search with expertise_tags filter |
| Video Storytelling | MediaRecorder API + Supabase Storage |
| After-Action Reviews | Multi-step form wizard with validation |
| Mentorship Matching | Algorithm: department + expertise + availability |
| Q&A Forums | Comments collection with best answer marking |
| Ask an Expert | Notification system + expert queue |

### 5.3 Innovation & Quality

| Feature | Technical Implementation |
|---------|--------------------------|
| Innovation Portal | ideas collection + voting logic |
| Lessons Learned DB | lessons_learned collection + filters |
| SOP Acknowledgment | Junction table: user + article + timestamp |
| Compliance Dashboard | Aggregation queries + Recharts |
| Content Review | Cron job + email notifications |

### 5.4 Localization

| Feature | Technical Implementation |
|---------|--------------------------|
| Amharic Interface | i18n JSON files for Amharic |
| Bilingual Content | Parallel fields: content_en, content_am |
| Regional Hubs | regional_location filter on content |
| Low-Bandwidth Mode | Conditional rendering based on connection |
| Mobile-First | Tailwind responsive + touch-friendly UI |

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
User → Supabase Auth → JWT Token → RLS Policies → Data Access
```

### 6.2 Authorization Matrix

| Role | Articles | Experts | Lessons | Ideas | Users |
|------|----------|---------|---------|-------|-------|
| **Admin** | CRUD | CRUD | CRUD | CRUD | CRUD |
| **Dept Head** | CRUD (own dept) | Read | CRUD (own dept) | Read/Approve | Read |
| **Expert** | CRUD (own) | Read/Update (own) | Create | CRUD (own) | Read |
| **Staff** | Read | Read | Create | Create (own) | Read (own) |
| **Trainee** | Read (limited) | Read | - | - | Read (own) |

### 6.3 Data Protection

- **Encryption at Rest**: PostgreSQL native encryption
- **Encryption in Transit**: TLS 1.3
- **PII Handling**: Minimal collection, consent-based
- **Audit Logging**: activity_logs table tracks all actions
- **Backup Strategy**: Daily automated backups via Supabase

---

## 7. API Design

### 7.1 Server Actions (Next.js App Router)

```typescript
// Example: Knowledge article operations
export async function createArticle(data: ArticleInput) {
  const supabase = createClient();
  const { data: article, error } = await supabase
    .from('knowledge_articles')
    .insert(data)
    .select()
    .single();
  return { article, error };
}

export async function searchArticles(query: string, filters: SearchFilters) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('*')
    .textSearch('content', query)
    .filter('department_id', 'eq', filters.department)
    .order('view_count', { ascending: false });
  return { data, error };
}
```

### 7.2 Real-time Subscriptions

```typescript
// Example: Live updates for innovation ideas
const subscription = supabase
  .channel('ideas')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'innovation_ideas' },
    (payload) => {
      // Handle real-time update
    }
  )
  .subscribe();
```

---

## 8. Deployment Architecture

### 8.1 Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | localhost:3000 | Local development |
| **Staging** | staging.eakp.ethiopianairlines.com | Testing, QA |
| **Production** | knowledge.ethiopianairlines.com | Live system |

### 8.2 CI/CD Pipeline

```
Git Push → GitHub Actions → Build → Test → Deploy to Vercel
                              ↓
                    Supabase Migrations
```

---

## 9. Performance Considerations

### 9.1 Optimization Strategies

| Area | Strategy |
|------|----------|
| Database | Proper indexing, query optimization |
| Images | Next.js Image component with CDN |
| Code | Code splitting, lazy loading |
| Network | HTTP/2, compression, caching |
| Mobile | Reduced payload, offline-first |

### 9.2 Target Metrics

| Metric | Target |
|--------|--------|
| Time to First Byte | < 200ms |
| Largest Contentful Paint | < 2.5s |
| First Input Delay | < 100ms |
| API Response Time | < 500ms |

---

*Architecture Version: 2.0*  
*Technical Lead: Digital Transformation Team*  
*Last Review: April 2026*
