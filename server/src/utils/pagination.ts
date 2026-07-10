const parsePagination = (query: Record<string, unknown> = {}) => {
  const page = Math.max(1, Number.parseInt(String(query.page ?? ''), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(query.limit ?? ''), 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildPaginationMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
