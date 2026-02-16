const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");

// Mock Dependencies
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn((token, secret) => {
    if (token === "valid_token") {
      return { id: "usr_1", email: "test@example.com" };
    }
    throw new Error("Invalid token");
  }),
}));

const db = require("../config/db");

// Mock DB
jest.mock("../config/db", () => ({
  query: jest.fn(),
  initDB: jest.fn().mockResolvedValue(true),
}));

describe("Board Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/boards", () => {
    it("should return 200 and list of boards", async () => {
      // Mock DB: Smart implementation based on query content
      db.query.mockImplementation((text, params) => {
        const sql = text.trim();

        // Count boards
        if (sql.startsWith("SELECT COUNT(DISTINCT b.id)")) {
          return { rows: [{ total: 1 }] };
        }

        // List boards
        if (sql.startsWith("SELECT b.*")) {
          return {
            rows: [
              {
                id: "brd_1",
                title: "Test Board",
                members: [],
                is_favorited: false,
              },
            ],
          };
        }

        // Create Board
        if (sql.startsWith("INSERT INTO boards")) {
          return {
            rows: [
              {
                id: "brd_new",
                title: "New Board",
                created_by: "usr_1",
                team_id: null,
              },
            ],
          };
        }

        // Find Board by ID
        if (sql.startsWith("SELECT * FROM boards WHERE id")) {
          return {
            rows: [
              {
                id: "brd_new",
                title: "New Board",
                created_by: "usr_1",
                team_id: null,
              },
            ],
          };
        }

        // Find Members
        if (
          sql.includes("FROM users u") &&
          sql.includes("LEFT JOIN board_members bm")
        ) {
          return { rows: [] };
        }

        // Find Labels
        if (sql.startsWith("SELECT * FROM labels")) {
          return { rows: [] };
        }

        // Find Lists
        if (sql.startsWith("SELECT * FROM lists")) {
          return { rows: [] };
        }

        // Create Activity
        if (sql.startsWith("INSERT INTO activities")) {
          return { rows: [{ id: 1 }] };
        }

        return { rows: [] };
      });

      const res = await request(app)
        .get("/api/boards")
        .set("Authorization", "Bearer valid_token");

      expect(res.statusCode).toEqual(200);
      expect(res.body.boards).toHaveLength(1);
      expect(res.body.boards[0].title).toBe("Test Board");
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .get("/api/boards")
        .set("Authorization", "Bearer invalid_token");

      expect(res.statusCode).toEqual(401); // Updated expectation from 403 to 401
    });
  });

  describe("POST /api/boards", () => {
    it("should create user board successfully", async () => {
      // Setup mock is handled by the mockImplementation above if specific,
      // but since we are in a new describe block, we might need to reset or ensure implementation persists.
      // However, jest.clearAllMocks() in beforeEach clears call history, but implementation remains?
      // No, mockResolvedValueOnce stacks are cleared. mockImplementation persists if set on the mock function.

      // Let's rely on the mockImplementation being set inside the test or beforeEach.
      // Since I set it inside the previous `it`, it won't persist if I don't move it to beforeEach.

      // Moving the mock setup to beforeEach makes sense.
      // However, to keep this edit simple, I will just replicate the setup here using mockImplementation again.

      db.query.mockImplementation((text) => {
        const sql = text.trim();
        if (sql.includes("INSERT INTO boards"))
          return {
            rows: [{ id: "brd_new", title: "New Board", created_by: "usr_1" }],
          };
        if (sql.includes("INSERT INTO board_members")) return { rows: [] };
        if (sql.includes("INSERT INTO activities")) return { rows: [] };
        if (sql.includes("SELECT * FROM boards WHERE id"))
          return {
            rows: [
              {
                id: "brd_new",
                title: "New Board",
                created_by: "usr_1",
                team_id: null,
              },
            ],
          };
        if (sql.includes("FROM users u")) return { rows: [] }; // Members
        if (sql.includes("SELECT * FROM labels")) return { rows: [] };
        if (sql.includes("SELECT * FROM lists")) return { rows: [] };
        return { rows: [] };
      });

      const res = await request(app)
        .post("/api/boards")
        .send({ title: "New Board" })
        .set("Authorization", "Bearer valid_token");

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("id", "brd_new");
    });
  });
});
