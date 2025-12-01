// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Settings Routes', () => {
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
      post: jest.fn((path, handler) => {
        handlers[`POST ${path}`] = handler;
      }),
    };

    mockBudget = {
      getSettings: jest.fn().mockResolvedValue({
        locale: 'en-US',
        maxMonthsOfHistory: 24,
      }),
      exportBudget: jest.fn().mockResolvedValue('exported-data'),
    };

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn(),
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

  describe('GET /budgets/:budgetSyncId/budgets', () => {
    it('should register the route', () => {
      const settingsModule = require('../../../src/v1/routes/settings');
      settingsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/budgets',
        expect.any(Function)
      );
    });

    it('should return budget settings', async () => {
      const settingsModule = require('../../../src/v1/routes/settings');
      settingsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/budgets'];
      mockBudget.getBudgets = jest.fn().mockResolvedValue({
        locale: 'en-US',
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getBudgets).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          locale: 'en-US',
        }),
      });
    });

    it('should handle errors from getSettings', async () => {
      const settingsModule = require('../../../src/v1/routes/settings');
      settingsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/budgets'];
      const error = new Error('Failed to fetch settings');
      mockBudget.getBudgets = jest.fn().mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/export', () => {
    it('should register the route', () => {
      const settingsModule = require('../../../src/v1/routes/settings');
      settingsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/export',
        expect.any(Function)
      );
    });

    it('should export budget data', async () => {
      const settingsModule = require('../../../src/v1/routes/settings');
      settingsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/export'];
      mockBudget.exportData = jest.fn().mockResolvedValueOnce({
        fileName: 'budget.zip',
        fileStream: {
          pipe: jest.fn().mockReturnThis(),
          finalize: jest.fn(),
          on: jest.fn(),
        },
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.exportData).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalled();
    });

    it('should handle errors from exportBudget', async () => {
      const settingsModule = require('../../../src/v1/routes/settings');
      settingsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/export'];
      const error = new Error('Export failed');
      mockBudget.exportData = jest.fn().mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should set correct headers for file download', async () => {
      const settingsModule = require('../../../src/v1/routes/settings');
      settingsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/export'];
      mockBudget.exportData = jest.fn().mockResolvedValueOnce({
        fileName: 'budget.zip',
        fileStream: {
          pipe: jest.fn().mockReturnThis(),
          finalize: jest.fn(),
          on: jest.fn(),
        },
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/zip'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment')
      );
    });
  });
});
