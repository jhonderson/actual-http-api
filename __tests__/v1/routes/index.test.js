const request = require('supertest');
const express = require('express');

jest.mock('../../../src/v1/budget', () => ({
  Budget: jest.fn()
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
});
