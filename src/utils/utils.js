var fs = require('fs');

exports.createDirIfDoesNotExist = (dir) => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
}

exports.currentLocalDate = () => {
  return new Date(new Date().toLocaleString( 'sv', { timeZoneName: 'short' } ).split(' ')[0]);
}

exports.formatDateToISOString = (date) => {
  return date.toISOString().split('T')[0];
}

exports.isEmpty = (obj) => {
  if (!obj) {
    return true;
  }
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

exports.listSubDirectories = (directory) => {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

exports.getFileContent = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
}

exports.parseNumericBoolean = (numericBoolean) => {
  return numericBoolean === 0 ? false : (numericBoolean === 1 ? true : numericBoolean);
}

exports.parseBoolean = (value) => {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
}

exports.paginate = (array, page, limit) => {
  const totalTransactions = array.length;
  // Ensure the limit number is greater than 0
  if (limit < 1) {
    throw new Error(`Limit query parameter must be greater than 0`);
  }
  const numOfPages = Math.ceil(totalTransactions / limit);
  // Ensure the page number is within bounds
  if (page < 1 || page > numOfPages) {
    throw new Error(`Page query parameter must be between 1 and ${numOfPages}. Changing limit parameter can also change the number of pages.`);
  }
  const selectedPage = Math.min(page, numOfPages);
  // Calculate the total number of pages
  const startIndex = (selectedPage - 1) * limit;
  const endIndex = startIndex + limit;
  // Slice the transactions for the current page
  const paginatedTransactions = array.slice(startIndex, endIndex);
  return paginatedTransactions
}

exports.validatePaginationParameters = (req) => {
  if (!req.query.limit) {
    throw new Error('limit query parameter is required when using pagination');
  }
  else if (!req.query.page) {
    throw new Error('page query parameter is required when using pagination');
  }
}