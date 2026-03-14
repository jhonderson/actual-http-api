process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Notes Routes', () => {
  let mockRouter;
  let mockBudget;
  let mockReq;
  let mockRes;
  let mockNext;
  let handlers;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    handlers = {};

    mockRouter = {
      get: jest.fn((path, handler) => {
        handlers[`GET ${path}`] = handler;
      }),
    };

    mockBudget = {
      getCategoryNotes: jest.fn().mockResolvedValue('Category note'),
      getAccountNotes: jest.fn().mockResolvedValue('Account note'),
      getBudgetMonthNotes: jest.fn().mockResolvedValue('Month note'),
    };

    mockReq = {
      params: {},
      body: {},
      query: {}
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      locals: {
        budget: mockBudget
      }
    };

    mockNext = jest.fn();
  });

  describe('GET /budgets/:budgetSyncId/notes/category/:categoryId', () => {

    it('should register the route', () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/notes/category/:categoryId',
        expect.any(Function)
      );
    });

    it('should return category notes', async () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getCategoryNotes).toHaveBeenCalledWith('cat1');

      expect(mockRes.json).toHaveBeenCalledWith({
        data: 'Category note'
      });
    });

  });

  describe('GET /budgets/:budgetSyncId/notes/account/:accountId', () => {

    it('should return account notes', async () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/notes/account/:accountId'];

      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccountNotes).toHaveBeenCalledWith('acc1');

      expect(mockRes.json).toHaveBeenCalledWith({
        data: 'Account note'
      });
    });

  });

  describe('GET /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth', () => {

    it('should return budget month notes', async () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth'];

      mockReq.params.budgetMonth = '2024-01';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getBudgetMonthNotes).toHaveBeenCalledWith('2024-01');

      expect(mockRes.json).toHaveBeenCalledWith({
        data: 'Month note'
      });
    });

  });

});