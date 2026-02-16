const request = require("supertest");
const app = require("../server");

// Mock Dependencies
jest.mock("../config/db", () => ({
  query: jest.fn(),
  initDB: jest.fn().mockResolvedValue(true),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}));

const db = require("../config/db");

describe("Auth Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should create a new user and return a token", async () => {
      // Mock DB
      db.query.mockImplementation((text, params) => {
        const sql = text.trim();
        if (sql.includes("SELECT * FROM users WHERE email"))
          return { rows: [] }; // No existing user
        if (sql.includes("INSERT INTO users"))
          return {
            rows: [{ id: 1, email: "test@example.com", name: "Test User" }],
          };
        if (sql.includes("invitations")) return { rows: [] }; // No pending invites
        return { rows: [] };
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should return 409 if user already exists", async () => {
      db.query.mockImplementation((text) => {
        if (text.includes("SELECT * FROM users WHERE email"))
          return { rows: [{ id: 1, email: "test@example.com" }] };
        return { rows: [] };
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(409); // Controller returns 409 for duplicate
      expect(res.body.message).toBe("Email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user and return token", async () => {
      db.query.mockImplementation((text) => {
        if (text.includes("SELECT * FROM users WHERE email")) {
          return {
            rows: [
              {
                id: 1,
                email: "test@example.com",
                password: "hashed_password",
                name: "Test User",
              },
            ],
          };
        }
        return { rows: [] };
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
    });
  });
});
