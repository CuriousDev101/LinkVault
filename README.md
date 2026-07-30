# LinkVault - Web-Based Bookmark Manager

LinkVault is a modern, responsive web application for saving, organizing, searching, and managing website bookmarks.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Lucide React
- **Backend**: Node.js, Express.js (TypeScript), REST API
- **Database & ORM**: PostgreSQL, Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT & Bcrypt password hashing
- **Testing**: Vitest & Supertest

---

## 📁 Project Structure

```
LinkVault/
├── SRS.md                    # Software Requirements Specification
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/       # BookmarkCard, Modals, Navbar, Sidebar, ConfirmDialog, EmptyState
│   │   ├── context/          # AuthContext
│   │   ├── lib/              # api.ts (Typed API client)
│   │   ├── pages/            # Login, Register, Dashboard, Bookmarks, Folders, Tags, Settings
│   │   └── types/            # TypeScript interfaces
│   └── package.json
└── server/                   # Node.js + Express backend
    ├── src/
    │   ├── controllers/      # auth, bookmark, folder, tag, stats
    │   ├── db/               # schema.ts, index.ts (Drizzle + PostgreSQL)
    │   ├── middlewares/      # auth, validation, errorHandler
    │   ├── routes/           # REST endpoints
    │   ├── validations/      # Zod validation schemas
    │   └── __tests__/        # Automated Vitest + Supertest integration tests
    ├── drizzle.config.ts
    └── package.json
```

---

## 🚀 Getting Started

### 1. Database Setup

Make sure PostgreSQL is running locally on port 5432 with database `linkvault`:

```bash
# Check postgres status
pg_isready
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env # adjust DATABASE_URL or JWT_SECRET if needed

# Run database migrations / schema sync
pnpm db:generate
pnpm drizzle-kit push

# Run development server
pnpm dev
```

The API server will run at `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd client
pnpm dev
```

The React frontend will be available at `http://localhost:5173`. API requests to `/api` are automatically proxied to `http://localhost:3000`.

---

## 🧪 Running Tests

### Backend Tests

```bash
cd server
pnpm test
```

Runs integration tests covering:

- User registration and duplicate email rejection
- User authentication and session management
- Protected routes rejection of unauthenticated requests
- Strict user data isolation
- Bookmark creation, URL validation, timestamps
- Bookmark viewing and editing
- Bookmark deletion
- Folder creation and renaming
- Safe folder deletion (preserving bookmarks as uncategorized)
- Tag creation, assignment, and removal
- Search, sorting, and filtering
- Dashboard statistics endpoint

### Frontend Tests

```bash
cd client
pnpm test
```

---

## 📋 Features Implemented

- **Authentication**: Register with name, email, password; Login; JWT verification; Protected routes; Isolated user data.
- **Bookmarks**: Full CRUD; URL validation; Title and optional description; Folders and multi-tags assignment; Creation and modification timestamps; Open in new tab with safety attributes.
- **Folders**: Create, rename, view bookmarks in folder, safe deletion without deleting bookmarks.
- **Tags**: Create, edit, delete, assign multiple tags, filter by tag.
- **Search & Filter**: Search by title, URL, description, or tag; Sort by newest, oldest, title (A-Z/Z-A), recently updated; Filter by folder and tag; Friendly empty state when no results found.
- **Dashboard**: High-level stats, quick shortcuts, recently saved bookmarks, responsive layout for mobile and desktop.
- **Settings**: View account info, update name/email, change password, sign out.
