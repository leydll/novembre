// Setup global pour Jest - Mock console.error pour réduire le bruit dans les logs CI
// Les console.error sont toujours capturés par Jest mais ne polluent pas les logs
const originalConsoleError = console.error;

beforeAll(() => {
  // Mock console.error pour réduire le bruit dans les logs CI
  // Les erreurs sont toujours testées, mais ne s'affichent pas dans la console
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});
