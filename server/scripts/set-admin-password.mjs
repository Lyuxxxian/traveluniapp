/**
 * 修改 store.json 中管理员密码（生产部署后执行，勿将真实密码写入仓库）
 *
 * 用法：
 *   cd server
 *   node scripts/set-admin-password.mjs <username> <newPassword>
 *
 * 示例（请在终端输入，不要写进代码）：
 *   node scripts/set-admin-password.mjs admin 'YourStrongPassword'
 */
import { loadStore, saveStore } from '../src/lib/store.js'

const username = process.argv[2]
const newPassword = process.argv[3]

if (!username || !newPassword) {
  console.error('用法: node scripts/set-admin-password.mjs <username> <newPassword>')
  process.exit(1)
}

if (newPassword.length < 8) {
  console.error('密码至少 8 位')
  process.exit(1)
}

const store = loadStore()
const admin = store.admins?.find((a) => a.username === username)
if (!admin) {
  console.error(`管理员不存在: ${username}`)
  process.exit(1)
}

admin.password = newPassword
saveStore()
console.log(`[set-admin-password] 已更新管理员「${username}」密码（仅写入 server/data/store.json，请勿提交真实口令到 Git）`)
