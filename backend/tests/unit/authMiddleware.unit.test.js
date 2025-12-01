const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middlewares/authMiddleware");

describe("authMiddleware (unitaire)", () => {
  const SECRET = "test-secret";

  test("renvoie 401 si aucun token", () => {
    const req = { headers: {} };
    const res = {
      statusCode: 0,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      },
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Token manquant" });
    expect(next).not.toHaveBeenCalled();
  });

  test("attache req.user et appelle next avec un token valide", () => {
    // on force la même clé que celle utilisée dans le middleware
    process.env.JWT_SECRET = SECRET;

    const token = jwt.sign({ id: 123, role: "user" }, SECRET, { expiresIn: "1h" });

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res = {
      status() {
        // ne devrait pas être appelé dans ce test
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
}
);
