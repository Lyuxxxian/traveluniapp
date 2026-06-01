# 灵山文旅 API 服务（服务层第 4 步）

Node.js + Express，契约对齐 [API接口文档v4.md](../API接口文档v4.md) 第 13 章。

## 启动

```bash
cd server
npm install
npm run dev
```

默认 `http://localhost:3000`，与前端 `VITE_API_BASE_URL` 一致。

## 联调前端

在 `traveluniapp/.env.local`：

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SERVICE_USE_REMOTE_API=true
```

## 已实现接口

| 模块 | 接口 |
| --- | --- |
| 认证 | `POST /api/auth/login`、`POST /api/auth/register` |
| 用户 | `GET/PUT /api/user/profile` |
| 上传 | `POST /api/upload/image`（字段 `file`） |
| 帮助 | `GET /api/ai-service/faqs`、`GET /api/service/config` |
| 点评 | `POST /api/reviews`、`GET /api/reviews`、`GET /api/user/reviews` |
| 反馈 | `POST /api/feedback` |
| 问卷 | `GET /api/questionnaires`、`GET /api/questionnaires/:id`、`POST .../submit` |
| 工单 | `POST /api/support/tickets`、`GET /api/user/support/tickets` |
| 管理端（开发） | `GET/PUT /api/admin/feedback`、`GET/PUT /api/admin/support/tickets`、`GET/PUT /api/admin/reviews` |

## 数据存储

JSON 文件：`server/data/store.json`（首次启动从 `src/data/seed.js` 初始化）。

## 测试账号

- 用户名：`test`
- 密码：`123456`

## 自检

```bash
npm run verify
```
