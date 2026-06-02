try {
  module.exports = require('../server');
} catch (err) {
  console.error('[enrollflo] INIT ERROR:', err.message, err.stack);
  module.exports = (req, res) => {
    res.status(500).json({ error: 'Init failed', message: err.message });
  };
}
