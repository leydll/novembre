const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");

describe("Recipes likes (intégration)", () => {
  const SECRET = "test-secret";
  const baseUser = { id: 1, role: "user" };
  const token = jwt.sign(baseUser, SECRET);

  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  test("POST /recipes/:id/like sans token -> 401", async () => {
    const res = await request(app).post("/recipes/1/like");
    expect(res.status).toBe(401);
  });

  test("GET /recipes/:id/like sans token -> 401", async () => {
    const res = await request(app).get("/recipes/1/like");
    expect(res.status).toBe(401);
  });

  test("POST /recipes/:id/like avec token valide -> passe l'auth (status != 401)", async () => {
    const res = await request(app)
      .post("/recipes/1/like")
      .set("Authorization", `Bearer ${token}`);

    // Si l'auth passe, on ne devrait pas avoir 401
    // (peut être 201 si la BDD fonctionne, ou 500 si la BDD n'est pas configurée, mais pas 401)
    expect(res.status).not.toBe(401);
  });
});


