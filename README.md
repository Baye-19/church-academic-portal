# ⛪ Haymete Abrham Sunday School Academic Management System
### ሐይመተ አብርሃም ሰንበት ትምህርት ቤት የትምህርት ክፍል መረጃ ማኔጅመንት ሲስተም

A full-stack, multi-role academic management system built for **Haymete Abrham Sunday School (ሐይመተ አብርሃም ሰ/ት/ቤት)**. The system streamlines student registration under class levels, course assignment, customized mark entry, real-time result calculations, review workflows, audit logs, and multi-language support (English & Amharic).

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [What the Project Contains](#-what-the-project-contains)
3. [Key Features](#-key-features)
4. [Tech Stack & Architecture](#-tech-stack--architecture)
5. [How It Works](#-how-it-works)
6. [Prerequisites](#-prerequisites)
7. [How to Run Locally](#-how-to-run-locally)
8. [How to Push to GitHub (Step-by-Step)](#-how-to-push-to-github-step-by-step)
9. [How and Where to Deploy](#-how-and-where-to-deploy)
10. [Developer Credits](#-developer-credits)

---

## 🌟 Project Overview

The **Haymete Abrham Sunday School Academic Management System** is designed to digitize and manage the entire educational lifecycle of the Sunday school. It enables admins, department heads, academic coordinators, and teachers to work seamlessly together with role-based permissions.

---

## 📦 What the Project Contains

The project repository includes a complete full-stack TypeScript environment:

```text
├── server.ts                  # Express backend server (REST API & Vite dev server middleware)
├── src/
│   ├── main.tsx              # React app entry point
│   ├── App.tsx               # Main application container & view router
│   ├── index.css             # Tailwind CSS styles & design tokens
│   ├── types.ts              # TypeScript interface definitions (Users, Students, Courses, Marks, etc.)
│   ├── components/           # UI Components
│   │   ├── Dashboard.tsx     # Role-based dashboard with real-time statistics
│   │   ├── ClassesView.tsx   # Class levels & student registration per class
│   │   ├── CoursesView.tsx   # Course creation & teacher assignment
│   │   ├── AttendanceView.tsx # Student attendance tracking, daily registers & logs
│   │   ├── MarkEntryView.tsx # Editable mark spreadsheet with customizable assessment columns
│   │   ├── ResultsView.tsx   # Student mark breakdown, transcripts & rank analytics
│   │   ├── AllCoursesResultsTable.tsx # Comprehensive matrix view of student performance
│   │   ├── ReviewQueueView.tsx        # Mark submission review & approval workflow
│   │   ├── StudentsView.tsx  # Central student registry
│   │   ├── TeachersView.tsx  # Teacher management & subject assignments
│   │   ├── UsersView.tsx     # System user accounts & role management
│   │   ├── AuditLogView.tsx  # System activity logs
│   │   ├── SchedulesView.tsx # Class time schedules
│   │   ├── Header.tsx        # Top navigation & user profile dropdown
│   │   ├── Sidebar.tsx       # Role-aware navigation sidebar
│   │   ├── DeveloperBanner.tsx # Footer developer credits
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.tsx    # User authentication & active role session
│   │   └── LanguageContext.tsx# Bilingual i18n context (English <-> Amharic)
│   ├── locales/
│   │   └── i18n.ts           # Translation strings dictionary
│   ├── services/
│   │   └── api.ts            # Frontend API client service
│   └── utils/
│       └── academicYear.ts   # Dynamic academic year calculation engine
├── package.json              # Project dependencies & build/dev scripts
├── vite.config.ts            # Vite bundler configuration
└── tsconfig.json             # TypeScript compiler setup
```

---

## ✨ Key Features

### 1. 👥 Multi-Role Access Control
- **System Admin (`ADMIN`)**: Full administrative access to users, audit logs, classes, courses, and system settings.
- **Department Head (`DEPT_HEAD`)**: Manages teachers, courses, classes, marks configuration, and result approvals.
- **Academic Coordinator (`COORDINATOR`)**: Adds new courses, registers students under classes, manages schedules, and reviews mark submissions.
- **Teacher (`TEACHER`)**: Accesses assigned courses, enters student marks, and submits results for review.

### 2. 📅 Automated Academic Year Engine
- Automatically calculates the current academic year (e.g., `2025/2026`, `2026/2027`) based on the current calendar date without requiring manual database updates each year.

### 3. 🎓 Class Levels & Student Registration
- Allows coordinators, department heads, and admins to add and manage class levels (e.g., Class 1 to Class 8).
- Allows adding students directly under each specific class level card, making student lists instantly visible across all teacher, coordinator, and admin views.

### 4. 📝 Customizable Assessment Columns & Mark Entry
- Teachers can enter marks for students enrolled in their assigned subjects.
- **Customizable Headers**: Admins and Department Heads can customize mark column headers (e.g., rename *Quiz* to *Test*, or *Assignment* to *Homework*) and set custom maximum marks.
- **Custom Columns**: Add new assessment columns (e.g., *Attendance*, *Lab Work*, *Class Activity*).
- **Auto-Calculations**: Automatic real-time calculation of total score, grade letter (A+, A, B+, B, C+, C, D, F), GPA, and student class rank (1st, 2nd, 3rd, etc.).

### 5. 🌐 Bilingual Support (English & አማርኛ)
- Instant toggle between English and Amharic across the entire application interface.

---

## 🛠 Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons.
- **Backend**: Node.js, Express.js (REST API written in TypeScript).
- **Language**: TypeScript (End-to-End type safety).
- **Architecture**: Integrated Full-Stack Express server serving API endpoints (`/api/*`) and running Vite middleware in development mode.

---

## 💡 How It Works

1. **Development Mode**: `server.ts` boots up Express on port `3000`. In development, it attaches Vite's development middleware to enable instant hot reload for the React frontend while serving backend REST API requests on `/api/*`.
2. **Production Mode**: Running `npm run build` bundles the frontend into the `dist/` folder and compiles `server.ts` into `dist/server.cjs` using `esbuild`. Running `npm start` serves both the API endpoints and the static SPA frontend from the Node runtime.

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (comes with Node.js)
- **Git**: Installed on your system ([Download Git](https://git-scm.com/))

---

## 🚀 How to Run Locally

### Step 1: Clone or Download the Project
```bash
git clone <YOUR_REPOSITORY_URL>
cd <PROJECT_FOLDER_NAME>
```

### Step 2: Install Dependencies
Install all required npm packages:
```bash
npm install
```

### Step 3: Start the Development Server
Run the local full-stack server:
```bash
npm run dev
```

### Step 4: Open in Your Browser
Open your browser and navigate to:
```text
http://localhost:3000
```

### 🔑 Default Test Logins
You can switch users or log in using the following test credentials:
- **Admin**: `ashu@admin.edu` (Ashenafi Sentayehu)
- **Dept Head**: `bura@head.edu` (Biruk Wendemeneh)
- **Coordinator**: `coordinator@amras.edu`
- **Teacher**: `teacher1@amras.edu`

---

## 📤 How to Push to GitHub (Step-by-Step)

Follow these steps to upload this project to your GitHub account:

### Step 1: Initialize Git in the Project Folder
Open your terminal in the project root directory and run:
```bash
git init
```

### Step 2: Stage and Commit All Files
Add all files to Git and make your initial commit:
```bash
git add .
git commit -m "Initial commit - Haymete Abrham Sunday School Management System"
```

### Step 3: Create a New Repository on GitHub
1. Go to [GitHub](https://github.com) and log in.
2. Click the **"+"** icon in the top right corner and select **"New repository"**.
3. Name your repository (e.g., `haymete-abrham-sunday-school`).
4. Keep it **Public** or **Private**.
5. **Do NOT** check "Add a README file" or ".gitignore" (we already have them).
6. Click **"Create repository"**.

### Step 4: Link Your Local Repository to GitHub
Copy the repository URL provided by GitHub and run:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main
```

### Step 5: Push Your Code to GitHub
Push your local code to the GitHub remote repository:
```bash
git push -u origin main
```

---

## 🌐 How and Where to Deploy

Since this app is a full-stack Node.js + Express + React application, it can be deployed for free or low cost on several popular cloud platforms.

---

### Option 1: Render (Recommended & Easiest)
[Render](https://render.com) is ideal for hosting full-stack Node.js applications with minimal configuration.

1. Create a free account on [Render.com](https://render.com).
2. Click **"New +"** -> **"Web Service"**.
3. Connect your GitHub account and select your `haymete-abrham-sunday-school` repository.
4. Configure the Web Service settings:
   - **Name**: `haymete-abrham-sunday-school`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **"Create Web Service"**.
6. Render will build and deploy your application and provide a live HTTPS URL (e.g., `https://haymete-abrham-sunday-school.onrender.com`).

---

### Option 2: Railway
[Railway](https://railway.app) automatically detects Node.js projects and deploys them instantly.

1. Sign up on [Railway.app](https://railway.app).
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. Railway will automatically detect the `package.json` scripts (`npm run build` & `npm start`) and launch your app.
5. Generate a public domain under your project settings.

---

### Option 3: Google Cloud Run (Container Deployment)

You can also deploy using Docker to Google Cloud Run:

Create a `Dockerfile` at the root of the project:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Then build and deploy to Cloud Run:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/haymete-app
gcloud run deploy haymete-app --image gcr.io/YOUR_PROJECT_ID/haymete-app --platform managed --allow-unauthenticated --port 3000
```

---

## 👨‍💻 Developer Credits

Designed and Developed by:
**Baye Nigusu (ብርሃነ መስቀል)**
- 📞 **Phone**: [+251 969 278258](tel:+251969278258)
- ✉️ **Email**: [bayenigusu4104@gmail.com](mailto:bayenigusu4104@gmail.com)
- 🔗 **LinkedIn**: [Baye Nigusu on LinkedIn](https://www.linkedin.com/in/baye-nigusu-711732338)

---
*Academic Year Engine Active • Haymete Abrham Sunday School (ሐይመተ አብርሃም ሰ/ት/ቤት)*
