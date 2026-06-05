// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Utils Routes', () => {
  let mockRouter;
  let mockBudget;
  let mockReq;
  let mockRes;
  let mockNext;
  let handlers;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    jest.clearAllMocks();

    handlers = {};

    mockRouter = {
      get: jest.fn((path, handler) => {
        handlers[`GET ${path}`] = handler;
      }),
    };

    mockBudget = {
      getIDByName: jest.fn().mockResolvedValue('671b669d-b616-4bf1-8a04-c82d73f87d5b'),
    };

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      locals: { budget: mockBudget },
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  describe('GET /budgets/:budgetSyncId/id-by-name', () => {
    it('should register the route', () => {
      const utilsModule = require('../../../src/v1/routes/utils');
      utilsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/id-by-name',
        expect.any(Function)
      );
    });

    it('should return the ID for a valid type and name', async () => {
      const utilsModule = require('../../../src/v1/routes/utils');
      utilsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/id-by-name'];
      mockReq.query = { type: 'accounts', name: 'Checking' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getIDByName).toHaveBeenCalledWith('accounts', 'Checking');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: '671b669d-b616-4bf1-8a04-c82d73f87d5b',
      });
    });

    it('should return 400 when type is missing', async () => {
      const utilsModule = require('../../../src/v1/routes/utils');
      utilsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/id-by-name'];
      mockReq.query = { name: 'Checking' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('required') })
      );
      expect(mockBudget.getIDByName).not.toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
      const utilsModule = require('../../../src/v1/routes/utils');
      utilsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/id-by-name'];
      mockReq.query = { type: 'accounts' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('required') })
      );
      expect(mockBudget.getIDByName).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid type', async () => {
      const utilsModule = require('../../../src/v1/routes/utils');
      utilsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/id-by-name'];
      mockReq.query = { type: 'transactions', name: 'something' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('"type" must be one of') })
      );
      expect(mockBudget.getIDByName).not.toHaveBeenCalled();
    });

    it('should propagate 404 when upstream throws not found', async () => {
      const utilsModule = require('../../../src/v1/routes/utils');
      utilsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/id-by-name'];
      mockReq.query = { type: 'accounts', name: 'Nonexistent' };
      const upstreamError = new Error('Not found: accounts with name Nonexistent');
      mockBudget.getIDByName.mockRejectedValueOnce(upstreamError);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(upstreamError);
    });

    it('should work for all valid entity types', async () => {
      const utilsModule = require('../../../src/v1/routes/utils');
      utilsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/id-by-name'];

      for (const type of ['accounts', 'schedules', 'categories', 'payees']) {
        jest.clearAllMocks();
        mockReq.query = { type, name: 'Test' };
        mockBudget.getIDByName.mockResolvedValueOnce('some-id');

        await handler(mockReq, mockRes, mockNext);

        expect(mockBudget.getIDByName).toHaveBeenCalledWith(type, 'Test');
        expect(mockNext).not.toHaveBeenCalled();
      }
    });
  });
});
