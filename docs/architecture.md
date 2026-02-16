# System Architecture & Scalability

## 1. Frontend Architecture

The Frontend is a Single Page Application (SPA) built with **React** (v18) using **Vite** for fast HMR and optimized builds.

### Key Decisions

- **State Management (Zustand):** Chosen over Redux for its minimalistic API and built-in support for transient updates (optimistic UI). We use separate stores for:
  - `authStore`: User session & authentication state.
  - `boardStore`: Board data, lists, tasks, and optimistic updates.
  - `socketStore`: Real-time connection management.
- **Component Design:** Follows Atomic Design principles.
  - **Atoms:** Buttons, Inputs, Avatars.
  - **Molecules:** TaskCard, BoardList.
  - **Organisms:** BoardView, Sidebar.
  - **Pages:** Views that assemble organisms (BoardPage, Dashboard).
- **Styling:** **CSS Modules** & **CSS Variables** implementing Material Design 3 tokens for a consistent, theme-able UI without the bloat of large CSS libraries.
- **Performance:**
  - **Code Splitting:** Route-based splitting using React `lazy/Suspense`.
  - **Memoization:** Extensive use of `React.memo` and `useCallback` to prevent unnecessary re-renders during drag operations.
  - **Optimistic UI:** Local state is updated immediately on drag/drop, reverted only on server error.

## 2. Backend Architecture

The Backend is a RESTful API built with **Node.js** & **Express**.

### Key Decisions

- **Layered Architecture:**
  - **Routes:** API endpoint definitions.
  - **Controllers:** Request handling & input validation.
  - **Services/Models:** Business logic & database interaction.
  - **Config/Utils:** Database connection & shared helpers.
- **Database Access:** Uses `pg` (node-postgres) with raw SQL queries for maximum control and performance, avoiding ORM overhead for complex joins.
- **Authentication:** Stateless **JWT** (JSON Web Tokens) stored in HTTP-Only cookies for security (XSS protection).
- **Error Handling:** Centralized error handling middleware.

## 3. Real-Time Synchronization Strategy

Real-time features are powered by **Socket.IO**.

### Strategy: "Server-Authoritative Room-Based Broadcasting"

1. **Rooms:**
   - Every board has a unique room: `board:{boardId}`.
   - Every user has a unique room: `user:{userId}`.
2. **Action Flow:**
   - Client performs action (e.g., move task).
   - Client optimistically updates UI.
   - Client sends REST request to Server.
   - Server validates & persists to DB.
   - Server broadcasts event (e.g., `task:moved`) to `board:{boardId}` via Socket.IO.
   - Other clients in the room receive event & update their state.
   - **Conflict Resolution:** Last-write-wins policy for simple fields. Complex conflicts (e.g., list reordering) rely on the server's definitive state.

## 4. Scalability Considerations

### Database (PostgreSQL)

- **Indexing:** Critical columns (`board_id`, `list_id`, `user_id`, `email`) are indexed for fast lookups.
- **Connection Pooling:** Uses `pg.Pool` to manage connections efficiently, crucial for high-concurrency environments like Vercel serverless functions.
- **Future Growth:**
  - **Read Replicas:** Separate read/write operations for high-traffic boards.
  - **Partitioning:** Partition `activity_logs` by time or `tasks` by `board_id` as data grows.

### Backend (Node.js)

- **Stateless:** The REST API is stateless, allowing horizontal scaling behind a load balancer.
- **Socket.IO Scaling:**
  - Standard Socket.IO uses in-memory adapters.
  - **For Scale:** Use **Redis Adapter** to sync events across multiple server instances (e.g., using `socket.io-redis`). This allows users connected to Server A to interact with users on Server B.

### Frontend

- **Bundle Size:** Tree-shaking and lazy loading keep initial load times low.
- **CDN:** Static assets served via Vercel's global Edge Network.
