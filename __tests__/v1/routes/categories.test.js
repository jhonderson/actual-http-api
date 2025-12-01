// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Categories Routes', () => {
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
      getCategories: jest.fn().mockResolvedValue([
        {
          id: 'cat1',
          name: 'Groceries',
          group_id: 'grp1',
          is_income: false,
        },
      ]),
      getCategory: jest.fn().mockResolvedValue({
        id: 'cat1',
        name: 'Groceries',
        group_id: 'grp1',
        is_income: false,
      }),
      createCategory: jest.fn().mockResolvedValue({
        id: 'new-cat',
        name: 'New Category',
      }),
      updateCategory: jest.fn().mockResolvedValue({
        id: 'cat1',
        name: 'Groceries Updated',
      }),
      deleteCategory: jest.fn().mockResolvedValue(undefined),
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
      createCategoryGroup: jest.fn().mockResolvedValue({
        id: 'new-grp',
        name: 'New Group',
      }),
      updateCategoryGroup: jest.fn().mockResolvedValue({
        id: 'grp1',
        name: 'Updated Group',
      }),
      deleteCategoryGroup: jest.fn().mockResolvedValue(undefined),
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

  describe('GET /budgets/:budgetSyncId/categories', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categories',
        expect.any(Function)
      );
    });

    it('should return list of categories', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/categories'];
      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getCategories).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'cat1' }),
        ]),
      });
    });
  });

  describe('GET /budgets/:budgetSyncId/categories/:categoryId', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categories/:categoryId',
        expect.any(Function)
      );
    });

    it('should return specific category', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/categories/:categoryId'];
      mockReq.params.categoryId = 'cat1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getCategory).toHaveBeenCalledWith('cat1');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'cat1' }),
      });
    });

    it('should reject for nonexistent category', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/categories/:categoryId'];
      mockReq.params.categoryId = 'nonexistent';
      mockBudget.getCategory.mockResolvedValueOnce(null);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('POST /budgets/:budgetSyncId/categories', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categories',
        expect.any(Function)
      );
    });

    it('should create a category', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/categories'];
      mockReq.body = {
        category: {
          name: 'New Category',
          group_id: 'grp1',
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.createCategory).toHaveBeenCalledWith(mockReq.body.category);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'new-cat' }),
      });
    });

    it('should reject without category property', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/categories'];
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('PATCH /budgets/:budgetSyncId/categories/:categoryId', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categories/:categoryId',
        expect.any(Function)
      );
    });

    it('should update a category', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/categories/:categoryId'];
      mockReq.params.categoryId = 'cat1';
      mockReq.body = {
        category: {
          name: 'Groceries Updated',
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getCategory).toHaveBeenCalledWith('cat1');
      expect(mockBudget.updateCategory).toHaveBeenCalledWith('cat1', mockReq.body.category);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category updated',
      });
    });

    it('should reject for nonexistent category', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/categories/:categoryId'];
      mockReq.params.categoryId = 'nonexistent';
      mockReq.body = { category: { name: 'Updated' } };
      mockBudget.getCategory.mockResolvedValueOnce(null);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('DELETE /budgets/:budgetSyncId/categories/:categoryId', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categories/:categoryId',
        expect.any(Function)
      );
    });

    it('should delete a category', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/categories/:categoryId'];
      mockReq.params.categoryId = 'cat1';

      mockBudget.getCategory.mockResolvedValueOnce({
        id: 'cat1',
        name: 'Groceries',
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getCategory).toHaveBeenCalledWith('cat1');
      expect(mockBudget.deleteCategory).toHaveBeenCalledWith('cat1', { transferCategoryId: undefined });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category deleted',
      });
    });

    it('should reject for nonexistent category', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/categories/:categoryId'];
      mockReq.params.categoryId = 'nonexistent';
      mockBudget.getCategory.mockResolvedValueOnce(null);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('GET /budgets/:budgetSyncId/categorygroups', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categorygroups',
        expect.any(Function)
      );
    });

    it('should return list of category groups', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/categorygroups'];
      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getCategoryGroups).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'grp1' }),
        ]),
      });
    });
  });

  describe('POST /budgets/:budgetSyncId/categorygroups', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categorygroups',
        expect.any(Function)
      );
    });

    it('should create a category group', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/categorygroups'];
      mockReq.body = {
        category_group: {
          name: 'New Group',
          is_income: false,
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.createCategoryGroup).toHaveBeenCalledWith(mockReq.body.category_group);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'new-grp' }),
      });
    });
  });

  describe('PATCH /budgets/:budgetSyncId/categorygroups/:categoryGroupId', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categorygroups/:categoryGroupId',
        expect.any(Function)
      );
    });

    it('should update a category group', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/categorygroups/:categoryGroupId'];
      mockReq.params.categoryGroupId = 'grp1';
      mockReq.body = {
        category_group: {
          name: 'Updated Group',
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.updateCategoryGroup).toHaveBeenCalledWith('grp1', mockReq.body.category_group);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category group updated',
      });
    });
  });

  describe('DELETE /budgets/:budgetSyncId/categorygroups/:categoryGroupId', () => {
    it('should register the route', () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/categorygroups/:categoryGroupId',
        expect.any(Function)
      );
    });

    it('should delete a category group', async () => {
      const categoriesModule = require('../../../src/v1/routes/categories');
      categoriesModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/categorygroups/:categoryGroupId'];
      mockReq.params.categoryGroupId = 'grp1';
      mockReq.query.transfer_category_id = 'cat-transfer';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.deleteCategoryGroup).toHaveBeenCalledWith('grp1', {
        transferCategoryId: 'cat-transfer',
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category group deleted',
      });
    });
  });
});
