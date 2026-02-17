# TaskFlow: Advanced Real-Time Task Collaboration Platform

A high-performance, real-time Kanban board application built with the PERN stack (PostgreSQL, Express, React, Node.js) and Socket.IO. Designed with Google's Material Design 3 principles for a premium, responsive user experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Coverage](https://img.shields.io/badge/tests-passing-green.svg)

## 📚 Documentation & Architecture

- **[System Architecture](docs/architecture.md)**: Detailed breakdown of Frontend, Backend, and Real-Time strategies.
- **[API Contract](docs/api_contract.md)**: Comprehensive API documentation.
- **[Database Schema](docs/database_schema.mermaid)**: ER Diagram of the PostgreSQL schema.

## 🚀 Key Features

### Core Functionality

- **Kanban Boards**: Drag-and-drop tasks and lists with smooth animations (`@hello-pangea/dnd`).
- **Real-Time Collaboration**: Instant updates for all board actions (move, create, delete, edit) across all connected clients using optimized Socket.IO events.
- **Team Management**: Create teams, invite members via email, and collaborate on shared boards.
- **Task Details**: Rich task management with descriptions, due dates, priority levels, labels, and assignees.

### Premium & Novel Features

- **Live Presence**: See who is currently viewing the board with real-time avatar indicators.
- **Threaded Comments**: Real-time conversation on tasks to discuss work in context.
- **Optimistic UI**: Instant feedback on actions (like moving a card) before the server confirms, with automatic rollback on error.
- **Board Favorites**: Star important boards for quick access.
- **Smart Notifications**: Non-intrusive toast notifications for remote changes (e.g., "A teammate moved a task").
- **Board Duplication**: One-click cloning of entire boards (including lists, tasks, and labels) to template workflows.
- **Activity Log**: detailed audit trail of all actions taken on the board.

## 🛠 Tech Stack

### Frontend

- **Framework**: React 18 (Vite)
- **State Management**: Zustand (with optimistic updates)
- **Styling**: Native CSS Variables (Material Design 3 tokens), Glassmorphism effects
- **Real-Time**: Socket.IO Client
- **Icons**: Lucide React
- **Drag & Drop**: @hello-pangea/dnd

### Backend

- **Runtime**: Node.js & Express
- **Database**: PostgreSQL (via `pg` driver)
- **Real-Time**: Socket.IO Server (with room-based broadcasting)
- **Authentication**: JWT (JSON Web Tokens) with secure HTTP-only cookies support
- **Email**: Nodemailer (Gmail SMTP)

## ⚡ Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database (e.g., local or Neon/Supabase)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hintro-task-app.git
cd hintro-task-app
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create a .env file
echo "PORT=5000" > .env
echo "DATABASE_URL=postgres://user:pass@host:5432/dbname" >> .env
echo "JWT_SECRET=your_super_secret_key" >> .env
echo "VITE_API_URL=http://localhost:5000" >> .env

# Start the server (Database tables will be auto-created)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to view the app.

## 🧪 Running Tests

The backend includes a suite of integration tests using `jest` and `supertest`.

```bash
cd backend
npm test
```

## 🔐 Support & Demo Credentials

To quickly test the application without signing up, use the following credentials:

- **Email**: `admin@hintro.com`
- **Password**: `password123`

_(Note: Data resets every 24 hours on the demo server)_

## 🎨 Design System

The UI follows **Material Design 3** guidelines:

- **Color**: Dynamic color system using CSS variables (`--md-sys-color-primary`, etc.)
- **Typography**: Google Sans (inter-like) font stack.
- **Elevation**: Subtle shadows and surface tonal variations.
- **Motion**: Smooth transitions for hover states, modals, and drag operations.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
