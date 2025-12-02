const adminMiddleware = require("../../middlewares/admin");

describe("adminMiddleware (unitaire)", () => {
  test("renvoie 403 si l'utilisateur n'est pas admin", () => {
    const req = { user: { role: "user" } };
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


