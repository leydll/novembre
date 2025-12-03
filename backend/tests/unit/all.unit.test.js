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

// Helpers communs pour les tests
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

const createReq = (overrides = {}) => ({
  body: {},
  headers: {},
  user: {},
  ...overrides,
});

const createNext = () => jest.fn();

const testValidation = async (validations, body, shouldBeValid = true) => {
  const req = createReq({ body });
  const result = await runValidations(validations, req);
  expect(result.isEmpty()).toBe(shouldBeValid);
  return result;
};

describe("Tests unitaires", () => {
  describe("authMiddleware", () => {
    const SECRET = "test-secret";

    test("renvoie 401 si aucun token", () => {
      const req = createReq();
      const res = createResWithStatusAndBody();
      const next = createNext();

      authMiddleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: "Token manquant" });
      expect(next).not.toHaveBeenCalled();
    });

    test("attache req.user et appelle next avec un token valide", () => {
      process.env.JWT_SECRET = SECRET;
      const token = jwt.sign({ id: 123, role: "user" }, SECRET, { expiresIn: "1h" });
      const req = createReq({ headers: { authorization: `Bearer ${token}` } });
      const res = {
        status() { return this; },
        json() {},
      };
      const next = createNext();

      authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(123);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("adminMiddleware", () => {
    test("renvoie 403 si l'utilisateur n'est pas admin", () => {
      const req = createReq({ user: { role: "user" } });
      const res = createResWithStatusAndBody();
      const next = createNext();

      adminMiddleware(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ message: "Accès refusé" });
      expect(next).not.toHaveBeenCalled();
    });

    test("laisse passer si rôle admin", () => {
      const req = createReq({ user: { role: "admin" } });
      const res = {};
      const next = createNext();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("validators", () => {
    const validRegisterData = {
      username: "testuser",
      email: "test@example.com",
      password: "TestPwd_Valid_123!",
      consent: "true",
    };

    test("validateRegister signale un mot de passe trop faible", async () => {
      await testValidation(validateRegister, {
        username: "ab",
        email: "not-an-email",
        password: "TestPwd_Short",
        consent: "false",
      }, false);
    });

    test("validateRegister signale un username trop court", async () => {
      await testValidation(validateRegister, {
        ...validRegisterData,
        username: "ab",
      }, false);
    });

    test("validateRegister signale un username trop long", async () => {
      await testValidation(validateRegister, {
        ...validRegisterData,
        username: "a".repeat(51),
      }, false);
    });

    test("validateRegister signale un mot de passe sans assez de types de caractères", async () => {
      await testValidation(validateRegister, {
        ...validRegisterData,
        password: "onlylowercaseletters",
      }, false);
    });

    test("validateRegister accepte des données valides", async () => {
      await testValidation(validateRegister, validRegisterData, true);
    });

    test("validateCreateRecipe exige titre / ingredients / steps", async () => {
      const result = await testValidation(validateCreateRecipe, {}, false);
      const errors = result.array();
      const errorMessages = errors.map((e) => e.msg || e.message || "").join(" ");

      expect(errors.length).toBeGreaterThan(0);
      expect(errorMessages).toMatch(/titre|title/i);
      expect(errorMessages).toMatch(/ingrédients|ingredients/i);
      expect(errorMessages).toMatch(/étapes|steps/i);
    });

    test("validateCreateRecipe accepte des données valides", async () => {
      await testValidation(validateCreateRecipe, {
        title: "Test Recipe",
        ingredients: "Ingredient 1, Ingredient 2",
        steps: "Step 1, Step 2",
      }, true);
    });

    test("validateLogin exige email et password", async () => {
      await testValidation(validateLogin, {}, false);
    });

    test("validateLogin accepte des données valides", async () => {
      await testValidation(validateLogin, {
        email: "test@example.com",
        password: "TestPwd_Login_123",
      }, true);
    });

    test("validateUpdateProfile valide le mot de passe si fourni", async () => {
      await testValidation(validateUpdateProfile, {
        password: "Sh0rt!",
      }, false);
    });

    test("validateUpdateProfile accepte sans mot de passe", async () => {
      await testValidation(validateUpdateProfile, {
        username: "newname",
        email: "new@example.com",
      }, true);
    });

    test("validateUpdateProfile signale un mot de passe sans assez de types", async () => {
      await testValidation(validateUpdateProfile, {
        password: "onlylowercase123",
      }, false);
    });

    test("validateUpdateProfile accepte des données valides", async () => {
      await testValidation(validateUpdateProfile, {
        username: "newname",
        email: "new@example.com",
        password: "TestPwd_Valid_123!",
      }, true);
    });

    test("validateUpdateProfile accepte des données partielles", async () => {
      await testValidation(validateUpdateProfile, {
        username: "newname",
      }, true);
    });

    test("validateUpdateRecipe valide le titre si fourni", async () => {
      await testValidation(validateUpdateRecipe, {
        title: "ab",
      }, false);
    });

    test("validateUpdateRecipe accepte des données valides", async () => {
      await testValidation(validateUpdateRecipe, {
        title: "Updated Recipe",
        description: "New description",
      }, true);
    });
  });

  describe("authMiddleware - cas limites", () => {
    const SECRET = "test-secret";

    test("renvoie 401 si token invalide", () => {
      process.env.JWT_SECRET = SECRET;
      const req = createReq({ headers: { authorization: "Bearer invalid.token.here" } });
      const res = createResWithStatusAndBody();
      const next = createNext();

      authMiddleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: "Token invalide" });
      expect(next).not.toHaveBeenCalled();
    });

    test("renvoie 401 si authorization header mal formaté", () => {
      const req = createReq({ headers: { authorization: "InvalidFormat token" } });
      const res = createResWithStatusAndBody();
      const next = createNext();

      authMiddleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

