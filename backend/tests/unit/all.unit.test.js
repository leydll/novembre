const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminMiddleware = require("../../middlewares/admin");
const {
  validateRegister,
  validateCreateRecipe,
  validateLogin,
  validateUpdateProfile,
  validateUpdateRecipe,
} = require("../../middlewares/validators");
const { validationResult } = require("express-validator");

// Helpers communs pour les tests de middlewares
const runValidations = async (validations, req) => {
  for (const v of validations) {
    await v(req, {}, () => {});
  }
  return validationResult(req);
};

const createResWithStatusAndBody = () => {
  const res = {
    statusCode: 0,
    body: null,
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

describe("Tests unitaires", () => {
  describe("authMiddleware", () => {
    const SECRET = "test-secret";

    test("renvoie 401 si aucun token", () => {
      const req = { headers: {} };
      const res = createResWithStatusAndBody();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: "Token manquant" });
      expect(next).not.toHaveBeenCalled();
    });

    test("attache req.user et appelle next avec un token valide", () => {
      process.env.JWT_SECRET = SECRET;

      const token = jwt.sign({ id: 123, role: "user" }, SECRET, { expiresIn: "1h" });

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const res = {
        status() {
          return this;
        },
        json() {},
      };
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(123);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("adminMiddleware", () => {
    test("renvoie 403 si l'utilisateur n'est pas admin", () => {
      const req = { user: { role: "user" } };
      const res = createResWithStatusAndBody();
      const next = jest.fn();

      adminMiddleware(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ message: "Accès refusé" });
      expect(next).not.toHaveBeenCalled();
    });

    test("laisse passer si rôle admin", () => {
      const req = { user: { role: "admin" } };
      const res = {};
      const next = jest.fn();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("validators", () => {
    test("validateRegister signale un mot de passe trop faible", async () => {
      const req = {
        body: {
          username: "ab",
          email: "not-an-email",
          password: "TestPwd_Short",
          consent: "false",
        },
      };

      const result = await runValidations(validateRegister, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateRegister signale un username trop court", async () => {
      const req = {
        body: {
          username: "ab",
          email: "test@example.com",
          password: "TestPwd_Valid_123!",
          consent: "true",
        },
      };

      const result = await runValidations(validateRegister, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateRegister signale un username trop long", async () => {
      const req = {
        body: {
          username: "a".repeat(51),
          email: "test@example.com",
          password: "TestPwd_Valid_123!",
          consent: "true",
        },
      };

      const result = await runValidations(validateRegister, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateRegister signale un mot de passe sans assez de types de caractères", async () => {
      const req = {
        body: {
          username: "testuser",
          email: "test@example.com",
          password: "onlylowercaseletters", // Pas assez de types
          consent: "true",
        },
      };

      const result = await runValidations(validateRegister, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateRegister accepte des données valides", async () => {
      const req = {
        body: {
          username: "testuser",
          email: "test@example.com",
          password: "TestPwd_Valid_123!",
          consent: "true",
        },
      };

      const result = await runValidations(validateRegister, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("validateCreateRecipe exige titre / ingredients / steps", async () => {
      const req = { body: {} };

      const result = await runValidations(validateCreateRecipe, req);
      const errors = result.array();

      // Vérifier que des erreurs existent
      expect(errors.length).toBeGreaterThan(0);

      // Vérifier que les champs requis sont présents dans les erreurs
      const fields = errors.map((e) => e.path || e.param).filter(Boolean);
      expect(fields.length).toBeGreaterThan(0);

      // Vérifier que les messages d'erreur contiennent les champs requis
      const errorMessages = errors.map((e) => e.msg || e.message || "").join(" ");
      expect(errorMessages).toMatch(/titre|title/i);
      expect(errorMessages).toMatch(/ingrédients|ingredients/i);
      expect(errorMessages).toMatch(/étapes|steps/i);
    });

    test("validateCreateRecipe accepte des données valides", async () => {
      const req = {
        body: {
          title: "Test Recipe",
          ingredients: "Ingredient 1, Ingredient 2",
          steps: "Step 1, Step 2",
        },
      };

      const result = await runValidations(validateCreateRecipe, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("validateLogin exige email et password", async () => {
      const req = { body: {} };

      const result = await runValidations(validateLogin, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateLogin accepte des données valides", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "TestPwd_Login_123",
        },
      };

      const result = await runValidations(validateLogin, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("validateUpdateProfile valide le mot de passe si fourni", async () => {
      const req = {
        body: {
          // Mot de passe trop court pour la règle (min 12 caractères)
          password: "Sh0rt!", // 6 caractères seulement
        },
      };

      const result = await runValidations(validateUpdateProfile, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateUpdateProfile accepte sans mot de passe", async () => {
      const req = {
        body: {
          username: "newname",
          email: "new@example.com",
        },
      };

      const result = await runValidations(validateUpdateProfile, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("validateUpdateProfile signale un mot de passe sans assez de types", async () => {
      const req = {
        body: {
          password: "onlylowercase123", // Pas assez de types (pas de majuscule ni spécial)
        },
      };

      const result = await runValidations(validateUpdateProfile, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateUpdateProfile accepte des données valides", async () => {
      const req = {
        body: {
          username: "newname",
          email: "new@example.com",
          password: "TestPwd_Valid_123!",
        },
      };

      const result = await runValidations(validateUpdateProfile, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("validateUpdateProfile accepte des données partielles", async () => {
      const req = {
        body: {
          username: "newname",
        },
      };

      const result = await runValidations(validateUpdateProfile, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("validateUpdateRecipe valide le titre si fourni", async () => {
      const req = {
        body: {
          title: "ab", // Trop court
        },
      };

      const result = await runValidations(validateUpdateRecipe, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("validateUpdateRecipe accepte des données valides", async () => {
      const req = {
        body: {
          title: "Updated Recipe",
          description: "New description",
        },
      };

      const result = await runValidations(validateUpdateRecipe, req);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe("authMiddleware - cas limites", () => {
    const SECRET = "test-secret";

    test("renvoie 401 si token invalide", () => {
      process.env.JWT_SECRET = SECRET;

      const req = {
        headers: {
          authorization: "Bearer invalid.token.here",
        },
      };

      const res = createResWithStatusAndBody();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: "Token invalide" });
      expect(next).not.toHaveBeenCalled();
    });

    test("renvoie 401 si authorization header mal formaté", () => {
      const req = {
        headers: {
          authorization: "InvalidFormat token",
        },
      };

      const res = createResWithStatusAndBody();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

