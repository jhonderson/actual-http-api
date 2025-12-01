// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Budget Months Routes', () => {
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
      patch: jest.fn((path, handler) => {
        handlers[`PATCH ${path}`] = handler;
      }),
      delete: jest.fn((path, handler) => {
        handlers[`DELETE ${path}`] = handler;
      }),
    };

    mockBudget = {
      getMonths: jest.fn().mockResolvedValue(['2023-08', '2023-09', '2023-10']),
      getMonth: jest.fn().mockResolvedValue({
        month: '2023-08',
        incomeAvailable: 1000,
        lastMonthOverspent: 0,
        forNextMonth: 0,
        totalBudgeted: 1000,
        toBudget: 0,
        fromLastMonth: 0,
        totalIncome: 2000,
        totalSpent: -1000,
        totalBalance: 1000,
        categoryGroups: [],
      }),
      getMonthCategories: jest.fn().mockResolvedValue([
        {
          id: 'cat1',
          name: 'Groceries',
          group_id: 'grp1',
          budgeted: 500,
          spent: -300,
          balance: 200,
        },
      ]),
      getMonthCategory: jest.fn().mockResolvedValue({
        id: 'cat1',
        name: 'Groceries',
        group_id: 'grp1',
        budgeted: 500,
        spent: -300,
        balance: 200,
      }),
      updateMonthCategory: jest.fn().mockResolvedValue({
        id: 'cat1',
        name: 'Groceries',
        budgeted: 600,
      }),
      getCategoryGroups: jest.fn().mockResolvedValue([
        {
          id: 'grp1',
          name: 'Regular Expenses',
          is_income: false,
        },
      ]),
      getCategoryGroup: jest.fn().mockResolvedValue({
        id: 'grp1',
        name: 'Regular Expenses',
        is_income: false,
      }),
      getMonthCategoryGroups: jest.fn().mockResolvedValue([
        {
          id: 'grp1',
          name: 'Income',
        },
      ]),
      getMonthCategoryGroup: jest.fn().mockResolvedValue({
        id: 'grp1',
        name: 'Income',
      }),
      transferCategory: jest.fn().mockResolvedValue(undefined),
      setMonthBudgetHold: jest.fn().mockResolvedValue(undefined),
      deleteMonthBudgetHold: jest.fn().mockResolvedValue(undefined),
    };

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

  describe('GET /budgets/:budgetSyncId/months', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months',
        expect.any(Function)
      );
    });

    it('should return list of months', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months'];
      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getMonths).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: ['2023-08', '2023-09', '2023-10'],
      });
    });

    it('should handle errors from getMonths', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months'];
      const error = new Error('Budget not found');
      mockBudget.getMonths.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/months/:month', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month',
        expect.any(Function)
      );
    });

    it('should return month details', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months/:month'];
      mockReq.params.month = '2023-08';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getMonth).toHaveBeenCalledWith('2023-08');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          month: '2023-08',
          incomeAvailable: 1000,
        }),
      });
    });

    it('should handle errors from getMonth', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months/:month'];
      mockReq.params.month = '2023-08';
      const error = new Error('Month not found');
      mockBudget.getMonth.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/months/:month/categories', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/categories',
        expect.any(Function)
      );
    });

    it('should return month categories', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months/:month/categories'];
      mockReq.params.month = '2023-08';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getMonthCategories).toHaveBeenCalledWith('2023-08');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'cat1' }),
        ]),
      });
    });
  });

  describe('GET /budgets/:budgetSyncId/months/:month/categories/:categoryId', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/categories/:categoryId',
        expect.any(Function)
      );
    });

    it('should return specific category details', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months/:month/categories/:categoryId'];
      mockReq.params.month = '2023-08';
      mockReq.params.categoryId = 'cat1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getMonthCategory).toHaveBeenCalledWith('2023-08', 'cat1');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'cat1' }),
      });
    });
  });

  describe('PATCH /budgets/:budgetSyncId/months/:month/categories/:categoryId', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/categories/:categoryId',
        expect.any(Function)
      );
    });

    it('should update a month category', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/months/:month/categories/:categoryId'];
      mockReq.params.month = '2023-08';
      mockReq.params.categoryId = 'cat1';
      mockReq.body = {
        category: {
          budgeted: 600,
          notes: 'Updated',
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.updateMonthCategory).toHaveBeenCalledWith('2023-08', 'cat1', mockReq.body.category);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category updated',
      });
    });

    it('should reject without category property', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/months/:month/categories/:categoryId'];
      mockReq.params.month = '2023-08';
      mockReq.params.categoryId = 'cat1';
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('GET /budgets/:budgetSyncId/months/:month/categorygroups', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/categorygroups',
        expect.any(Function)
      );
    });

    it('should return category groups for month', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months/:month/categorygroups'];
      mockReq.params.month = '2023-08';

      mockBudget.getMonthCategoryGroups.mockResolvedValueOnce([
        { id: 'grp1', name: 'Income' },
      ]);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getMonthCategoryGroups).toHaveBeenCalledWith('2023-08');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'grp1' }),
        ]),
      });
    });
  });

  describe('GET /budgets/:budgetSyncId/months/:month/categorygroups/:categoryGroupId', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/categorygroups/:categoryGroupId',
        expect.any(Function)
      );
    });

    it('should return specific category group', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/months/:month/categorygroups/:categoryGroupId'];
      mockReq.params.month = '2023-08';
      mockReq.params.categoryGroupId = 'grp1';

      mockBudget.getMonthCategoryGroup.mockResolvedValueOnce({
        id: 'grp1',
        name: 'Income',
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getMonthCategoryGroup).toHaveBeenCalledWith('2023-08', 'grp1');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'grp1' }),
      });
    });
  });

  describe('POST /budgets/:budgetSyncId/months/:month/categorytransfers', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/categorytransfers',
        expect.any(Function)
      );
    });

    it('should transfer category budget', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/months/:month/categorytransfers'];
      mockReq.params.month = '2023-08';
      mockReq.body = {
        categorytransfer: {
          fromCategoryId: 'cat1',
          toCategoryId: 'cat2',
          amount: 100,
        },
      };

      mockBudget.addCategoryTransfer = jest.fn().mockResolvedValue(undefined);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.addCategoryTransfer).toHaveBeenCalledWith('2023-08', mockReq.body.categorytransfer);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category transfer created',
      });
    });

    it('should reject without categorytransfer property', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/months/:month/categorytransfers'];
      mockReq.params.month = '2023-08';
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('POST /budgets/:budgetSyncId/months/:month/nextmonthbudgethold', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/nextmonthbudgethold',
        expect.any(Function)
      );
    });

    it('should set next month budget hold', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/months/:month/nextmonthbudgethold'];
      mockReq.params.month = '2023-08';
      mockReq.body = {
        amount: 500,
      };

      mockBudget.holdBudgetForNextMonth = jest.fn().mockResolvedValue(undefined);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.holdBudgetForNextMonth).toHaveBeenCalledWith('2023-08', 500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Budget amount 500 was put on hold for next month',
      });
    });
  });

  describe('DELETE /budgets/:budgetSyncId/months/:month/nextmonthbudgethold', () => {
    it('should register the route', () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/months/:month/nextmonthbudgethold',
        expect.any(Function)
      );
    });

    it('should delete next month budget hold', async () => {
      const budgetMonthsModule = require('../../../src/v1/routes/budget-months');
      budgetMonthsModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/months/:month/nextmonthbudgethold'];
      mockReq.params.month = '2023-08';

      mockBudget.resetBudgetHold = jest.fn().mockResolvedValue(undefined);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.resetBudgetHold).toHaveBeenCalledWith('2023-08');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Budget hold reset',
      });
    });
  });
});
