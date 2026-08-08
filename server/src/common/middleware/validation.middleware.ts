const { ZodError } = require('zod');

/**
 * Express 5 makes req.query/req.params read-only getters — merge parsed values instead of reassigning.
 */
const replaceRequestData = (req, key, parsed) => {
  const current = req[key];

  if (current && typeof current === 'object') {
    for (const prop of Object.keys(current)) {
      delete current[prop];
    }
    Object.assign(current, parsed);
    return;
  }

  Object.defineProperty(req, key, {
    value: parsed,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

/**
 * Zod validation middleware.
 * @param {{ body?: import('zod').ZodType, params?: import('zod').ZodType, query?: import('zod').ZodType }} schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      replaceRequestData(req, 'body', schema.body.parse(req.body ?? {}));
    }

    if (schema.params) {
      replaceRequestData(req, 'params', schema.params.parse(req.params));
    }

    if (schema.query) {
      replaceRequestData(req, 'query', schema.query.parse(req.query));
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      error.statusCode = 400;
      error.isValidationError = true;
    }

    next(error);
  }
};

const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));

module.exports = {
  validate,
  formatZodErrors,
};
