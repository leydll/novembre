const request = require("supertest");
const app = require("../../app");

describe("Auth (intégration)", () => {
  test("POST /auth/register sans données -> 400", async () => {
    const res = await request(app).post("/auth/register").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("POST /auth/login sans données -> 400", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
