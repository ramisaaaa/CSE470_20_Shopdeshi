exports.health = (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
};

exports.apiHealth = (_req, res) => {
  res.json({ status: 'OK', message: 'API is running', timestamp: new Date().toISOString() });
};


