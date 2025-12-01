jest.mock('fs');
const fs = require('fs');
const path = require('path');
const {
  createDirIfDoesNotExist,
  currentLocalDate,
  formatDateToISOString,
  isEmpty,
  listSubDirectories,
  getFileContent,
  parseNumericBoolean,
  paginate,
  validatePaginationParameters,
} = require('../../src/utils/utils');

describe('Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDirIfDoesNotExist', () => {
    it('should create directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const testDir = '/test/dir';

      createDirIfDoesNotExist(testDir);

      expect(fs.existsSync).toHaveBeenCalledWith(testDir);
      expect(fs.mkdirSync).toHaveBeenCalledWith(testDir, { recursive: true });
    });

    it('should not create directory if it already exists', () => {
      fs.existsSync.mockReturnValue(true);
      const testDir = '/test/dir';

      createDirIfDoesNotExist(testDir);

      expect(fs.existsSync).toHaveBeenCalledWith(testDir);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('currentLocalDate', () => {
    it('should return today date in local timezone', () => {
      const result = currentLocalDate();

      // The implementation builds a date from the local YYYY-MM-DD string.
      // Compare the ISO date part to the expected local date string to be robust across timezones.
      const expectedLocalDate = new Date().toLocaleString('sv', { timeZoneName: 'short' }).split(' ')[0];

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString().split('T')[0]).toBe(expectedLocalDate);
    });
  });

  describe('formatDateToISOString', () => {
    it('should format date to ISO string YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');

      const result = formatDateToISOString(date);

      expect(result).toBe('2024-01-15');
    });

    it('should handle dates with leading zeros', () => {
      const date = new Date('2024-03-05T00:00:00Z');

      const result = formatDateToISOString(date);

      expect(result).toBe('2024-03-05');
    });
  });

  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for object with properties', () => {
      expect(isEmpty({ name: 'test' })).toBe(false);
    });

    it('should return false for array', () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('test')).toBe(false);
    });
  });

  describe('listSubDirectories', () => {
    it('should list only subdirectories', () => {
      const mockDirents = [
        { isDirectory: () => true, name: 'dir1' },
        { isDirectory: () => false, name: 'file1.txt' },
        { isDirectory: () => true, name: 'dir2' },
      ];
      fs.readdirSync.mockReturnValue(mockDirents);

      const result = listSubDirectories('/test/dir');

      expect(result).toEqual(['dir1', 'dir2']);
      expect(fs.readdirSync).toHaveBeenCalledWith('/test/dir', { withFileTypes: true });
    });

    it('should return empty array when no directories exist', () => {
      const mockDirents = [
        { isDirectory: () => false, name: 'file1.txt' },
        { isDirectory: () => false, name: 'file2.txt' },
      ];
      fs.readdirSync.mockReturnValue(mockDirents);

      const result = listSubDirectories('/test/dir');

      expect(result).toEqual([]);
    });
  });

  describe('getFileContent', () => {
    it('should read and return file content', () => {
      const fileContent = 'file content';
      fs.readFileSync.mockReturnValue(fileContent);

      const result = getFileContent('/test/file.txt');

      expect(result).toBe(fileContent);
      expect(fs.readFileSync).toHaveBeenCalledWith('/test/file.txt', 'utf8');
    });
  });

  describe('parseNumericBoolean', () => {
    it('should convert 0 to false', () => {
      expect(parseNumericBoolean(0)).toBe(false);
    });

    it('should convert 1 to true', () => {
      expect(parseNumericBoolean(1)).toBe(true);
    });

    it('should return non-0/1 values as is', () => {
      expect(parseNumericBoolean(2)).toBe(2);
      expect(parseNumericBoolean('yes')).toBe('yes');
      expect(parseNumericBoolean(null)).toBe(null);
    });
  });

  describe('paginate', () => {
    const testArray = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it('should paginate array correctly with valid parameters', () => {
      const result = paginate(testArray, 1, 10);

      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(1);
      expect(result[9].id).toBe(10);
    });

    it('should return correct page 2', () => {
      const result = paginate(testArray, 2, 10);

      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(11);
      expect(result[9].id).toBe(20);
    });

    it('should return partial page on last page', () => {
      const result = paginate(testArray, 3, 10);

      expect(result).toHaveLength(5);
      expect(result[0].id).toBe(21);
      expect(result[4].id).toBe(25);
    });

    it('should throw error if limit is less than 1', () => {
      expect(() => paginate(testArray, 1, 0)).toThrow(
        'Limit query parameter must be greater than 0'
      );
      expect(() => paginate(testArray, 1, -1)).toThrow(
        'Limit query parameter must be greater than 0'
      );
    });

    it('should throw error if page is out of bounds', () => {
      expect(() => paginate(testArray, 0, 10)).toThrow(
        'Page query parameter must be between 1 and 3'
      );
      expect(() => paginate(testArray, 4, 10)).toThrow(
        'Page query parameter must be between 1 and 3'
      );
    });

    it('should handle single page correctly', () => {
      const result = paginate(testArray, 1, 100);

      expect(result).toHaveLength(25);
      expect(result).toEqual(testArray);
    });
  });

  describe('validatePaginationParameters', () => {
    it('should throw error if limit is missing', () => {
      const req = { query: { page: 1 } };

      expect(() => validatePaginationParameters(req)).toThrow(
        'limit query parameter is required when using pagination'
      );
    });

    it('should throw error if page is missing', () => {
      const req = { query: { limit: 10 } };

      expect(() => validatePaginationParameters(req)).toThrow(
        'page query parameter is required when using pagination'
      );
    });

    it('should not throw error if both parameters are present', () => {
      const req = { query: { limit: 10, page: 1 } };

      expect(() => validatePaginationParameters(req)).not.toThrow();
    });
  });
});
