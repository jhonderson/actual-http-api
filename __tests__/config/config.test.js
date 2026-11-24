jest.mock('fs');
const fs = require('fs');

describe('Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadMandatorySecret', () => {
    it('should load secret from environment variable', () => {
      process.env.API_KEY = 'test-key';
      process.env.ACTUAL_SERVER_PASSWORD = 'test-password';

      const { config: cfg } = require('../../src/config/config');

      expect(cfg.apiKey).toBe('test-key');
      expect(cfg.actual.serverPassword).toBe('test-password');
    });

    it('should load secret from file path', () => {
      process.env.API_KEY_PATH = '/path/to/secret';
      process.env.ACTUAL_SERVER_PASSWORD = 'test-password';
      const fs = require('fs');
      fs.readFileSync = jest.fn().mockReturnValue('secret-from-file\n');

      const { config: cfg } = require('../../src/config/config');

      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/secret', 'utf8');
      expect(cfg.apiKey).toBe('secret-from-file');
    });

    it('should prioritize direct environment variable over file path', () => {
      process.env.API_KEY = 'direct-secret';
      process.env.API_KEY_PATH = '/path/to/secret';
      process.env.ACTUAL_SERVER_PASSWORD = 'test-password';
      const fs = require('fs');
      fs.readFileSync = jest.fn().mockReturnValue('file-secret\n');

      const { config: cfg } = require('../../src/config/config');

      expect(cfg.apiKey).toBe('direct-secret');
      // fs.readFileSync may be called by dotenv config() if .env file exists, so we just verify the right secret is loaded
    });

    it('should throw error if secret is not found', () => {
      delete process.env.API_KEY;
      delete process.env.API_KEY_PATH;
      process.env.ACTUAL_SERVER_PASSWORD = 'test-password';

      expect(() => {
        require('../../src/config/config');
      }).toThrow('Missing required secret: API_KEY or API_KEY_PATH');
    });

    it('should throw error if file read fails', () => {
      process.env.API_KEY_PATH = '/invalid/path';
      process.env.ACTUAL_SERVER_PASSWORD = 'test-password';
      const fs = require('fs');
      fs.readFileSync = jest.fn().mockImplementation(() => {
        throw new Error('ENOENT: no such file');
      });

      expect(() => {
        require('../../src/config/config');
      }).toThrow('Failed to read secret file');
    });
  });

  describe('Actual server credentials', () => {
    beforeEach(() => {
      process.env.API_KEY = 'test-api-key';
      delete process.env.ACTUAL_SERVER_PASSWORD;
      delete process.env.ACTUAL_SERVER_PASSWORD_PATH;
      delete process.env.ACTUAL_SERVER_SESSION_TOKEN;
      delete process.env.ACTUAL_SERVER_SESSION_TOKEN_PATH;
    });

    it('should use the password when only the password is set', () => {
      process.env.ACTUAL_SERVER_PASSWORD = 'password';

      const { config: cfg } = require('../../src/config/config');

      expect(cfg.actual.serverPassword).toBe('password');
      expect(cfg.actual.serverSessionToken).toBeUndefined();
    });

    it('should use the Actual session token when only the session token is set', () => {
      process.env.ACTUAL_SERVER_SESSION_TOKEN = 'session-token';

      const { config: cfg } = require('../../src/config/config');

      expect(cfg.actual.serverSessionToken).toBe('session-token');
      expect(cfg.actual.serverPassword).toBeUndefined();
    });

    it('should load the Actual session token from a file path', () => {
      process.env.ACTUAL_SERVER_SESSION_TOKEN_PATH = '/path/to/session-token';
      const fs = require('fs');
      fs.readFileSync = jest.fn().mockReturnValue('token-from-file\n');

      const { config: cfg } = require('../../src/config/config');

      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/session-token', 'utf8');
      expect(cfg.actual.serverSessionToken).toBe('token-from-file');
    });

    it('should throw if both the password and the Actual session token are set', () => {
      process.env.ACTUAL_SERVER_PASSWORD = 'password';
      process.env.ACTUAL_SERVER_SESSION_TOKEN = 'session-token';

      expect(() => {
        require('../../src/config/config');
      }).toThrow('not both');
    });

    it('should throw if neither the password nor the Actual session token is set', () => {
      expect(() => {
        require('../../src/config/config');
      }).toThrow('Missing required secret: ACTUAL_SERVER_PASSWORD');
    });
  });

  describe('config object', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      process.env.PORT = '5007';
      process.env.API_KEY = 'test-api-key';
      process.env.ACTUAL_DATA_DIR = '/data';
      process.env.ACTUAL_SERVER_URL = 'http://localhost:5006';
      process.env.ACTUAL_SERVER_PASSWORD = 'password';
    });

    it('should have nodeEnv property', () => {
      const { config: cfg } = require('../../src/config/config');
      expect(cfg.nodeEnv).toBe('test');
    });

    it('should use default port if not specified', () => {
      delete process.env.PORT;
      const { config: cfg } = require('../../src/config/config');
      expect(cfg.port).toBe(5007);
    });

    it('should use custom port if specified', () => {
      process.env.PORT = '3000';
      const { config: cfg } = require('../../src/config/config');
      expect(cfg.port).toBe('3000');
    });

    it('should close an idle Actual client after 60 minutes by default', () => {
      delete process.env.ACTUAL_CLIENT_IDLE_TIMEOUT_MINUTES;
      const { config: cfg } = require('../../src/config/config');
      expect(cfg.actualClientIdleTimeoutMinutes).toBe(60);
    });

    it('should read the idle timeout of the Actual client in minutes', () => {
      process.env.ACTUAL_CLIENT_IDLE_TIMEOUT_MINUTES = '15';
      const { config: cfg } = require('../../src/config/config');
      expect(cfg.actualClientIdleTimeoutMinutes).toBe(15);
    });

    it.each(['0', '-5', 'abc'])('should reject an idle timeout of "%s"', (value) => {
      process.env.ACTUAL_CLIENT_IDLE_TIMEOUT_MINUTES = value;
      expect(() => require('../../src/config/config')).toThrow('ACTUAL_CLIENT_IDLE_TIMEOUT_MINUTES must be a positive number of minutes');
    });

    it('should have actual configuration', () => {
      const { config: cfg } = require('../../src/config/config');
      expect(cfg.actual).toBeDefined();
      expect(cfg.actual.dataDir).toBe('/data');
      expect(cfg.actual.serverUrl).toBe('http://localhost:5006');
      expect(cfg.actual.serverPassword).toBe('password');
    });
  });
});
