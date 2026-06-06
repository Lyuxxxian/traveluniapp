# 管理端联调清单（MVP + 内容 + M2 地图）

## 启动

1. 后端：`cd server && npm run dev`（端口 3000，单实例）
2. 管理端：`cd admin-web && npm install && npm run dev`（端口 5174）
3. C 端联调：项目根目录 `.env.local` 按需开启远程 API（改 env 后须**重启** C 端 dev）

| 变量 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL=http://localhost:3000` | C 端 API 根地址 |
| `VITE_HOME_USE_REMOTE_API=true` | 首页配置走 `/api/home/config` |
| `VITE_DISCOVER_USE_REMOTE_API=true` | 发现走 `/api/discover/*` |
| `VITE_MAP_USE_REMOTE_API=true` | 地图走 `/api/map/*`（失败仍 fallback 本地 mock） |
| `VITE_SERVICE_USE_REMOTE_API=true` | 服务层点评/问卷/工单等 |

## 冒烟（自动化）

```bash
# 管理端全量（含 M2 地图管理 API）
cd server && npm run verify:admin

# M2 地图专项
cd server && npm run verify:map-all
# 等价于：verify:map-api + verify:map-admin + verify:map-import

# 仅公开地图 API
cd server && npm run verify:map

# 仅管理端地图 + 公开同步
cd server && npm run verify:map-admin

# 批量导入模板预检（无需 server）
cd server && npm run verify:map-import

# C 端地图静态 + 文档字段 + 公开 API（项目根目录，需 server）
npm run verify:map
```

## M2 地图（手工验收）

- [x] 公开 `GET /api/map/categories|points|routes` 非空（`verify:map-api`）
- [x] 管理端点位 CRUD + 改 title → 公开 API 同步（`verify:map-admin`）
- [x] 管理端分类：冻结五类不可删、改 label → 公开分类同步（`verify:map-admin`）
- [x] 批量导入模板 10 条 id 唯一预检（`verify:map-import`；流程见 [MAP_DATA_INGEST.md](./MAP_DATA_INGEST.md)）
- [ ] **admin-web**：地图运营 → 点位管理：列表筛选、编辑保存、关闭/开放
- [ ] **admin-web**：改某点位 **标题** 保存后，C 端 `VITE_MAP_USE_REMOTE_API=true` 重启 dev，地图 marker 显示新标题
- [ ] C 端关闭远程或停后端时，地图仍 fallback 本地数据不白屏
- [ ] `npm run map:import:dry -- data/my-points.json` 通过后再正式 `map:import`

相关文档：API v4 §8、§15.4–15.5；入库 [MAP_DATA_INGEST.md](./MAP_DATA_INGEST.md)。

## 手工验收（首期）

- [x] admin 登录失败/成功提示（API 已验；UI 见 admin-web 登录页）
- [x] 改 FAQ → 小程序帮助中心可见（`verify-p0-checklist.mjs`）
- [x] 工单 adminReply → 用户工单列表可见（`verify-p0-checklist.mjs`）
- [x] 点评 rejected → 发现详情点评 Tab 不展示（公开 `/api/reviews` 已验）
- [x] 改首页轮播 → 小程序首页 onMounted 拉配置可见（`GET /api/home/config` 已验；需 `VITE_HOME_USE_REMOTE_API=true`）
- [x] 发现帖 status=draft → C 端列表不展示（`verify-p0-checklist.mjs`；需 `VITE_DISCOVER_USE_REMOTE_API=true`）
- [x] 用户提交问卷 → 列表显示「已填写」；管理端 **服务运营 → 问卷 → 答卷** 可查看明细
- [x] 用户账号隔离：手机号/注册/微信分用户；订单与优惠券按 `userId`

自动化：`cd server && npm run verify:p0`

## 环境变量（服务端）

| 变量 | 说明 |
| --- | --- |
| `ADMIN_AUTH_DISABLED=true` | 仅本地跳过管理端鉴权（**生产禁止**，见 [ADMIN_PRODUCTION.md](./ADMIN_PRODUCTION.md)） |
| `JWT_SECRET` | 与 C 端用户 JWT 共用密钥（生产必改） |
| `ADMIN_DEV_PASSWORD` | 运行 `verify:admin` 时若已改密，设此变量 |

## 生产部署（M15-07）

详见 [ADMIN_PRODUCTION.md](./ADMIN_PRODUCTION.md)。开发默认管理员：`admin` / `DevOnly!2026`。

## 管理端 README 与部署（M15-08）

详见 [admin-web/README.md](../../admin-web/README.md)。

- [ ] `cd admin-web && npm run build` 成功
- [ ] `npm run preview` 或 Nginx 托管 `dist/` 可打开登录页
- [ ] 使用管理员账号可登录并进入概览
- [ ] 侧栏 **地图运营 → 点位管理** 可访问（M2-MAP-04）
