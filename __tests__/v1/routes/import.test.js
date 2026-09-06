// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

jest.mock('../../../src/v1/budget', () => ({
  importBudgetData: jest.fn(),
}));

describe('Import Routes', () => {
  let mockRouter;
  let mockReq;
  let mockRes;
  let mockNext;
  let handlers;
  let registrations;
  let importBudgetData;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    handlers = {};
    registrations = {};

    // The import route registers middleware alongside its handler, so keep every argument
    // and treat the last one as the handler
    mockRouter = {
      post: jest.fn((path, ...rest) => {
        handlers[`POST ${path}`] = rest[rest.length - 1];
        registrations[`POST ${path}`] = rest;
      }),
    };

    mockReq = {
      params: {},
      query: {},
      body: Buffer.from([1, 2, 3]),
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    ({ importBudgetData } = require('../../../src/v1/budget'));
    importBudgetData.mockResolvedValue({
      id: 'My-Finances-5e3e565',
      syncId: 'a232c399-e28c-4a51-96be-d1183129d1f9',
      name: 'Actual Bench Test',
    });
  });

  function loadRoute() {
    require('../../../src/v1/routes/import')(mockRouter);
    return handlers['POST /budgets/import'];
  }

  describe('registration', () => {
    it('should register POST /budgets/import', () => {
      loadRoute();
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/import',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should apply the api key guard, since the route is outside the /budgets/:budgetSyncId prefix', () => {
      loadRoute();
      const { authorizeRequest } = require('../../../src/v1/middlewares/api-key-authorization');
      expect(registrations['POST /budgets/import'][0]).toBe(authorizeRequest);
    });
  });

  describe('POST /budgets/import', () => {
    it('should import the budget and return its new sync id', async () => {
      const handler = loadRoute();

      await handler(mockReq, mockRes, mockNext);

      expect(importBudgetData).toHaveBeenCalledWith(mockReq.body, {
        type: 'actual',
        filename: undefined,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          id: 'My-Finances-5e3e565',
          syncId: 'a232c399-e28c-4a51-96be-d1183129d1f9',
          name: 'Actual Bench Test',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should default the type to actual', async () => {
      const handler = loadRoute();

      await handler(mockReq, mockRes, mockNext);

      expect(importBudgetData).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'actual' }));
    });

    it.each(['ynab4', 'ynab5'])('should forward the %s type and filename', async (type) => {
      const handler = loadRoute();
      mockReq.query = { type, filename: 'budget.json' };

      await handler(mockReq, mockRes, mockNext);

      expect(importBudgetData).toHaveBeenCalledWith(mockReq.body, { type, filename: 'budget.json' });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should pass the raw body as a Buffer, never as a path string', async () => {
      const handler = loadRoute();

      await handler(mockReq, mockRes, mockNext);

      const [fileBuffer] = importBudgetData.mock.calls[0];
      expect(Buffer.isBuffer(fileBuffer)).toBe(true);
      expect(typeof fileBuffer).not.toBe('string');
    });

    it('should reject an unknown type', async () => {
      const handler = loadRoute();
      mockReq.query = { type: 'quicken' };

      await handler(mockReq, mockRes, mockNext);

      expect(importBudgetData).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'type must be one of: actual, ynab4, ynab5',
      }));
    });

    it('should reject an empty body', async () => {
      const handler = loadRoute();
      mockReq.body = Buffer.alloc(0);

      await handler(mockReq, mockRes, mockNext);

      expect(importBudgetData).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'A budget file is required as the raw request body',
      }));
    });

    it('should reject a body that is not a Buffer', async () => {
      const handler = loadRoute();
      mockReq.body = { budget: 'not a buffer' };

      await handler(mockReq, mockRes, mockNext);

      expect(importBudgetData).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'A budget file is required as the raw request body',
      }));
    });

    it('should forward errors to the error handler', async () => {
      const handler = loadRoute();
      const error = new Error('Error importing budget: not-zip-file');
      importBudgetData.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return 501 when experimental operations are disabled', async () => {
      jest.resetModules();
      jest.doMock('../../../src/config/config', () => ({
        config: { experimentalOperationsEnabled: false },
      }));

      const localHandlers = {};
      const localRouter = {
        post: jest.fn((path, ...rest) => {
          localHandlers[`POST ${path}`] = rest[rest.length - 1];
        }),
      };
      require('../../../src/v1/routes/import')(localRouter);

      await localHandlers['POST /budgets/import'](mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(501);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'This operation is experimental and is currently disabled.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
