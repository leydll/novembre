/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middlewares/**/*.js",
    "routes/**/*.js",
    "app.js",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      // On garde 80% sur les lignes, fonctions et statements,
      // mais on met un seuil plus réaliste sur les branches,
      // car certains chemins d'erreur dépendant de la BDD sont difficiles à couvrir.
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};


