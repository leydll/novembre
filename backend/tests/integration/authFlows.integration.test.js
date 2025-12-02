const request = require("supertest");
const app = require("../../app");

describe("Auth flows (intégration)", () => {
  // On suppose qu'une base de test est disponible; ici on vérifie surtout le comportement HTTP.

  test("GET /auth/me sans token -> 401", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token manquant");
  });

  test("GET /auth/me avec token invalide -> 401", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer mauvais.token");
    expect(res.status).toBe(401);
  });

  test("PATCH /auth/me sans token -> 401", async () => {
    const res = await request(app).patch("/auth/me").send({ username: "NewName" });
    expect(res.status).toBe(401);
  });
});


