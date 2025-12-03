const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");

describe("Tests d'intégration", () => {
  describe("Auth", () => {
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

    test("POST /auth/login avec email invalide -> 400", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "not-an-email",
        password: "TestPwd_InvalEmail_123",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("POST /auth/login sans mot de passe -> 400", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "test@example.com",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("Auth flows", () => {
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

  describe("Recipes", () => {
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

  describe("Recipes CRUD", () => {
    const SECRET = "test-secret";
    let adminToken;
    let userToken;

    beforeAll(() => {
      process.env.JWT_SECRET = SECRET;
      adminToken = jwt.sign({ id: 1, role: "admin" }, SECRET);
      userToken = jwt.sign({ id: 2, role: "user" }, SECRET);
    });

    test("GET /recipes retourne une liste", async () => {
      const res = await request(app).get("/recipes");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /recipes/:id retourne 404 si recette inexistante", async () => {
      const res = await request(app).get("/recipes/99999");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("recette non trouvée");
    });

    test("GET /recipes/:id avec ID invalide -> 404 ou 500", async () => {
      const res = await request(app).get("/recipes/abc");
      // Peut être 404 ou 500 selon la gestion d'erreur de la BDD
      expect([404, 500]).toContain(res.status);
    });

    test("POST /recipes avec token user (non admin) -> 403", async () => {
      const res = await request(app)
        .post("/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "Test", ingredients: "X", steps: "Y" });
      expect(res.status).toBe(403);
    });

    test("POST /recipes avec token admin mais données invalides -> 400", async () => {
      const res = await request(app)
        .post("/recipes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({}); // Données vides
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("DELETE /recipes/:id sans token -> 401", async () => {
      const res = await request(app).delete("/recipes/1");
      expect(res.status).toBe(401);
    });

    test("DELETE /recipes/:id avec token user (non admin) -> 403", async () => {
      const res = await request(app)
        .delete("/recipes/1")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("Recipes likes", () => {
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

    test("DELETE /recipes/:id/like sans token -> 401", async () => {
      const res = await request(app).delete("/recipes/1/like");
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

    test("GET /recipes/:id/like avec token valide -> passe l'auth (status != 401)", async () => {
      const res = await request(app)
        .get("/recipes/1/like")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).not.toBe(401);
    });

    test("DELETE /recipes/:id/like avec token valide -> passe l'auth (status != 401)", async () => {
      const res = await request(app)
        .delete("/recipes/1/like")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).not.toBe(401);
    });
  });

  describe("Recipes - recherche", () => {
    test("GET /recipes avec paramètre q -> 200", async () => {
      const res = await request(app).get("/recipes?q=test");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("Auth - cas limites", () => {
    const SECRET = "test-secret";
    let validToken;

    beforeAll(() => {
      process.env.JWT_SECRET = SECRET;
      validToken = jwt.sign({ id: 1, role: "user" }, SECRET);
    });

    test("GET /auth/me avec token valide mais utilisateur inexistant -> 404 ou 500", async () => {
      // Token valide mais l'utilisateur n'existe pas en BDD
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      // Peut être 404 si l'utilisateur n'existe pas, ou 500 si erreur BDD
      expect([404, 500]).toContain(res.status);
    });

    test("PATCH /auth/me avec token valide mais données invalides -> 400", async () => {
      const res = await request(app)
        .patch("/auth/me")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          email: "not-an-email", // Email invalide
        });

      expect(res.status).toBe(400);
    });

    test("PATCH /auth/me avec token valide et mot de passe trop court -> 400", async () => {
      const res = await request(app)
        .patch("/auth/me")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          username: "newname",
          email: "new@example.com",
          // Mot de passe trop court pour la règle (min 12 caractères)
          password: "Sh0rt!", // 6 caractères seulement
        });

      expect(res.status).toBe(400);
    });
  });

  describe("Recipes - validation", () => {
    const SECRET = "test-secret";
    let adminToken;
    let userToken;

    beforeAll(() => {
      process.env.JWT_SECRET = SECRET;
      adminToken = jwt.sign({ id: 1, role: "admin" }, SECRET);
      userToken = jwt.sign({ id: 2, role: "user" }, SECRET);
    });

    test("PATCH /recipes/:id avec token admin mais données invalides -> 400", async () => {
      const res = await request(app)
        .patch("/recipes/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "ab", // Trop court (min 3 caractères)
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test("PATCH /recipes/:id sans token -> 401", async () => {
      const res = await request(app)
        .patch("/recipes/1")
        .send({ title: "Nouveau titre" });
      expect(res.status).toBe(401);
    });

    test("PATCH /recipes/:id avec token user (non admin) -> 403", async () => {
      const res = await request(app)
        .patch("/recipes/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "Nouveau titre" });
      expect(res.status).toBe(403);
    });
  });

  describe("Admin - gestion utilisateurs", () => {
    const SECRET = "test-secret";
    let adminToken;

    beforeAll(() => {
      process.env.JWT_SECRET = SECRET;
      adminToken = jwt.sign({ id: 1, role: "admin" }, SECRET);
    });

    test("GET /auth/users sans token -> 401", async () => {
      const res = await request(app).get("/auth/users");
      expect(res.status).toBe(401);
    });

    test("GET /auth/users avec token user (non admin) -> 403", async () => {
      const userToken = jwt.sign({ id: 2, role: "user" }, SECRET);
      const res = await request(app)
        .get("/auth/users")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    test("DELETE /auth/users/:id sans token -> 401", async () => {
      const res = await request(app).delete("/auth/users/2");
      expect(res.status).toBe(401);
    });

    test("DELETE /auth/users/:id avec token user (non admin) -> 403", async () => {
      const userToken = jwt.sign({ id: 2, role: "user" }, SECRET);
      const res = await request(app)
        .delete("/auth/users/3")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    test("DELETE /auth/users/:id avec token admin mais tentative de supprimer soi-même -> 400", async () => {
      const res = await request(app)
        .delete("/auth/users/1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("propre compte");
    });
  });

  describe("Admin - description du site", () => {
    const SECRET = "test-secret";
    let adminToken;

    beforeAll(() => {
      process.env.JWT_SECRET = SECRET;
      adminToken = jwt.sign({ id: 1, role: "admin" }, SECRET);
    });

    test("GET /auth/site/description sans token -> 200 (publique)", async () => {
      const res = await request(app).get("/auth/site/description");
      expect(res.status).toBe(200);
      expect(res.body.description).toBeDefined();
    });

    test("PATCH /auth/site/description sans token -> 401", async () => {
      const res = await request(app)
        .patch("/auth/site/description")
        .send({ description: "Nouvelle description" });
      expect(res.status).toBe(401);
    });

    test("PATCH /auth/site/description avec token user (non admin) -> 403", async () => {
      const userToken = jwt.sign({ id: 2, role: "user" }, SECRET);
      const res = await request(app)
        .patch("/auth/site/description")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ description: "Nouvelle description" });
      expect(res.status).toBe(403);
    });

    test("PATCH /auth/site/description sans description -> 400", async () => {
      const res = await request(app)
        .patch("/auth/site/description")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});

