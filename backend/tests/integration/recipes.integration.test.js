const request = require("supertest");
const app = require("../../app");

describe("Recipes (intégration)", () => {
  test("POST /recipes sans token -> 401", async () => {
    const res = await request(app)
      .post("/recipes")
      .send({ title: "Test", ingredients: "X", steps: "Y" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token manquant");
  });

  test("PATCH /recipes/:id sans token -> 401", async () => {
    const res = await request(app)
      .patch("/recipes/1")
      .send({ title: "Nouveau titre" });

    expect(res.status).toBe(401);
  });
});
