const crypto = require('crypto');

const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateSecureToken,
  hashToken,
};
