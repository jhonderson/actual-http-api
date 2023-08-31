
const authorizeRequest = async (req, res, next) => {
  const apiKey = req.get('x-api-key');
  if ((!apiKey || process.env.API_KEY != apiKey) && process.env.NODE_ENV == 'production') {
    res.status(403).json({"error": "Forbidden"});
    return;
  }
  next();
}

exports.authorizeRequest = authorizeRequest;
