const sendSuccess = (
  res,
  { statusCode = 200, message = 'Success', data = null, meta = null } = {}
) => {
  const response: Record<string, unknown> = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (res.req?.requestId) response.requestId = res.req.requestId;
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;

  return res.status(statusCode).json(response);
};

const sendError = (
  res,
  { statusCode = 500, message = 'Internal server error', errors = null } = {}
) => {
  const response: Record<string, unknown> = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    errors: errors || [],
  };

  if (res.req?.requestId) response.requestId = res.req.requestId;

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
