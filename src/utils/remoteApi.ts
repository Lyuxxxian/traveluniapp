/**
 * 开发环境默认走本机 server（与 admin 运营数据同源）；
 * 生产构建默认 mock，除非显式设置 VITE_*_USE_REMOTE_API=true。
 * 设为 false 可强制使用本地 mock。
 */
export function isRemoteApiEnabled(envFlag?: string): boolean {
  if (envFlag === 'true') return true
  if (envFlag === 'false') return false
  return import.meta.env.DEV
}
