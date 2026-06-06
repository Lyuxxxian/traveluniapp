# 管理端生产部署与安全（M15-07）

## 1. 后端

### 环境变量

| 变量 | 开发 | 生产 |
| --- | --- | --- |
| `NODE_ENV` | 可不设 | **`production`** |
| `JWT_SECRET` | 默认 dev 密钥 | **必须**改为强随机值 |
| `ADMIN_AUTH_DISABLED` | 可 `true` 跳过鉴权 | **禁止**（设为 true 时进程会退出） |

参考 `server/.env.example`。

### 修改管理员密码

种子账号（**仅首次生成 store.json 时**）：

- 用户名：`admin`
- 默认口令：`DevOnly!2026`（**不得用于生产**）

**生产上线前**在服务器执行（密码在终端输入，不要写进仓库）：

```bash
cd server
node scripts/set-admin-password.mjs admin '你的强密码'
# 或
npm run admin:set-password -- admin '你的强密码'
```

密码写入 `server/data/store.json` 的 `admins[].password`（当前为明文存储，生产环境请限制该文件权限）。

### 启动

```bash
cd server
NODE_ENV=production JWT_SECRET='你的密钥' npm start
```

## 2. 管理后台 H5（admin-web）

完整说明见 **[admin-web/README.md](../../admin-web/README.md)**（本地 dev、生产 build、`VITE_API_BASE_URL`、Nginx 反代、CORS）。

```bash
cd admin-web
cp .env.production.example .env.production
# 编辑 .env.production，设置 VITE_API_BASE_URL 为生产 API
npm install
npm run build
npm run preview   # 可选：本地验收 dist/ 能否登录
```

构建产物在 `admin-web/dist/`；推荐 Nginx 同域反代 `/api/`（见 `admin-web/nginx.conf.example`）。

## 3. 验收

```bash
# 错误密码应 401
curl -s -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'

cd server && npm run verify:admin
cd ../admin-web && npm run build
```

`verify:admin` 会校验：错误密码 401、正确密码 200、受保护接口需 Token。

## 4. 勿提交到 Git

- 真实生产密码
- 含生产 `JWT_SECRET` 的 `.env`
- 已填写真实域名的 `.env.production`（若含内网信息）
