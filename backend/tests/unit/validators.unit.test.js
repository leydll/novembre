const { validateRegister, validateCreateRecipe } = require("../../middlewares/validators");
const { validationResult } = require("express-validator");

// Helper pour exécuter un tableau de middlewares de validation
const runValidations = async (validations, req) => {
  for (const v of validations) {
    await v(req, {}, () => {});
  }
  return validationResult(req);
};

describe("validators (unitaire)", () => {
  test("validateRegister signale un mot de passe trop faible", async () => {
    const req = {
      body: {
        username: "ab",
        email: "not-an-email",
        password: "short",
        consent: "false",
      },
    };

    const result = await runValidations(validateRegister, req);
    expect(result.isEmpty()).toBe(false);
  });

  test("validateCreateRecipe exige titre / ingredients / steps", async () => {
    const req = { body: {} };

    const result = await runValidations(validateCreateRecipe, req);
    const errors = result.array();

    const fields = errors.map((e) => e.param);
    expect(fields).toContain("title");
    expect(fields).toContain("ingredients");
    expect(fields).toContain("steps");
  });
});


