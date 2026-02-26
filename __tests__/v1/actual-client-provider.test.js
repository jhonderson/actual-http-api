// Ensure required secrets exist before importing modules that load config at module initialization
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';
jest.mock('fs');
jest.mock('@actual-app/api', () => ({
  init: jest.fn(),
  shutdown: jest.fn(),
}), { virtual: true });

let provider;

describe('Actual Client Provider', () => {
  let actualApi;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();

    // Mock the config (mutate after module load)
    const cfg = require('../../src/config/config').config;
    cfg.actual = {
      dataDir: '/test/data',
      serverUrl: 'http://localhost:5006',
      serverPassword: 'password',
    };

    // Clean up the module cache to reset singleton state and require provider after config is set
    delete require.cache[require.resolve('../../src/v1/actual-client-provider')];
    provider = require('../../src/v1/actual-client-provider');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clear any pending timers (e.g., the 1-hour timeout set by initializeActualApiClient)
    jest.clearAllTimers();
    // Invalidate the actual API client singleton to prevent hanging timers between tests
    try {
      const provider = require('../../src/v1/actual-client-provider');
      // Access the internals via shutdown if needed or just let module cache cleanup handle it
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('getActualDataDir', () => {
    it('should create directory if it does not exist', () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.mkdirSync = jest.fn();

      provider.getActualDataDir();

      expect(fs.existsSync).toHaveBeenCalledWith('/test/data');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/test/data', { recursive: true });
    });

    it('should return the configured data directory', () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);

      const result = provider.getActualDataDir();

      expect(result).toBe('/test/data');
    });
  });

  describe('getActualApiClient', () => {
    it('should initialize API client on first call', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);
      const mockActualApi = {
        init: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined),
      };
      jest.doMock('@actual-app/api', () => mockActualApi);

      const client = await provider.getActualApiClient();

      expect(client).toBeDefined();
    });

    it('should reuse client on subsequent calls within timeout', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);
      const mockActualApi = {
        init: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined),
      };
      jest.doMock('@actual-app/api', () => mockActualApi);
      
      const client1 = await provider.getActualApiClient();
      const client2 = await provider.getActualApiClient();

      // Both calls should return same instance, and init should only be called once
      expect(client1).toBe(client2);
      expect(mockActualApi.init).toHaveBeenCalledTimes(1);
    });

    it('should configure API client with correct options', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);
      const mockActualApi = {
        init: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined),
      };
      jest.doMock('@actual-app/api', () => mockActualApi);

      await provider.getActualApiClient();

      expect(mockActualApi.init).toHaveBeenCalledWith({
        dataDir: '/test/data',
        serverURL: 'http://localhost:5006',
        password: 'password',
      });
    });
  });

  describe('runAqlQuery', () => {
    it('should call aqlQuery on the API client', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);
      
      const mockQueryResult = { data: [{ id: 'test' }] };
      const mockActualApi = {
        init: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined),
        aqlQuery: jest.fn().mockResolvedValue(mockQueryResult),
      };
      jest.doMock('@actual-app/api', () => mockActualApi);

      const mockQuery = { table: 'accounts', select: ['id'] };
      const result = await provider.runAqlQuery(mockQuery);

      expect(mockActualApi.aqlQuery).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockQueryResult);
    });

    it('should return query results', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);
      
      const expectedData = { 
        data: [
          { account: 'acc1', total: 5000 },
          { account: 'acc2', total: 3000 }
        ] 
      };
      const mockActualApi = {
        init: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined),
        aqlQuery: jest.fn().mockResolvedValue(expectedData),
      };
      jest.doMock('@actual-app/api', () => mockActualApi);

      const mockQuery = { table: 'transactions', groupBy: ['account'] };
      const result = await provider.runAqlQuery(mockQuery);

      expect(result).toEqual(expectedData);
      expect(result.data).toHaveLength(2);
    });

    it('should get API client before running query', async () => {
      const fs = require('fs');
      fs.existsSync = jest.fn().mockReturnValue(true);
      
      const mockActualApi = {
        init: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined),
        aqlQuery: jest.fn().mockResolvedValue({ data: [] }),
      };
      jest.doMock('@actual-app/api', () => mockActualApi);

      await provider.runAqlQuery({});

      // Verify init was called (meaning getActualApiClient was invoked)
      expect(mockActualApi.init).toHaveBeenCalled();
      expect(mockActualApi.aqlQuery).toHaveBeenCalled();
    });
  });
});
