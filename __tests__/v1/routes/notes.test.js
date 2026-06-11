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
      put: jest.fn((path, handler) => {
        handlers[`PUT ${path}`] = handler;
      }),
      delete: jest.fn((path, handler) => {
        handlers[`DELETE ${path}`] = handler;
      }),
    };

    mockBudget = {
      getCategoryNotes: jest.fn(),
      setCategoryNotes: jest.fn(),
      getAccountNotes: jest.fn(),
      setAccountNotes: jest.fn(),
      getBudgetMonthNotes: jest.fn(),
      setBudgetMonthNotes: jest.fn(),
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

    it('should return category notes', async () => {
      mockBudget.getCategoryNotes.mockResolvedValueOnce('Category note');

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

    it('should return empty string when notes are null', async () => {
      mockBudget.getCategoryNotes.mockResolvedValueOnce(null);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: ""
      });
    });

  });

  describe('GET /budgets/:budgetSyncId/notes/account/:accountId', () => {

    it('should return account notes', async () => {
      mockBudget.getAccountNotes.mockResolvedValueOnce('Account note');

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

    it('should return empty string when notes are undefined', async () => {
      mockBudget.getAccountNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/notes/account/:accountId'];

      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: ""
      });
    });

  });

  describe('GET /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth', () => {

    it('should return budget month notes', async () => {
      mockBudget.getBudgetMonthNotes.mockResolvedValueOnce('Month note');

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

    it('should return empty string when notes are null', async () => {
      mockBudget.getBudgetMonthNotes.mockResolvedValueOnce(null);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth'];

      mockReq.params.budgetMonth = '2024-01';

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: ""
      });
    });

  });

  describe('PUT /budgets/:budgetSyncId/notes/category/:categoryId', () => {

    it('should set category notes', async () => {
      mockBudget.setCategoryNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';
      mockReq.body = { data: 'New category note' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setCategoryNotes).toHaveBeenCalledWith('cat1', 'New category note');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category notes updated'
      });
    });

    it('should accept an empty string', async () => {
      mockBudget.setCategoryNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';
      mockReq.body = { data: '' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setCategoryNotes).toHaveBeenCalledWith('cat1', '');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category notes updated'
      });
    });

    it('should call next with an error when data is missing', async () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setCategoryNotes).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with an error when data is not a string', async () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';
      mockReq.body = { data: 123 };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setCategoryNotes).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('DELETE /budgets/:budgetSyncId/notes/category/:categoryId', () => {

    it('should delete category notes by setting them to null', async () => {
      mockBudget.setCategoryNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setCategoryNotes).toHaveBeenCalledWith('cat1', null);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category notes deleted'
      });
    });

    it('should call next with an error when the budget setter throws', async () => {
      const error = new Error('boom');
      mockBudget.setCategoryNotes.mockRejectedValueOnce(error);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/notes/category/:categoryId'];

      mockReq.params.categoryId = 'cat1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

  });

  describe('PUT /budgets/:budgetSyncId/notes/account/:accountId', () => {

    it('should set account notes', async () => {
      mockBudget.setAccountNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/account/:accountId'];

      mockReq.params.accountId = 'acc1';
      mockReq.body = { data: 'New account note' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setAccountNotes).toHaveBeenCalledWith('acc1', 'New account note');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account notes updated'
      });
    });

    it('should call next with an error when data is missing', async () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/account/:accountId'];

      mockReq.params.accountId = 'acc1';
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setAccountNotes).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('DELETE /budgets/:budgetSyncId/notes/account/:accountId', () => {

    it('should delete account notes by setting them to null', async () => {
      mockBudget.setAccountNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/notes/account/:accountId'];

      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setAccountNotes).toHaveBeenCalledWith('acc1', null);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account notes deleted'
      });
    });

  });

  describe('PUT /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth', () => {

    it('should set budget month notes', async () => {
      mockBudget.setBudgetMonthNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth'];

      mockReq.params.budgetMonth = '2024-01';
      mockReq.body = { data: 'Notes for January' };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setBudgetMonthNotes).toHaveBeenCalledWith('2024-01', 'Notes for January');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Budget month notes updated'
      });
    });

    it('should call next with an error when data is missing', async () => {
      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth'];

      mockReq.params.budgetMonth = '2024-01';
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setBudgetMonthNotes).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('DELETE /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth', () => {

    it('should delete budget month notes by setting them to null', async () => {
      mockBudget.setBudgetMonthNotes.mockResolvedValueOnce(undefined);

      const module = require('../../../src/v1/routes/notes');
      module(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/notes/budgetmonth/:budgetMonth'];

      mockReq.params.budgetMonth = '2024-01';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.setBudgetMonthNotes).toHaveBeenCalledWith('2024-01', null);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Budget month notes deleted'
      });
    });

  });

});