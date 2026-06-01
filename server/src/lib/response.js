export function ok(res, data, message = 'success') {
  return res.json({ code: 200, message, data })
}

export function fail(res, code, message, httpStatus = 200) {
  return res.status(httpStatus).json({ code, message, data: null })
}

export function paginate(list, page = 1, pageSize = 10) {
  const safePage = Math.max(1, Number(page) || 1)
  const safeSize = Math.min(50, Math.max(1, Number(pageSize) || 10))
  const start = (safePage - 1) * safeSize
  const slice = list.slice(start, start + safeSize)
  return {
    list: slice,
    page: safePage,
    pageSize: safeSize,
    total: list.length,
    hasMore: start + slice.length < list.length,
  }
}
