// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Run Query Routes', () => {
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

    // Track all registered route handlers
    handlers = {};

    // Create a mock express router that tracks handlers
    mockRouter = {
      get: jest.fn((path, handler) => {
        handlers[`GET ${path}`] = handler;
      }),
      post: jest.fn((path, handler) => {
        handlers[`POST ${path}`] = handler;
      }),
      patch: jest.fn((path, handler) => {
        handlers[`PATCH ${path}`] = handler;
      }),
      delete: jest.fn((path, handler) => {
        handlers[`DELETE ${path}`] = handler;
      }),
      put: jest.fn((path, handler) => {
        handlers[`PUT ${path}`] = handler;
      }),
    };

    // Create a comprehensive mock budget object
    const mockQuery = {
      filter: jest.fn().mockReturnThis(),
      unfilter: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      calculate: jest.fn().mockReturnThis(),
      options: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      withDead: jest.fn().mockReturnThis(),
      withoutValidatedRefs: jest.fn().mockReturnThis(),
    };

    mockBudget = {
      q: jest.fn().mockReturnValue(mockQuery),
      runQuery: jest.fn().mockResolvedValue({ data: { some: 'data' } }),
    };

    // Create mock request/response objects
    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      locals: {
        budget: mockBudget,
      },
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  describe('POST /budgets/:budgetSyncId/run-query', () => {
    it('should register the route', () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/run-query',
        expect.any(Function)
      );
    });

    it('should construct and run the query with multiple filters and flags', async () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/run-query'];
      const queryParams = {
        table: 'transactions',
        filter: [
          { date: { $gte: '2021-01-01' } },
          { date: { $lte: '2021-12-31' } }
        ],
        select: ['*'],
        raw: true
      };
      mockReq.body = {
        ActualQLquery: queryParams
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.q).toHaveBeenCalledWith('transactions');
      const mockQuery = mockBudget.q.mock.results[0].value;
      expect(mockQuery.filter).toHaveBeenCalledTimes(2);
      expect(mockQuery.filter).toHaveBeenNthCalledWith(1, { date: { $gte: '2021-01-01' } });
      expect(mockQuery.filter).toHaveBeenNthCalledWith(2, { date: { $lte: '2021-12-31' } });
      expect(mockQuery.select).toHaveBeenCalledWith(['*']);
      expect(mockQuery.raw).toHaveBeenCalled();
      expect(mockBudget.runQuery).toHaveBeenCalledWith(mockQuery);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { some: 'data' },
      });
    });

    it('should support withDead and withoutValidatedRefs flags', async () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/run-query'];
      const queryParams = {
        table: 'transactions',
        withDead: true,
        withoutValidatedRefs: true
      };
      mockReq.body = {
        ActualQLquery: queryParams
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.q).toHaveBeenCalledWith('transactions');
      const mockQuery = mockBudget.q.mock.results[0].value;
      expect(mockQuery.withDead).toHaveBeenCalled();
      expect(mockQuery.withoutValidatedRefs).toHaveBeenCalled();
      expect(mockBudget.runQuery).toHaveBeenCalledWith(mockQuery);
    });

    it('should support calculate method', async () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/run-query'];
      const queryParams = {
        table: 'transactions',
        calculate: { $sum: '$amount' }
      };
      mockReq.body = {
        ActualQLquery: queryParams
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.q).toHaveBeenCalledWith('transactions');
      const mockQuery = mockBudget.q.mock.results[0].value;
      expect(mockQuery.calculate).toHaveBeenCalledWith({ $sum: '$amount' });
      expect(mockBudget.runQuery).toHaveBeenCalledWith(mockQuery);
    });

    it('should support unfilter method', async () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/run-query'];
      const queryParams = {
        table: 'transactions',
        unfilter: ['date']
      };
      mockReq.body = {
        ActualQLquery: queryParams
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.q).toHaveBeenCalledWith('transactions');
      const mockQuery = mockBudget.q.mock.results[0].value;
      expect(mockQuery.unfilter).toHaveBeenCalledWith(['date']);
      expect(mockBudget.runQuery).toHaveBeenCalledWith(mockQuery);
    });

    it('should throw error if ActualQLquery is missing', async () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/run-query'];
      mockReq.body = {}; // Missing ActualQLquery

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toBe('ActualQLquery is required in the request body');
    });

    it('should throw error if table is missing', async () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/run-query'];
      mockReq.body = {
        ActualQLquery: { filter: {} } // Missing table
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toBe('table is required in ActualQLquery');
    });

    it('should handle errors from runQuery', async () => {
      const runQueryModule = require('../../../src/v1/routes/run-query');
      runQueryModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/run-query'];
      mockReq.body = {
        ActualQLquery: { table: 'transactions' }
      };
      const error = new Error('Query failed');
      mockBudget.runQuery.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
