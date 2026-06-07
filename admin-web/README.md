# 灵山文旅管理后台（admin-web）

Vue 3 + Element Plus 管理端，对接 `traveluniapp/server` 的 `/api/admin/*` 接口。

## 前置条件

- Node.js 18+
- 后端已启动：`cd ../server && npm run dev`（默认 `http://localhost:3000`）

## 本地开发

```bash
cd admin-web
npm install
npm run dev
```

浏览器打开 **http://localhost:5174**。

环境变量见 `.env.development`（默认 `VITE_API_BASE_URL=http://localhost:3000`）。

开发默认账号（仅本地，勿用于生产）：

| 用户名 | 密码 |
| --- | --- |
| `admin` | `DevOnly!2026` |

生产改密与安全说明见 [../server/docs/ADMIN_PRODUCTION.md](../server/docs/ADMIN_PRODUCTION.md)。

## 环境变量

| 文件 | 用途 |
| --- | --- |
| `.env.development` | `npm run dev` 自动加载 |
| `.env.production` | `npm run build` 自动加载（**勿提交 Git**，已加入 `.gitignore`） |
| `.env.production.example` | 生产配置模板，复制后修改 |

### `VITE_API_BASE_URL`

管理端所有 API 请求的根地址（**无尾斜杠**），构建时写入前端产物。

| 场景 | 示例值 |
| --- | --- |
| 本地开发 | `http://localhost:3000` |
| 生产：前后端同域（推荐，走 Nginx 反代） | 留空或 `https://admin.your-domain.com` |
| 生产：API 独立域名 | `https://api.your-domain.com` |

```bash
# 生产构建前
cp .env.production.example .env.production
# 编辑 VITE_API_BASE_URL
```

修改 `.env.production` 后需 **重新 `npm run build`** 才会生效。

## 生产构建

```bash
cd admin-web
npm install
npm run build
```

产物目录：`dist/`（静态 HTML/JS/CSS）。

### 本地预览构建结果

**常见 Network Error 原因**：`.env.production` 仍写着示例域名 `https://api.your-domain.com`，构建后浏览器会去连一个不存在的地址。

推荐用**本地验收专用命令**（使用 `.env.preview` → `http://localhost:3000`）：

```bash
# 先确保后端：cd ../server && npm run dev
npm run preview:local
# 打开 http://localhost:5174 ，账号 admin / DevOnly!2026
```

若用 `npm run build` + `npm run preview`，须先把 `.env.production` 里的 `VITE_API_BASE_URL` 改为 `http://localhost:3000` 再 **重新 build**。

### 验收清单

- [ ] `dist/index.html` 可通过静态服务或 `npm run preview` 打开
- [ ] 登录页可访问，错误密码有提示
- [ ] 使用正确管理员账号可进入概览页
- [ ] 任一带数据页面（如问卷、首页配置）可正常加载列表

## 部署方式

### 方案 A：Nginx 托管静态 + 反代 API（推荐）

前后端**同域**，浏览器请求 `/api/*` 由 Nginx 转发到 Node，无需额外配置 CORS。

示例见 [nginx.conf.example](./nginx.conf.example)：

```nginx
# 管理后台静态
location / {
    root /var/www/traveluniapp-admin/dist;
    try_files $uri $uri/ /index.html;
}

# API 反代到 Node（与 server 同机或内网）
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

构建时 `.env.production`：

```env
VITE_API_BASE_URL=
```

或设为对外访问的完整域名（与浏览器地址栏一致）。

### 方案 B：静态与 API 不同域

- 静态：`https://admin.example.com` → `dist/`
- API：`https://api.example.com` → `server`（端口 3000）

`.env.production`：

```env
VITE_API_BASE_URL=https://api.example.com
```

后端已启用 `cors()`（`server/src/index.js`），允许浏览器跨域。生产若需收紧，可在服务端配置允许来源白名单。

## 目录说明

| 路径 | 说明 |
| --- | --- |
| `src/views/` | 业务页面（服务运营、内容管理等） |
| `src/api/admin.ts` | 管理端 API 封装 |
| `src/utils/request.ts` | Axios 实例与 `VITE_API_BASE_URL` |
| `dist/` | 构建输出（部署用） |

## 相关文档

- [server/docs/ADMIN_CHECKLIST.md](../server/docs/ADMIN_CHECKLIST.md) — 联调与手工验收
- [server/docs/ADMIN_PRODUCTION.md](../server/docs/ADMIN_PRODUCTION.md) — 生产安全、改密、JWT
- [API接口文档v4.md](../API接口文档v4.md) — §15 管理端接口

## 常见问题

**登录后接口 401**

- 确认 `VITE_API_BASE_URL` 与浏览器实际访问的 API 地址一致
- 生产勿开启 `ADMIN_AUTH_DISABLED`
- 检查 `JWT_SECRET` 是否与签发 Token 时一致

**刷新子路由 404**

- SPA 需 Nginx `try_files ... /index.html`（见 `nginx.conf.example`）

**构建后仍请求 localhost:3000**

- 未配置 `.env.production` 或构建前未保存；重新 build
