const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  pwdChangedAt: number;
}

const signAccessToken = (payload: Omit<TokenPayload, 'pwdChangedAt'> & { pwdChangedAt?: number }): string => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      pwdChangedAt: payload.pwdChangedAt || 0,
    },
    jwtConfig.access.secret,
    { expiresIn: jwtConfig.access.expiresIn }
  );
};

const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtConfig.access.secret) as TokenPayload;
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
