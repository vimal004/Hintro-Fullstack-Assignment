# API Documentation

Base URL: `http://localhost:5000` (Local) or `https://hintro-backend.vercel.app` (Production)

## Authentication

### `POST /api/auth/register`

Creates a new user account.

- **Body:** `{ name, email, password }`
- **Response:** `{ token, user: { id, name, email, avatar } }`

### `POST /api/auth/login`

Authenticates a user.

- **Body:** `{ email, password }`
- **Response:** `{ token, user: { id, name, email, avatar } }`

---

## Boards

### `GET /api/boards`

Fetches all boards for the authenticated user.

- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (optional search term)
- **Response:** `{ boards: [ ... ], total, page, limit }`

### `POST /api/boards`

Creates a new board.

- **Body:** `{ title, description, color }`
- **Response:** `{ id, title, description, color, created_at, members: [ ... ] }`

### `GET /api/boards/:id`

Fetches full board details, including lists, tasks, and members.

- **Response:** `{ id, title, members: [...], lists: [{ id, title, tasks: [...] }] }`

### `PUT /api/boards/:id`

Updates board details.

- **Body:** `{ title, description, color }`
- **Response:** `{ id, title, description, color, updated_at }`

### `DELETE /api/boards/:id`

Deletes a board.

- **Response:** `{ message: "Board deleted successfully" }`

---

## Lists

### `POST /api/lists`

Creates a new list on a board.

- **Body:** `{ boardId, title, position }`
- **Response:** `{ id, board_id, title, position }`

### `PUT /api/lists/:id`

Updates a list (e.g., rename).

- **Body:** `{ title }`
- **Response:** `{ id, title, updated_at }`

### `DELETE /api/lists/:id`

Deletes a list and all its tasks.

- **Response:** `{ message: "List deleted" }`

### `PUT /api/lists/:id/reorder`

Updates the list position.

- **Body:** `{ position }`
- **Response:** `{ message: "List reordered" }`

---

## Tasks

### `POST /api/tasks`

Creates a new task.

- **Body:** `{ listId, title, description, dueDate, priority, assignees, labels }`
- **Response:** `{ id, list_id, title, ... }`

### `PUT /api/tasks/:id`

Updates task details.

- **Body:** `{ title, description, dueDate, priority, assignees, labels }`
- **Response:** `{ id, title, ... }`

### `PUT /api/tasks/:id/move`

Moves a task to a different list or position.

- **Body:** `{ listId, position }`
- **Response:** `{ message: "Task moved" }`

### `DELETE /api/tasks/:id`

Deletes a task.

- **Response:** `{ message: "Task deleted" }`

---

## Teams (Collaboration)

### `POST /api/teams`

Creates a new team.

- **Body:** `{ name, description }`
- **Response:** `{ id, name, members: [current_user] }`

### `POST /api/teams/:id/invite`

Invites a user to a team via email.

- **Body:** `{ email }`
- **Response:** `{ message: "Invitation sent" }`

---

## Real-Time Events (Socket.IO)

- **Namespace:** `/`
- **Rooms:** `board:{boardId}`, `user:{userId}`

### Server -> Client Events

- `board:updated`: Board metadata changed
- `list:created`: New list added to current board
- `task:moved`: Task moved between lists/positions
- `presence:joined`: A user started viewing the board
- `typing:start`: User is typing in a field
