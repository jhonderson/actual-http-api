const { config } = require('../../config/config');

const authorizeRequest = async (req, res, next) => {
  const apiKey = req.get('x-api-key');
  if ((!apiKey || config.apiKey != apiKey) && config.nodeEnv == 'production') {
    res.status(403).json({"error": "Forbidden"});
    return;
  }
  next();
}

exports.authorizeRequest = authorizeRequest;
