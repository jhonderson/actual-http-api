// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Schedules Routes', () => {
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
      getSchedules: jest.fn().mockResolvedValue([
        {
          id: 'schedule1',
          name: 'Monthly Rent',
          next_date: '2024-02-01',
          completed: false,
          posts_transaction: true,
          amount: -150000,
          amountOp: 'is',
        },
      ]),
      getSchedule: jest.fn().mockResolvedValue({
        id: 'schedule1',
        name: 'Monthly Rent',
        next_date: '2024-02-01',
        completed: false,
        posts_transaction: true,
        amount: -150000,
        amountOp: 'is',
      }),
      createSchedule: jest.fn().mockResolvedValue('new-schedule-id'),
      updateSchedule: jest.fn().mockResolvedValue({
        id: 'schedule1',
        name: 'Updated Rent',
        amount: -160000,
      }),
      deleteSchedule: jest.fn().mockResolvedValue(undefined),
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

  describe('GET /budgets/:budgetSyncId/schedules', () => {
    it('should register the route', () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/schedules',
        expect.any(Function)
      );
    });

    it('should return list of schedules', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/schedules'];
      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getSchedules).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'schedule1' }),
        ]),
      });
    });

    it('should support pagination', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/schedules'];
      mockReq.query.page = '1';
      mockReq.query.limit = '10';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getSchedules).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle errors from getSchedules', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/schedules'];
      const error = new Error('Failed to fetch schedules');
      mockBudget.getSchedules.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /budgets/:budgetSyncId/schedules/:scheduleId', () => {
    it('should register the route', () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/schedules/:scheduleId',
        expect.any(Function)
      );
    });

    it('should return specific schedule', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/schedules/:scheduleId'];
      mockReq.params.scheduleId = 'schedule1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.getSchedule).toHaveBeenCalledWith('schedule1');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'schedule1' }),
      });
    });

    it('should handle not found schedule', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['GET /budgets/:budgetSyncId/schedules/:scheduleId'];
      mockReq.params.scheduleId = 'nonexistent';
      mockBudget.getSchedule.mockResolvedValueOnce(undefined);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('POST /budgets/:budgetSyncId/schedules', () => {
    it('should register the route', () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/schedules',
        expect.any(Function)
      );
    });

    it('should create a schedule', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/schedules'];
      mockReq.body = {
        schedule: {
          name: 'New Schedule',
          amount: -100000,
          date: { frequency: 'monthly', start: '2024-01-01', endMode: 'never' },
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.createSchedule).toHaveBeenCalledWith(mockReq.body.schedule);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: 'new-schedule-id',
      });
    });

    it('should reject without schedule property', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['POST /budgets/:budgetSyncId/schedules'];
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('PATCH /budgets/:budgetSyncId/schedules/:scheduleId', () => {
    it('should register the route', () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/schedules/:scheduleId',
        expect.any(Function)
      );
    });

    it('should update a schedule', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/schedules/:scheduleId'];
      mockReq.params.scheduleId = 'schedule1';
      mockReq.body = {
        schedule: {
          name: 'Updated Rent',
          amount: -160000,
        },
      };

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.updateSchedule).toHaveBeenCalledWith('schedule1', mockReq.body.schedule);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'schedule1' }),
      });
    });

    it('should reject without schedule property', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/schedules/:scheduleId'];
      mockReq.params.scheduleId = 'schedule1';
      mockReq.body = {};

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle update errors', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['PATCH /budgets/:budgetSyncId/schedules/:scheduleId'];
      mockReq.params.scheduleId = 'nonexistent';
      mockReq.body = { schedule: { name: 'Updated' } };
      const error = new Error('Schedule not found');
      mockBudget.updateSchedule.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('DELETE /budgets/:budgetSyncId/schedules/:scheduleId', () => {
    it('should register the route', () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/schedules/:scheduleId',
        expect.any(Function)
      );
    });

    it('should delete a schedule', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/schedules/:scheduleId'];
      mockReq.params.scheduleId = 'schedule1';

      await handler(mockReq, mockRes, mockNext);

      expect(mockBudget.deleteSchedule).toHaveBeenCalledWith('schedule1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Schedule deleted',
      });
    });

    it('should handle delete errors', async () => {
      const schedulesModule = require('../../../src/v1/routes/schedules');
      schedulesModule(mockRouter);

      const handler = handlers['DELETE /budgets/:budgetSyncId/schedules/:scheduleId'];
      mockReq.params.scheduleId = 'nonexistent';
      const error = new Error('Schedule not found');
      mockBudget.deleteSchedule.mockRejectedValueOnce(error);

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
