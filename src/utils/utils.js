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

exports.validateMandatoryEnvironmentVariables = (mandatoryEnvVars) => {
  for (const mandatoryEnvVar of mandatoryEnvVars) {
    console.log((mandatoryEnvVar in process.env));
    console.log((process.env[mandatoryEnvVar]));
    if (!(mandatoryEnvVar in process.env)) {
      throw Error(`${mandatoryEnvVar} environment variable is mandatory`);
    }
  }
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