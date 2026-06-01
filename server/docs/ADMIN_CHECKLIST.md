# 管理端联调清单（MVP + 内容）

## 启动

1. 后端：`cd server && npm run dev`（端口 3000，单实例）
2. 管理端：`cd admin-web && npm install && npm run dev`（端口 5174）
3. C 端联调：`.env.local` 按需开启 `VITE_HOME_USE_REMOTE_API` / `VITE_DISCOVER_USE_REMOTE_API`

## 冒烟

```bash
cd server && npm run verify:admin
```

## 手工验收

- [ ] admin 登录失败/成功提示
- [ ] 改 FAQ → 小程序帮助中心可见
- [ ] 工单 adminReply → 用户工单列表可见
- [ ] 点评 rejected → 发现详情点评 Tab 不展示
- [ ] 改首页轮播 → 小程序首页 onMounted 拉配置可见
- [ ] 发现帖 status=draft → C 端列表不展示

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `ADMIN_AUTH_DISABLED=true` | 仅本地跳过管理端鉴权 |
| `JWT_SECRET` | 与 C 端用户 JWT 共用密钥（开发默认即可） |
