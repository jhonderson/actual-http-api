// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Accounts Routes', () => {
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
    mockBudget = {
      getAccounts: jest.fn().mockResolvedValue([
        {
          id: 'acc1',
          name: 'Checking',
          offbudget: false,
          closed: false,
        },
        {
          id: 'acc2',
          name: 'Savings',
          offbudget: false,
          closed: false,
        },
      ]),
      getAccount: jest.fn().mockResolvedValue({
        id: 'acc1',
        name: 'Checking',
        offbudget: false,
        closed: false,
      }),
      getAccountBalance: jest.fn().mockResolvedValue(5000),
      createAccount: jest.fn().mockResolvedValue({
        id: 'new-acc',
        name: 'New Account',
        offbudget: false,
        closed: false,
      }),
      updateAccount: jest.fn().mockResolvedValue({
        id: 'acc1',
        name: 'Checking Updated',
        offbudget: false,
      }),
      deleteAccount: jest.fn().mockResolvedValue(undefined),
      closeAccount: jest.fn().mockResolvedValue(undefined),
      reopenAccount: jest.fn().mockResolvedValue(undefined),
      runBankSync: jest.fn().mockResolvedValue(undefined),
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

  describe('GET /budgets/:budgetSyncId/accounts', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts',
        expect.any(Function)
      );
    });

    it('should return list of accounts', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts'];
      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccounts).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'acc1',
            name: 'Checking',
          }),
        ]),
      });
    });

    it('should handle errors from getAccounts', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts'];
      const error = new Error('Failed to fetch accounts');
      mockBudget.getAccounts.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/accounts/:accountId', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId',
        expect.any(Function)
      );
    });

    it('should return account details', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccount).toHaveBeenCalledWith('acc1');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'acc1',
          name: 'Checking',
        }),
      });
    });

    it('should handle account not found', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'nonexistent';
      mockBudget.getAccount.mockResolvedValueOnce(null);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle errors from getAccount', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'acc1';
      const error = new Error('Database error');
      mockBudget.getAccount.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/accounts/:accountId/balance', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId/balance',
        expect.any(Function)
      );
    });

    it('should return account balance', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balance'];
      mockReq.params.accountId = 'acc1';
      mockBudget.getAccountBalance.mockResolvedValueOnce(5000);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccountBalance).toHaveBeenCalledWith('acc1', undefined);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: 5000,
      });
    });

    it('should handle balance with cutoff date', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balance'];
      mockReq.params.accountId = 'acc1';
      mockReq.query.cutoff_date = '2023-08-15';
      mockBudget.getAccountBalance.mockResolvedValueOnce(3500);

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccountBalance).toHaveBeenCalledWith('acc1', '2023-08-15');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: 3500,
      });
    });

    it('should handle zero balance', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balance'];
      mockReq.params.accountId = 'acc1';
      mockBudget.getAccountBalance.mockResolvedValueOnce(0);

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: 0,
      });
    });

    it('should handle account not found', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balance'];
      mockReq.params.accountId = 'nonexistent';
      mockBudget.getAccountBalance.mockResolvedValueOnce(undefined);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('GET /budgets/:budgetSyncId/accounts/:accountId/balancehistory', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId/balancehistory',
        expect.any(Function)
      );
    });

    it('should return daily balance history', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balancehistory'];
      mockReq.params.accountId = 'acc1';
      mockReq.query.since_date = '2023-08-01';
      mockReq.query.until_date = '2023-08-03';
      mockBudget.getAccountBalance
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(1100)
        .mockResolvedValueOnce(1050);

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          '2023-08-01': 1000,
          '2023-08-02': 1100,
          '2023-08-03': 1050,
        }),
      });
    });

    it('should use today as default until_date', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balancehistory'];
      mockReq.params.accountId = 'acc1';
      mockReq.query.since_date = '2023-08-01';
      mockBudget.getAccountBalance.mockResolvedValue(1000);

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockRes.json.mock.calls[0][0]).toHaveProperty('data');
    });

    it('should reject without since_date', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balancehistory'];
      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject invalid date format', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balancehistory'];
      mockReq.params.accountId = 'acc1';
      mockReq.query.since_date = 'invalid-date';
      mockReq.query.until_date = '2023-08-03';

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject when start date is after end date', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/accounts/:accountId/balancehistory'];
      mockReq.params.accountId = 'acc1';
      mockReq.query.since_date = '2023-08-10';
      mockReq.query.until_date = '2023-08-01';

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('POST /budgets/:budgetSyncId/accounts', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts',
        expect.any(Function)
      );
    });

    it('should create an account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts'];
      mockReq.body = {
        account: {
          name: 'New Account',
          offbudget: false,
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.createAccount).toHaveBeenCalledWith({
        name: 'New Account',
        offbudget: false,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'new-acc',
          name: 'New Account',
        }),
      });
    });

    it('should reject empty account info', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts'];
      mockReq.body = {
        account: {},
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject missing account property', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts'];
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle errors from createAccount', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts'];
      mockReq.body = {
        account: {
          name: 'Test',
          offbudget: false,
        },
      };
      const error = new Error('Duplicate account name');
      mockBudget.createAccount.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('PATCH /budgets/:budgetSyncId/accounts/:accountId', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId',
        expect.any(Function)
      );
    });

    it('should update an account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'acc1';
      mockReq.body = {
        account: {
          name: 'Updated Name',
          offbudget: false,
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccount).toHaveBeenCalledWith('acc1');
      expect(mockBudget.updateAccount).toHaveBeenCalledWith('acc1', {
        name: 'Updated Name',
        offbudget: false,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account updated',
      });
    });

    it('should reject update for nonexistent account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'nonexistent';
      mockReq.body = {
        account: {
          name: 'Updated',
          offbudget: false,
        },
      };
      mockBudget.getAccount.mockResolvedValueOnce(null);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject empty account info', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'acc1';
      mockReq.body = {
        account: {},
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('DELETE /budgets/:budgetSyncId/accounts/:accountId', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId',
        expect.any(Function)
      );
    });

    it('should delete an account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccount).toHaveBeenCalledWith('acc1');
      expect(mockBudget.deleteAccount).toHaveBeenCalledWith('acc1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account deleted',
      });
    });

    it('should reject deletion of nonexistent account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/accounts/:accountId'];
      mockReq.params.accountId = 'nonexistent';
      mockBudget.getAccount.mockResolvedValueOnce(null);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('PUT /budgets/:budgetSyncId/accounts/:accountId/close', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.put).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId/close',
        expect.any(Function)
      );
    });

    it('should close an account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/accounts/:accountId/close'];
      mockReq.params.accountId = 'acc1';
      mockReq.body = {
        transfer: {
          transferAccountId: 'acc2',
          transferCategoryId: 'cat1',
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getAccount).toHaveBeenCalledWith('acc1');
      expect(mockBudget.closeAccount).toHaveBeenCalledWith('acc1', {
        transferAccountId: 'acc2',
        transferCategoryId: 'cat1',
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account closed',
      });
    });

    it('should close account with empty transfer info', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/accounts/:accountId/close'];
      mockReq.params.accountId = 'acc1';
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.closeAccount).toHaveBeenCalledWith('acc1', {});
    });

    it('should reject closing nonexistent account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/accounts/:accountId/close'];
      mockReq.params.accountId = 'nonexistent';
      mockBudget.getAccount.mockResolvedValueOnce(null);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('PUT /budgets/:budgetSyncId/accounts/:accountId/reopen', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.put).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId/reopen',
        expect.any(Function)
      );
    });

    it('should reopen a closed account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/accounts/:accountId/reopen'];
      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.reopenAccount).toHaveBeenCalledWith('acc1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account reopened',
      });
    });

    it('should handle errors from reopenAccount', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['PUT /budgets/:budgetSyncId/accounts/:accountId/reopen'];
      mockReq.params.accountId = 'acc1';
      const error = new Error('Account not found');
      mockBudget.reopenAccount.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('POST /budgets/:budgetSyncId/accounts/:accountId/banksync', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/:accountId/banksync',
        expect.any(Function)
      );
    });

    it('should trigger bank sync for specific account', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts/:accountId/banksync'];
      mockReq.params.accountId = 'acc1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.runBankSync).toHaveBeenCalledWith('acc1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Bank sync started',
      });
    });

    it('should handle errors from runBankSync', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts/:accountId/banksync'];
      mockReq.params.accountId = 'acc1';
      const error = new Error('Bank sync failed');
      mockBudget.runBankSync.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('POST /budgets/:budgetSyncId/accounts/banksync', () => {
    it('should register the route', () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accounts/banksync',
        expect.any(Function)
      );
    });

    it('should trigger bank sync for all accounts', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts/banksync'];

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.runBankSync).toHaveBeenCalledWith();
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Bank sync started',
      });
    });

    it('should handle errors from runBankSync', async () => {
      const accountsModule = require('../../../src/v1/routes/accounts');
      accountsModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/accounts/banksync'];
      const error = new Error('Bank sync failed');
      mockBudget.runBankSync.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
