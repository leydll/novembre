const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("../../controllers/authController");
const recipesController = require("../../controllers/recipesController");
const pool = require("../../config/database");

// Mock de la base de données
jest.mock("../../config/database", () => ({
  query: jest.fn(),
}));

// Helpers pour créer des objets req/res de test
const createReq = (overrides = {}) => ({
  body: {},
  params: {},
  user: {},
  ...overrides,
});

const createRes = ({ withStatus = false } = {}) => {
  const res = {};
  if (withStatus) {
    res.status = jest.fn(() => res);
  }
  // simulate Express cookie() chainable method used in authController
  res.cookie = jest.fn(() => res);
  res.json = jest.fn();
  return res;
};

describe("Tests unitaires - controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("authController", () => {
    describe("register", () => {
      test("retourne 400 si email déjà existant", async () => {
        pool.query.mockResolvedValueOnce([[{ id: 1, email: "test@example.com" }]]);

        const req = createReq({
          body: {
            username: "testuser",
            email: "test@example.com",
            password: "TestPwd_Valid_123!",
            consent: "true",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email déjà existant" });
      });

      test("crée un utilisateur avec succès", async () => {
        pool.query
          .mockResolvedValueOnce([[]]) // SELECT email -> vide
          .mockResolvedValueOnce([{ insertId: 1 }]) // INSERT
          .mockResolvedValueOnce([
            [{ id: 1, username: "testuser", email: "test@example.com", role: "user" }],
          ]); // SELECT nouvel utilisateur

        const req = createReq({
          body: {
            username: "testuser",
            email: "test@example.com",
            password: "TestPwd_Valid_123!",
            consent: "true",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Utilisateur créé",
            token: expect.any(String),
          }),
        );
      });

      test("retourne 500 en cas d'erreur BDD", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));

        const req = createReq({
          body: {
            username: "testuser",
            email: "test@example.com",
            password: "TestPwd_Valid_123!",
            consent: "true",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur" });
      });
    });

    describe("login", () => {
      test("retourne 400 si email ou mot de passe manquant", async () => {
        const req = createReq({ body: {} });
        const res = createRes({ withStatus: true });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email et mot de passe requis" });
      });

      test("retourne 400 si utilisateur non trouvé", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const req = createReq({
          body: {
            email: "test@example.com",
            password: "TestPwd_UserNotFound",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email ou mot de passe incorrect" });
      });

      test("retourne 400 si mot de passe incorrect", async () => {
        const hashed = await bcrypt.hash("TestPwd_Correct_123!", 10);
        pool.query.mockResolvedValueOnce([
          [{ id: 1, email: "test@example.com", password: hashed, role: "user" }],
        ]);

        const req = createReq({
          body: {
            email: "test@example.com",
            password: "TestPwd_Wrong_123",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email ou mot de passe incorrect" });
      });

      test("retourne 500 en cas d'erreur BDD", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));

        const req = createReq({
          body: {
            email: "test@example.com",
            password: "TestPwd_DbError_123",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur" });
      });
    });

    describe("me", () => {
      test("retourne les infos utilisateur", async () => {
        pool.query.mockResolvedValueOnce([
          [{ id: 1, username: "testuser", email: "test@example.com", role: "user" }],
        ]);

        const req = createReq({ user: { id: 1 } });
        const res = createRes();

        await authController.me(req, res);

        expect(res.json).toHaveBeenCalledWith({
          id: 1,
          username: "testuser",
          email: "test@example.com",
          role: "user",
        });
      });

      test("retourne 404 si utilisateur non trouvé", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const req = createReq({ user: { id: 999 } });
        const res = createRes({ withStatus: true });

        await authController.me(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
      });

      test("retourne 500 en cas d'erreur", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));

        const req = createReq({ user: { id: 1 } });
        const res = createRes({ withStatus: true });

        await authController.me(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur" });
      });
    });

    describe("updateMe", () => {
      test("retourne 400 si email déjà utilisé", async () => {
        pool.query.mockResolvedValueOnce([[{ id: 2 }]]); // existing email for other user

        const req = createReq({
          user: { id: 1 },
          body: {
            username: "newname",
            email: "existing@example.com",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.updateMe(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "Cet email est déjà utilisé par un autre compte",
        });
      });

      test("met à jour sans mot de passe", async () => {
        pool.query
          .mockResolvedValueOnce([[]]) // email disponible
          .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE
          .mockResolvedValueOnce([
            [{ id: 1, username: "newname", email: "new@example.com", role: "user" }],
          ]); // SELECT updated user

        const req = createReq({
          user: { id: 1 },
          body: {
            username: "newname",
            email: "new@example.com",
          },
        });
        const res = createRes();

        await authController.updateMe(req, res);

        expect(res.json).toHaveBeenCalledWith({
          id: 1,
          username: "newname",
          email: "new@example.com",
          role: "user",
        });
      });

      test("retourne 400 si mot de passe trop court", async () => {
        pool.query.mockResolvedValueOnce([[]]); // email disponible

        const req = createReq({
          user: { id: 1 },
          body: {
            username: "newname",
            email: "new@example.com",
            // mot de passe volontairement trop court (< 6 caractères pour la logique du contrôleur)
            password: "sh0rt",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.updateMe(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "Le mot de passe doit faire au moins 6 caractères",
        });
      });

      test("met à jour avec mot de passe", async () => {
        pool.query
          .mockResolvedValueOnce([[]]) // email disponible
          .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE
          .mockResolvedValueOnce([
            [{ id: 1, username: "newname", email: "new@example.com", role: "user" }],
          ]); // SELECT updated user

        const req = createReq({
          user: { id: 1 },
          body: {
            username: "newname",
            email: "new@example.com",
            password: "TestPwd_New_123!",
          },
        });
        const res = createRes();

        await authController.updateMe(req, res);

        expect(res.json).toHaveBeenCalledWith({
          id: 1,
          username: "newname",
          email: "new@example.com",
          role: "user",
        });
      });

      test("retourne 500 en cas d'erreur", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));

        const req = createReq({
          user: { id: 1 },
          body: {
            username: "newname",
            email: "new@example.com",
          },
        });
        const res = createRes({ withStatus: true });

        await authController.updateMe(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur" });
      });
    });
  });

  describe("recipesController", () => {
    describe("create", () => {
      test("crée une recette avec succès", async () => {
        pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        const req = createReq({
          body: {
            title: "Test Recipe",
            description: "Desc",
            image: "img.jpg",
            ingredients: "ing1, ing2",
            steps: "step1, step2",
            user_id: 1,
          },
        });
        const res = createRes({ withStatus: true });

        await recipesController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "recette créée", id: 1 });
      });

      test("retourne 500 en cas d'erreur", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));

        const req = createReq({
          body: {
            title: "Test Recipe",
            description: "Desc",
            image: "img.jpg",
            ingredients: "ing1, ing2",
            steps: "step1, step2",
            user_id: 1,
          },
        });
        const res = createRes({ withStatus: true });

        await recipesController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "erreur serveur" });
      });
    });

    describe("update", () => {
      test("met à jour une recette", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const req = createReq({
          params: { id: "1" },
          body: {
            title: "Updated",
            description: "Desc",
            image: "img.jpg",
            ingredients: "ing",
            steps: "steps",
          },
        });
        const res = createRes();

        await recipesController.update(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: "recette mise à jour" });
      });

      test("retourne 500 en cas d'erreur", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));

        const req = createReq({
          params: { id: "1" },
          body: {
            title: "Updated",
            description: "Desc",
            image: "img.jpg",
            ingredients: "ing",
            steps: "steps",
          },
        });
        const res = createRes({ withStatus: true });

        await recipesController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "erreur serveur" });
      });
    });

    describe("delete", () => {
      test("supprime une recette", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const req = createReq({ params: { id: "1" } });
        const res = createRes();

        await recipesController.delete(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: "recette supprimée" });
      });

      test("retourne 500 en cas d'erreur", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));

        const req = createReq({ params: { id: "1" } });
        const res = createRes({ withStatus: true });

        await recipesController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "erreur serveur" });
      });
    });

    describe("like / unlike / isLiked (mocks)", () => {
      test("like renvoie 201", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const req = createReq({ user: { id: 1 }, params: { id: "1" } });
        const res = createRes({ withStatus: true });

        await recipesController.like(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "like ajouté" });
      });

      test("unlike renvoie succès", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const req = createReq({ user: { id: 1 }, params: { id: "1" } });
        const res = createRes();

        await recipesController.unlike(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: "like retiré" });
      });

      test("isLiked renvoie liked: true / false", async () => {
        pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);
        const reqTrue = createReq({ user: { id: 1 }, params: { id: "1" } });
        const resTrue = createRes();
        await recipesController.isLiked(reqTrue, resTrue);
        expect(resTrue.json).toHaveBeenCalledWith({ liked: true });

        pool.query.mockResolvedValueOnce([[]]);
        const reqFalse = createReq({ user: { id: 1 }, params: { id: "1" } });
        const resFalse = createRes();
        await recipesController.isLiked(reqFalse, resFalse);
        expect(resFalse.json).toHaveBeenCalledWith({ liked: false });
      });
    });
  });
});


