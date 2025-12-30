// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Payees Routes', () => {
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
      getPayees: jest.fn().mockResolvedValue([
        {
          id: 'payee1',
          name: 'Grocery Store',
          transfer_acct: null,
        },
      ]),
      getPayee: jest.fn().mockResolvedValue({
        id: 'payee1',
        name: 'Grocery Store',
        transfer_acct: null,
      }),
      createPayee: jest.fn().mockResolvedValue({
        id: 'new-payee',
        name: 'New Payee',
      }),
      updatePayee: jest.fn().mockResolvedValue({
        id: 'payee1',
        name: 'Updated Payee',
      }),
      deletePayee: jest.fn().mockResolvedValue(undefined),
      mergePayees: jest.fn().mockResolvedValue(undefined),
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

  describe('GET /budgets/:budgetSyncId/payees', () => {
    it('should register the route', () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/payees',
        expect.any(Function)
      );
    });

    it('should return list of payees', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/payees'];
      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getPayees).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'payee1' }),
        ]),
      });
    });

    it('should handle errors from getPayees', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/payees'];
      const error = new Error('Failed to fetch payees');
      mockBudget.getPayees.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/payees/:payeeId', () => {
    it('should register the route', () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/payees/:payeeId',
        expect.any(Function)
      );
    });

    it('should return specific payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/payees/:payeeId'];
      mockReq.params.payeeId = 'payee1';
      mockBudget.getPayees.mockResolvedValueOnce([
        { id: 'payee1', name: 'Test Payee' },
        { id: 'payee2', name: 'Another Payee' },
      ]);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getPayees).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'payee1' }),
      });
    });

    it('should reject for nonexistent payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/payees/:payeeId'];
      mockReq.params.payeeId = 'nonexistent';
      mockBudget.getPayees.mockResolvedValueOnce([
        { id: 'payee1', name: 'Test Payee' },
      ]);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('POST /budgets/:budgetSyncId/payees', () => {
    it('should register the route', () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/payees',
        expect.any(Function)
      );
    });

    it('should create a payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/payees'];
      mockReq.body = {
        payee: {
          name: 'New Payee',
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.createPayee).toHaveBeenCalledWith(mockReq.body.payee);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'new-payee' }),
      });
    });

    it('should reject without payee property', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/payees'];
      mockReq.body = {};
      const error = new Error('payee information is required');
      mockBudget.createPayee.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('PATCH /budgets/:budgetSyncId/payees/:payeeId', () => {
    it('should register the route', () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/payees/:payeeId',
        expect.any(Function)
      );
    });

    it('should update a payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/payees/:payeeId'];
      mockReq.params.payeeId = 'payee1';
      mockReq.body = {
        payee: {
          name: 'Updated Payee',
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.updatePayee).toHaveBeenCalledWith('payee1', mockReq.body.payee);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Payee updated',
      });
    });

    it('should reject for nonexistent payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/payees/:payeeId'];
      mockReq.params.payeeId = 'nonexistent';
      mockReq.body = { payee: { name: 'Updated' } };
      const error = new Error('Payee update failed');
      mockBudget.updatePayee.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('DELETE /budgets/:budgetSyncId/payees/:payeeId', () => {
    it('should register the route', () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/payees/:payeeId',
        expect.any(Function)
      );
    });

    it('should delete a payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/payees/:payeeId'];
      mockReq.params.payeeId = 'payee1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.deletePayee).toHaveBeenCalledWith('payee1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Payee deleted',
      });
    });

    it('should reject for nonexistent payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/payees/:payeeId'];
      mockReq.params.payeeId = 'nonexistent';
      const error = new Error('Payee deletion failed');
      mockBudget.deletePayee.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/payees/:payeeId/rules', () => {
    it('should register the route', () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/payees/:payeeId/rules',
        expect.any(Function)
      );
    });

    it('should return rules for a payee', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/payees/:payeeId/rules'];
      mockReq.params.payeeId = 'payee1';
      mockBudget.getPayeeRules = jest.fn().mockResolvedValue([
        {
          id: 'rule1',
          conditions: [],
          actions: [],
        },
      ]);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getPayeeRules).toHaveBeenCalledWith('payee1');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'rule1' }),
        ]),
      });
    });
  });

  describe('POST /budgets/:budgetSyncId/payees/merge', () => {
    it('should register the route', () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/payees/merge',
        expect.any(Function)
      );
    });

    it('should merge payees', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/payees/merge'];
      mockReq.body = {
        targetId: 'payee1',
        mergeIds: ['payee2'],
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.mergePayees).toHaveBeenCalledWith('payee1', ['payee2']);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Payees merged',
      });
    });

    it('should merge multiple payees', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/payees/merge'];
      mockReq.body = {
        targetId: 'payee1',
        mergeIds: ['payee2', 'payee3', 'payee4'],
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.mergePayees).toHaveBeenCalledWith('payee1', ['payee2', 'payee3', 'payee4']);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Payees merged',
      });
    });

    it('should reject with missing parameters', async () => {
      const payeesModule = require('../../../src/v1/routes/payees');
      payeesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/payees/merge'];
      mockReq.body = { targetId: 'payee1' }; // missing mergeIds

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
