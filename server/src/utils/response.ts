const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const response: any = {
    success: true,
    message,
  };

  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;

  return res.status(statusCode).json(response);
};

const sendError = (res, { statusCode = 500, message = 'Internal server error', errors = null } = {}) => {
  const response: any = {
    success: false,
    message,
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
