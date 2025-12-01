// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';
const { authorizeRequest } = require('../../../src/v1/middlewares/api-key-authorization');
const { config } = require('../../../src/config/config');

describe('API Key Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      get: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authorizeRequest', () => {
    it('should call next() if API key matches in production', async () => {
      config.apiKey = 'valid-key';
      config.nodeEnv = 'production';
      req.get.mockReturnValue('valid-key');

      await authorizeRequest(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if API key is invalid in production', async () => {
      config.apiKey = 'valid-key';
      config.nodeEnv = 'production';
      req.get.mockReturnValue('invalid-key');

      await authorizeRequest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if API key is missing in production', async () => {
      config.apiKey = 'valid-key';
      config.nodeEnv = 'production';
      req.get.mockReturnValue(null);

      await authorizeRequest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() regardless of API key in non-production', async () => {
      config.apiKey = 'valid-key';
      config.nodeEnv = 'development';
      req.get.mockReturnValue('invalid-key');

      await authorizeRequest(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() with no API key in non-production', async () => {
      config.apiKey = 'valid-key';
      config.nodeEnv = 'development';
      req.get.mockReturnValue(null);

      await authorizeRequest(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
