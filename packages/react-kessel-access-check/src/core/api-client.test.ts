import { server } from "../api-mocks/msw-server";



describe('api-client', () => {
  // MSW server setup
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
  test('placeholder test', () => {
    expect(true).toBe(true);
  });
});