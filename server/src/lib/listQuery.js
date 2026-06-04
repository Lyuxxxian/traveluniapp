import { paginate } from './response.js'

/** 无 page/pageSize 时返回全量数组；有时返回分页结构 */
export function respondList(res, okFn, list, req, options = {}) {
  const { statusKey = 'status' } = options
  let filtered = [...list]
  const status = req.query[statusKey]
  if (status) {
    filtered = filtered.filter((row) => row[statusKey] === status)
  }
  if (req.query.page || req.query.pageSize) {
    return okFn(res, paginate(filtered, req.query.page, req.query.pageSize))
  }
  return okFn(res, filtered)
}
