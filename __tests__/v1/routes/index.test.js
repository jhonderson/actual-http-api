const request = require('supertest');
const express = require('express');

jest.mock('../../../src/v1/budget', () => ({
  Budget: jest.fn(),
  importBudgetData: jest.fn()
}));

jest.mock('../../../src/v1/middlewares/api-key-authorization', () => ({
  authorizeRequest: jest.fn((req, res, next) => next())
}));

jest.mock('../../../src/v1/middlewares/error-handler', () => ({
  errorHandler: jest.fn((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  })
}));

const router = require('../../../src/v1/routes/index');

describe('index.js router', () => {
  beforeEach(() => jest.clearAllMocks());

  function createApp() {
    const app = express();
    app.use(express.json());
    app.use(router);
    return app;
  }

  test('budget middleware loads budget into res.locals', async () => {
    const { Budget } = require('../../../src/v1/budget');
    Budget.mockResolvedValue({ ok: true });

    const app = createApp();

    const res = await request(app)
      .get('/budgets/abc123/accounts')
      .set('budget-encryption-password', 'pw123');

    expect(Budget).toHaveBeenCalledWith('abc123', 'pw123');
  });

  test('error pipeline works when Budget throws', async () => {
    const { Budget } = require('../../../src/v1/budget');
    Budget.mockRejectedValue(new Error('Boom!'));

    const app = createApp();

    const res = await request(app)
      .get('/budgets/xyz/accounts');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Boom!' });
  });

  // The /budgets/:budgetSyncId middleware matches any path with a second segment, so it would
  // capture /budgets/import with budgetSyncId set to the literal string "import". The import
  // route is registered before that middleware to prevent it; this guards the ordering.
  test('POST /budgets/import reaches the import route instead of the budget middleware', async () => {
    const { Budget, importBudgetData } = require('../../../src/v1/budget');
    importBudgetData.mockResolvedValue({
      id: 'My-Finances-5e3e565',
      syncId: 'a232c399-e28c-4a51-96be-d1183129d1f9',
      name: 'Actual Bench Test'
    });

    const app = createApp();

    const res = await request(app)
      .post('/budgets/import')
      .set('Content-Type', 'application/zip')
      .send(Buffer.from([1, 2, 3]));

    expect(Budget).not.toHaveBeenCalled();
    expect(importBudgetData).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      data: {
        id: 'My-Finances-5e3e565',
        syncId: 'a232c399-e28c-4a51-96be-d1183129d1f9',
        name: 'Actual Bench Test'
      }
    });
  });
});
