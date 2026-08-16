# ⛪ Haymete Abrham Sunday School Academic Management System
### ሐይመተ አብርሃም ሰንበት ትምህርት ቤት የትምህርት ክፍል መረጃ ማኔጅመንት ሲስተም

A production-ready, full-stack, bilingual (English & Amharic) academic portal and student information system built for **Haymete Abrham Sunday School (ሐይመተ አብርሃም ሰንበት ትምህርት ቤት)**. 

The platform digitizes student admissions, class grouping, course scheduling, attendance rosters, customizable assessment spreadsheets, hierarchical grade approval workflows, comprehensive student drill-down portfolios with a **Behavioral Flag System**, and auditable record management.

---

## 📋 Table of Contents
1. [🌟 System Overview & Mission](#-system-overview--mission)
2. [💡 How It Works (Architecture & Data Flow)](#-how-it-works-architecture--data-flow)
3. [✨ Core System Capabilities & Features](#-core-system-capabilities--features)
4. [📂 Comprehensive Folder & File Structure](#-comprehensive-folder--file-structure)
   - [Root Directory Configuration](#root-directory-configuration)
   - [Server Directory (`/server`)](#server-directory-server)
   - [Source Directory (`/src`)](#source-directory-src)
   - [UI Components Directory (`/src/components`)](#ui-components-directory-srccomponents)
   - [Context Providers (`/src/context`)](#context-providers-srccontext)
   - [Services & API Client (`/src/services`)](#services--api-client-srcservices)
   - [Utilities & Ethiopian Calendar (`/src/utils`)](#utilities--ethiopian-calendar-srcutils)
   - [Localization & i18n (`/src/locales`)](#localization--i18n-srclocales)
5. [🔌 API Endpoints Reference](#-api-endpoints-reference)
6. [🛠️ Tech Stack & Key Libraries](#️-tech-stack--key-libraries)
7. [⚙️ Prerequisites & Environment Setup](#️-prerequisites--environment-setup)
8. [🚀 How to Run Locally](#-how-to-run-locally)
9. [🔑 Default System Roles & Test Credentials](#-default-system-roles--test-credentials)
10. [📤 Version Control & GitHub Setup](#-version-control--github-setup)
11. [🌐 Deployment Options (Cloud Run, Render, Railway, Docker)](#-deployment-options)
12. [👨‍💻 Developer Credits](#-developer-credits)

---

## 🌟 System Overview & Mission

Sunday schools and faith-based academic institutions have unique operational workflows, including dual-calendar tracking (Gregorian & Ethiopian Ge'ez calendar), specialized spiritual courses, multi-teacher subject assignments, and pastoral behavioral tracking.

The **Haymete Abrham Academic Management System** addresses these needs by replacing paper ledgers and disconnected spreadsheets with a unified, real-time web portal that is accessible simultaneously by administrators, department leaders, coordinators, teachers, and students.

---

## 💡 How It Works (Architecture & Data Flow)

The application utilizes a cohesive **Full-Stack TypeScript** architecture running inside a single containerized Node.js service:

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 Browser (Client / React 18)                 │
                  │  - React UI (Tailwind CSS, Lucide Icons, Recharts)          │
                  │  - Bilingual State Context (English & Amharic)              │
                  │  - Authentication & Session State                           │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                               HTTP / REST (JSON Requests)
                                                 │
                  ┌──────────────────────────────▼──────────────────────────────┐
                  │                 Express.js Backend Server                   │
                  │  - Port 3000 Ingress Routing                                │
                  │  - Auth & Role-Based Access Control (RBAC)                  │
                  │  - REST API Routes (/api/auth, /api/students, /api/marks..) │
                  │  - Vite Middleware (Development) / Static SPA (Production)  │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                               Persistence Layer (Dual Strategy)
                                                 │
                  ┌──────────────────────────────▼──────────────────────────────┐
                  │          Google Cloud Firestore Database + Memory Store     │
                  │  - Users, Students, Classes, Courses, Marks, Attendance     │
                  │  - Behavioral Flags, Notes, Audit Trail Logs                │
                  └─────────────────────────────────────────────────────────────┘
```

### 1. Unified Development Flow
- In development mode (`npm run dev`), Express acts as the parent server listening on port `3000` and mounts the **Vite Dev Server** as middleware. All API routes under `/api/*` are handled instantly, and client requests for assets trigger Vite's lightning-fast TypeScript bundling.

### 2. High-Performance Production Build
- In production (`npm run build`), Vite compiles the React single-page application into optimized static assets in `/dist`.
- `esbuild` bundles `server.ts` into a self-contained CommonJS entry file (`dist/server.cjs`).
- Node runs `dist/server.cjs` on port `3000`, serving both the REST APIs and the static frontend with zero additional proxy configuration.

### 3. Resilient Persistence
- The server initializes with Google Cloud Firestore for persistent cloud storage. If Firestore credentials are not configured in local environments, the backend seamlessly falls back to an in-memory data store with comprehensive seed data.

---

## ✨ Core System Capabilities & Features

### 1. 👥 Multi-Tier Role-Based Access Control (RBAC)
- **Admin (`ADMIN`)**: Complete control over user creation, teacher assignments, global academic settings, system audit trails, and student profiles.
- **Department Head (`DEPT_HEAD`)**: Configures courses, curriculum weights, custom assessment columns, reviews grade submissions, and manages departmental operations.
- **Academic Coordinator (`COORDINATOR`)**: Registers and groups students under class levels, coordinates schedule times, oversees attendance registers, and processes grade submissions.
- **Teacher (`TEACHER`)**: Views assigned course rosters, records weekly attendance, inputs marks into customizable assessment grids, and submits grade rosters to the review queue.
- **Student (`STUDENT`)**: Views personal report cards, cumulative GPA transcripts, attendance percentages, and course standings.

### 2. 📅 Dual-Calendar Support (Gregorian & Ethiopian Ge'ez)
- Integrated bidirectional calendar converter (`src/utils/ethiopianCalendar.ts`).
- Displays Ethiopian dates (e.g., *ነሐሴ 10 ቀን 2018 ዓ.ም.*) alongside standard dates across attendance sheets, grade timestamps, and behavioral notes.

### 3. 🚩 Behavioral Flag & Student Conduct System
- Allows teachers, coordinators, and administrators to attach **Behavioral Flags** directly to student drill-down portfolios.
- **Flag Types**: Attendance Warnings, Academic Difficulty Alerts, Classroom Disciplinary Notices, Pastoral/Spiritual Care Requests, and Merit/Leadership Commendations.
- **Priority Levels**: Low, Medium, High, and Critical Urgent (with pulsing visual alerts).
- **Resolution Workflow**: Authorized staff can log counseling notes and resolve flags, maintaining an unalterable audit log of student interventions.

### 4. 📝 Dynamic Assessment Builder & Mark Entry
- Spreadsheets with dynamic assessment columns (Assignments, Quizzes, Midterms, Final Exams, Project Work, Lab/Activity).
- Department heads can set custom maximum scores, edit column titles, and add bespoke scoring metrics.
- Automatic calculation of Total Scores, Percentage, Letter Grade ($A+, A, A-, B+, B, B-, C+, C, C-, D, F$), Grade Points, and Class Rank.

### 5. 📋 Two-Tier Grade Approval & Review Queue
- Enforces an institutional workflow: `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `APPROVED` or `REJECTED`.
- Teachers submit finished course marks to the review queue; coordinators and department heads inspect submissions with grade distribution graphs before final approval.

### 6. 📊 Real-Time Matrix Sheets & Exportable Reports
- **All-Courses Matrix View**: View every student's grades across all enrolled subjects side-by-side with automatic GPA calculation and rank assignment.
- **Official Print & Export**: One-click generation of printable transcripts and student report cards.
- **Attendance Word & PDF Export**: Export attendance registers formatted for Sunday school leadership.

---

## 📂 Comprehensive Folder & File Structure

Below is the complete architectural directory tree with detailed explanations of every single file and its role in the system:

```text
├── .env.example                       # Template for required environment variables
├── .gitignore                         # Specifies files ignored by Git version control
├── firestore.rules                    # Security rules for Google Cloud Firestore
├── firebase-applet-config.json        # Firebase applet and client configuration
├── firebase-blueprint.json            # Database collections and document schema definitions
├── index.html                         # SPA root HTML template with responsive viewport settings
├── metadata.json                      # AI Studio application metadata & platform permissions
├── package.json                       # Project npm dependencies, build scripts, and engine config
├── README.md                          # Project documentation and developer guide
├── tsconfig.json                      # TypeScript compiler rules and path configurations
├── vite.config.ts                     # Vite bundler, React plugin, and server proxy setup
│
├── server.ts                          # Main Express server entry point (port binding & Vite mount)
│
├── server/                            # Backend API Architecture
│   ├── app.ts                         # Express app configuration, JSON middleware & route registrations
│   │
│   ├── db/
│   │   └── firebase.ts                # Firestore client initialization and document helpers
│   │
│   ├── routes/                        # REST API Endpoint Handlers
│   │   ├── academic.ts                # Endpoints for classes, courses, sections, and schedules
│   │   ├── attendance.ts              # Attendance logging, daily roll-calls, and monthly statistics
│   │   ├── audit.ts                   # System audit trail logs and action tracking
│   │   ├── auth.ts                    # User login, session verification, and role authentication
│   │   ├── marks.ts                   # Mark entry, grade calculations, approval review queue
│   │   └── students.ts                # Student directory, drill-down profiles, and behavioral flags
│   │
│   └── store/
│       └── state.ts                   # Resilient database synchronization & mock seed dataset
│
├── src/                               # Frontend React Architecture
│   ├── main.tsx                       # React DOM root bootstrapping
│   ├── App.tsx                        # Master layout controller, view router, and top-level modals
│   ├── index.css                      # Tailwind CSS root styles, custom scrollbars, and color tokens
│   ├── types.ts                       # Shared TypeScript interfaces (Users, Students, Marks, Flags, etc.)
│   │
│   ├── components/                    # Modular UI Views & Dialogs
│   │   ├── AcademicCalendarView.tsx   # Visual school term calendar, holiday schedules, and events
│   │   ├── AllCoursesResultsTable.tsx # Comprehensive student × course grade matrix with GPAs
│   │   ├── AttendanceDownloadModal.tsx# Formatted Word/PDF attendance report export modal
│   │   ├── AttendanceMonthlyProgressChart.tsx # Graphical chart for monthly student attendance trends
│   │   ├── AttendanceView.tsx         # Attendance roster, session marking, and filterable history
│   │   ├── AuditLogView.tsx           # Audit log viewer with user actions, IP addresses, and timestamps
│   │   ├── ChurchLogo.tsx             # Orthodox Tewahedo Church insignia SVG branding component
│   │   ├── ClassesView.tsx            # Class level management & direct student enrolment cards
│   │   ├── CoursesView.tsx            # Course registry, syllabus details, and teacher assignments
│   │   ├── Dashboard.tsx              # Analytics dashboard tailored with metrics for each role
│   │   ├── DeveloperBanner.tsx        # Persistent footer with developer contact information
│   │   ├── Header.tsx                 # Top navigation banner, role badge, language & profile switcher
│   │   ├── LoginModal.tsx             # Modal login dialog with quick test-user presets
│   │   ├── MarkEntryView.tsx          # Dynamic assessment spreadsheet for grade entry & calculations
│   │   ├── ProfileModal.tsx           # User account profile editor and password changer
│   │   ├── ResultsView.tsx            # Student grade transcripts, ranking badges, and report cards
│   │   ├── ReviewQueueView.tsx        # Submission approval interface with grade distribution graphs
│   │   ├── SchedulesView.tsx          # Weekly timetable and classroom schedule manager
│   │   ├── Sidebar.tsx                # Role-aware responsive navigation sidebar
│   │   ├── StudentProfileModal.tsx    # Comprehensive student drill-down profile with Behavioral Flags
│   │   ├── StudentsView.tsx           # Master student directory with search, filters, and new enrolments
│   │   ├── TeachersView.tsx           # Teacher directory, assigned courses, and contact details
│   │   └── UsersView.tsx              # System user account administration and permission manager
│   │
│   ├── context/                       # Global React State Contexts
│   │   ├── AuthContext.tsx            # Active user session, login/logout, and permissions state
│   │   ├── LanguageContext.tsx        # English / Amharic language state and translation hook
│   │   └── ToastContext.tsx           # Global notification toast system (success, warning, error, info)
│   │
│   ├── locales/                       # Internationalization Dictionaries
│   │   └── i18n.ts                    # English and Amharic translation keys and phrases
│   │
│   ├── services/                      # Client-to-Server Communication
│   │   └── api.ts                     # Type-safe API client functions wrapping `fetch()` requests
│   │
│   └── utils/                         # Helper Algorithms & Converters
│       ├── academicYear.ts            # Dynamic academic year calculation engine
│       ├── ethiopianCalendar.ts       # Gregorian $\leftrightarrow$ Ethiopian Ge'ez calendar converter
│       └── wordExport.ts              # Word (.docx/.xml) attendance and transcript document generator
```

---

### Detailed Task Breakdown by Directory

#### Root Directory Configuration
- **`server.ts`**: The main backend entry point. Configures Express on port 3000, establishes API routes, and mounts Vite middleware for development or static file serving for production.
- **`package.json`**: Lists all dependencies (`react`, `express`, `lucide-react`, `motion`, `recharts`, `tailwindcss`, etc.) and commands (`npm run dev`, `npm run build`, `npm start`, `npm run lint`).
- **`vite.config.ts`**: Vite configuration using `@vitejs/plugin-react` and `@tailwindcss/vite`.
- **`tsconfig.json`**: TypeScript compiler setup supporting modern ES modules and strict type checking.
- **`firestore.rules`**: Granular security rules ensuring only authorized roles read and write to Firestore collections.
- **`metadata.json`**: System capabilities and permission declarations for the hosting container.

#### Server Architecture (`/server`)
- **`server/app.ts`**: Sets up Express application middleware, JSON request parsers, CORS settings, and organizes `/api/*` routes.
- **`server/db/firebase.ts`**: Connects to Firestore using project credentials; provides helper methods for saving, updating, and querying documents.
- **`server/store/state.ts`**: Central data store loaded with realistic seed records (users, students, courses, grades, attendance, behavioral flags). Syncs bi-directionally with Firestore.
- **`server/routes/academic.ts`**: Handles CRUD endpoints for classes, courses, sections, and classroom schedules.
- **`server/routes/attendance.ts`**: Manages attendance records, batch attendance updates per class session, and summary metrics.
- **`server/routes/audit.ts`**: Logs system activity (e.g., grade modifications, logins, flag creations) and serves paginated audit queries.
- **`server/routes/auth.ts`**: Authenticates users against stored email/password credentials and issues role payloads.
- **`server/routes/marks.ts`**: Manages course mark submissions, assessment column configurations, and approval workflows.
- **`server/routes/students.ts`**: Handles student registration, profile updates, and the behavioral flag system (create flag, resolve flag, get student history).

#### Frontend Components (`/src/components`)
- **`Dashboard.tsx`**: Home dashboard providing distinct metrics depending on the logged-in role (e.g., student counts for admins, assigned classes for teachers).
- **`StudentProfileModal.tsx`**: Deep-dive 360° modal for any student. Shows academic GPA standing, attendance percentages, transcript table, and the **Behavioral Flag System** (with quick-warning presets, resolution memos, and status chips).
- **`MarkEntryView.tsx`**: Interactive grade book allowing teachers to configure dynamic assessment columns, enter student marks, calculate total grades, and submit rosters.
- **`ReviewQueueView.tsx`**: Allows department heads and coordinators to review pending grade rosters, inspect grade distribution charts, and approve or reject submissions with feedback.
- **`ResultsView.tsx` & `AllCoursesResultsTable.tsx`**: Display consolidated grade tables across all courses with automated ranking (1st, 2nd, 3rd) and report card printing.
- **`AttendanceView.tsx` & `AttendanceMonthlyProgressChart.tsx`**: Interface for taking roll-call, reviewing attendance history, and visualizing monthly engagement.
- **`AttendanceDownloadModal.tsx`**: Enables exporting filtered attendance data into clean formatted tables for offline sharing.
- **`ClassesView.tsx`**: Visual card grid of all Sunday school grades/classes with direct student enrollment.
- **`CoursesView.tsx` & `SchedulesView.tsx`**: Manage the curriculum catalog, weekly timetable, and instructor assignments.
- **`TeachersView.tsx` & `UsersView.tsx`**: User and faculty administration, password resets, and role assignments.
- **`Sidebar.tsx` & `Header.tsx`**: Navigation components that dynamically adapt based on user permissions and language settings.
- **`ChurchLogo.tsx` & `DeveloperBanner.tsx`**: Institutional visual branding and developer attribution.

#### Context Providers (`/src/context`)
- **`AuthContext.tsx`**: Manages active user authentication state, handles login/logout, and persists session data across page refreshes.
- **`LanguageContext.tsx`**: Manages the bilingual application state (English $\leftrightarrow$ Amharic) and provides the `t()` translation function.
- **`ToastContext.tsx`**: Dispatches alert banners (success, error, info, warning) across all components.

#### Services & Utilities (`/src/services` & `/src/utils`)
- **`src/services/api.ts`**: Centralized API abstraction layer with TypeScript typing for every backend endpoint.
- **`src/utils/academicYear.ts`**: Calculates the active academic year (e.g., `2025/2026`) dynamically based on calendar dates.
- **`src/utils/ethiopianCalendar.ts`**: Converts Gregorian calendar dates to Ethiopian Ge'ez calendar dates with month names (Meskerem, Tikimt, etc.) and formats dual-calendar strings.
- **`src/utils/wordExport.ts`**: Converts tabular data into downloadable Word documents (`.doc`/XML format) for offline sharing and printing.

---

## 🔌 API Endpoints Reference

### Authentication & Users (`/api/auth` & `/api/academic/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticates with email and password | Public |
| `GET` | `/api/academic/users` | Lists all user accounts | Admin |
| `POST` | `/api/academic/users` | Registers a new user account | Admin |
| `PUT` | `/api/academic/users/:id` | Updates user details or role | Admin |
| `DELETE` | `/api/academic/users/:id` | Removes a user account | Admin |

### Students & Behavioral Flags (`/api/students`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/students` | Retrieves all registered students | All Staff |
| `POST` | `/api/students` | Registers a new student | Admin, Coord, Head |
| `GET` | `/api/students/:id/profile` | 360° comprehensive student profile | All Staff |
| `GET` | `/api/students/:id/behavioral-notes` | Lists notes & behavioral flags | All Staff |
| `POST` | `/api/students/:id/behavioral-notes` | Adds a behavioral note or flag | All Staff |
| `POST` | `/api/students/:id/quick-flag` | Attaches a quick behavioral warning | All Staff |
| `PATCH` | `/api/students/:id/behavioral-notes/:noteId/flag-status` | Updates flag status (e.g., Resolve) | All Staff |
| `DELETE` | `/api/students/:id/behavioral-notes/:noteId` | Deletes a note or flag | Admin, Head |

### Marks, Assessments & Approvals (`/api/marks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/marks` | Retrieves marks for class & course | All Staff |
| `POST` | `/api/marks/batch` | Saves student marks batch | Teachers, Staff |
| `POST` | `/api/marks/submit-review` | Submits grade roster to Review Queue | Teachers |
| `POST` | `/api/marks/review-decision` | Approves or rejects submitted marks | Dept Head, Coord |
| `GET` | `/api/marks/assessment-columns` | Fetches custom column config | All Staff |
| `PUT` | `/api/marks/assessment-columns` | Updates assessment weights/names | Dept Head, Admin |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/attendance` | Fetches attendance for class & date | All Staff |
| `POST` | `/api/attendance/batch` | Records attendance roster | Teachers, Staff |
| `GET` | `/api/attendance/summary` | Retrieves attendance KPI metrics | All Staff |

---

## 🛠️ Tech Stack & Key Libraries

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React (vector icons), Recharts (data visualizations), Motion (fluid UI transitions).
- **Backend**: Node.js, Express.js (TypeScript REST API), tsx (development execution), esbuild (production bundling).
- **Database**: Google Cloud Firestore with in-memory persistence fallback.
- **Tooling**: Vite, ESLint, TypeScript compiler.

---

## ⚙️ Prerequisites & Environment Setup

Before running the application locally, ensure you have:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (packaged with Node.js)
- **Git**: Installed on your operating system

### Environment Variables (`.env`)
Create a `.env` file in the root directory (optional for local mock mode):
```env
PORT=3000
NODE_ENV=development
```

---

## 🚀 How to Run Locally

### Step 1: Clone the Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd haymete-abrham-sunday-school
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Development Server
```bash
npm run dev
```

### Step 4: Access the Application
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 🔑 Default System Roles & Test Credentials

You can sign in with any of the following pre-configured test accounts or create new accounts through the Admin panel:

| Role | Email | Password | Primary Permissions |
|---|---|---|---|
| **System Admin** | `ashu@admin.edu` | *(any password)* | Full administrative access, audit logs, user management |
| **Department Head** | `bura@head.edu` | *(any password)* | Course definitions, assessment settings, grade approvals |
| **Coordinator** | `coordinator@amras.edu` | *(any password)* | Student enrollments, schedule creation, attendance oversight |
| **Teacher** | `teacher1@amras.edu` | *(any password)* | Course mark entry, attendance roster recording |
| **Student** | `student1@amras.edu` | *(any password)* | Personal report card, transcript, and attendance review |

*(Note: In the mock development environment, demo accounts accept any password for convenience. Custom accounts created in the Users view use their registered passwords.)*

---

## 📤 Version Control & GitHub Setup

To push this codebase to your personal or organizational GitHub account:

```bash
# 1. Initialize Git (if not already initialized)
git init

# 2. Add and commit all files
git add .
git commit -m "feat: complete Haymete Abrham Sunday School Academic Management System"

# 3. Link your remote GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# 4. Push code to main branch
git push -u origin main
```

---

## 🌐 Deployment Options

### Option 1: Render (Recommended)
1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Deploy and access your live URL.

### Option 2: Google Cloud Run (Containerized)
The app includes container build configurations compatible with Google Cloud Run:
```bash
# Build and submit the container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/haymete-portal

# Deploy to Cloud Run
gcloud run deploy haymete-portal \
  --image gcr.io/YOUR_PROJECT_ID/haymete-portal \
  --platform managed \
  --allow-unauthenticated \
  --port 3000
```

### Option 3: Railway
1. Go to [Railway.app](https://railway.app) and select **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Railway automatically detects `npm run build` and `npm start` from `package.json`.
3. Set the exposed port to `3000` in service settings.

---

## 👨‍💻 Developer Credits

Designed, architected, and developed by:

**Baye Nigusu (ብርሃነ መስቀል)**
- 📞 **Phone**: [+251 969 278258](tel:+251969278258)
- ✉️ **Email**: [bayenigusu4104@gmail.com](mailto:bayenigusu4104@gmail.com)
- 🔗 **LinkedIn**: [Baye Nigusu on LinkedIn](https://www.linkedin.com/in/baye-nigusu-711732338)

---
*Haymete Abrham Sunday School Academic Management System • ሐይመተ አብርሃም ሰንበት ትምህርት ቤት*
