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

    it('should have actual configuration', () => {
      const { config: cfg } = require('../../src/config/config');
      expect(cfg.actual).toBeDefined();
      expect(cfg.actual.dataDir).toBe('/data');
      expect(cfg.actual.serverUrl).toBe('http://localhost:5006');
      expect(cfg.actual.serverPassword).toBe('password');
    });
  });
});
