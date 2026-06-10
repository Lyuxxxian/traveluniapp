# 旅游 AI 助手 - API 接口文档 v4

## 1. 文档说明

- 项目名称：灵山文旅 AI 助手微信小程序
- 前端技术栈：UniApp + Vue 3 + Vite
- 文档版本：v4.0
- 更新日期：2026-05-30
- 文档目标：基于当前前端状态，重新整理后续接口、开发顺序、地图改造范围、数字人 AI 接入方案和管理员端能力。

### 1.1 当前前端状态

当前项目已经完成或已有基础雏形：

- 基础层：登录、注册、用户资料、头像上传封装、统一请求封装已有前端代码。
- 商城交易闭环：门票、酒店、年卡、优惠券、商品详情、下单、订单列表、订单详情、模拟支付已有前端 mock 闭环。
- 内容层：已经新增首页配置、发现内容、搜索相关 API mock；首页、发现、搜索已开始从 mock 数据结构接入。
- 地图页：已有静态地图 UI、分类、点位、marker 点击、底部详情卡、导航按钮。当前只补了返回按钮，用于从其它页面进入地图后返回来源页。
- 数字人 AI：已有 `src/pages/ai/index.vue` 简易页面，包含数字人展示、快捷提问、文字输入、语音识别、语音播报、知识库兜底与 AI 请求。

当前仍未完成或存在风险：

- 地图点位、分类、路线、卫生间、停车场、餐饮、服务点等还不是完整真实数据。
- 地图模块当前暂不应由内容层开发直接重构，后续需要专项完善。
- 数字人 AI 目前非常简易，缺少后端代理、会话、知识库、流式响应、TTS/STT 服务化、敏感词与日志。
- 当前 `src/api/ai.ts` 存在前端直连大模型并暴露 API Key 的安全风险，后续必须改成后端代理。
- 大量接口仍为前端 mock，后端真实接口待联调。

---

## 2. 总体开发建议

### 2.1 推荐开发顺序

后续建议按以下顺序推进：

0. 接口契约冻结（先做，必须完成）
   - 先冻结地图、首页、发现、搜索涉及的接口契约：字段名、字段类型、分页结构、筛选参数、错误码语义。
   - 地图核心参数至少冻结：`category`、`pointId`、`keyword`、经纬度、点位基础属性。
   - 冻结后进入并行开发；若必须变更，走“版本升级或兼容字段”流程，不允许直接破坏现有字段。

#### 2.1.0 接口契约冻结结果（已冻结）

本次冻结范围：地图、首页、发现、搜索。冻结后，前端 mock、后端真实接口、管理员端录入字段必须保持同一字段名、字段类型和语义。

通用响应结构冻结：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| code | number | 是 | 业务状态码，`200` 表示成功 |
| message | string | 是 | 状态说明 |
| data | any | 是 | 业务数据；列表、详情和分页结构按各接口定义 |

地图入口参数冻结：

| 参数 | 类型 | 必填 | 来源 | 说明 |
| --- | --- | --- | --- | --- |
| category | string | 否 | 首页、发现、搜索、地图分类 | 点位分类，当前至少保留 `spot`、`food`、`toilet`、`parking`、`service` |
| pointId | number | 否 | 搜索、发现、详情入口 | 指定点位 ID，进入地图后优先定位并选中该点位 |
| keyword | string | 否 | 首页、发现、搜索、地图搜索框 | 地图点位搜索关键词 |
| latitude | number | 否 | 用户定位 | 当前纬度，用于距离计算或附近点位 |
| longitude | number | 否 | 用户定位 | 当前经度，用于距离计算或附近点位 |

地图接口冻结：

| 接口 | 方法 | 冻结参数/字段 | 说明 |
| --- | --- | --- | --- |
| `/api/map/categories` | GET | `key`、`label`、`icon`、`color`、`sort` | 获取地图分类；不得删除现有分类 |
| `/api/map/points` | GET | `category`、`keyword`、`latitude`、`longitude`、`includeClosed` | 获取地图点位；接口失败时前端保留本地兜底点位 |
| `/api/map/points/:id` | GET | `id`、点位基础字段、详情增强字段 | 获取点位详情；失败时继续展示列表基础信息 |
| `/api/map/routes` | GET | `scene`、`duration`、`pointIds` | 获取路线推荐；路线通过 `pointIds` 关联点位 |

地图点位基础字段冻结：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 点位唯一 ID，必须和 marker `id` 对应 |
| category | string | 是 | 点位分类 |
| title | string | 是 | 点位名称 |
| latitude | number | 是 | 纬度 |
| longitude | number | 是 | 经度 |
| address | string | 是 | 地址或景区内位置 |
| desc | string | 是 | 简介 |
| openTime | string | 否 | 开放或营业时间 |
| status | string | 否 | `open`、`closed`、`busy` 等状态 |
| tags | string[] | 否 | 点位标签 |
| iconKey | string | 否 | 点位图标标识 |
| distanceText | string | 否 | 距离文案 |

点位详情增强字段冻结：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| images | string[] | 否 | 点位图片 |
| suggestedDuration | string | 否 | 推荐停留时长 |
| serviceTags | string[] | 否 | 服务标签 |
| relatedShowIds | number[] | 否 | 关联演出 ID |
| relatedProductIds | number[] | 否 | 关联商品 ID |

变更规则冻结：

- 不允许删除 `category`、`pointId`、`keyword` 或改变其语义。
- 不允许删除现有地图分类，尤其是 `toilet`、`parking`、`service`。
- 不允许改变通用响应结构和分页结构。
- 允许新增可选字段；不允许直接重命名、删字段、改字段类型。
- 若必须发生不兼容变更，必须保留旧字段并新增兼容字段，或新增 `/v2` 接口。

1. 内容层收尾与联调准备（可与地图真实数据并行）
   - 首页配置、发现内容、搜索接口字段稳定。
   - 页面跳转路径统一，尤其是地图返回栈。
   - mock 数据结构和真实接口响应格式保持一致。

2. 地图专项开发
   - 不直接在内容层里零散修改地图。
   - 单独整理真实点位、分类、地图筛选、点位详情、路线推荐、厕所/停车/服务点等。
   - 保留现有地图交互，再逐步替换为接口数据。

3. 数字人 AI 服务层
   - 移除前端 API Key。
   - 后端代理 AI 对话。
   - 接入知识库、推荐问题、会话历史、景点讲解、路线推荐。
   - 后续再接语音识别、语音合成、数字人动作状态。

4. 服务层（**接口契约已冻结**，见 [2.1.3](#213-服务层接口契约冻结结果已冻结) 与 [第 13 章](#13-点评反馈问卷与客服服务)）
   - 点评、反馈、问卷、客服 FAQ（只读）、人工客服（电话 + 工单）。
   - 与用户资料、上传、订单、地图点位关联。
   - 本期不做数字人 AI 对话；帮助中心仅调用 `GET /api/ai-service/faqs`，不调用 `chat`。

5. 管理员端（**首期 MVP + 内容已实现**，见 [15.0](#150-管理端首期冻结范围mvp--内容2026-05-30)、`admin-web/`、`server` 管理路由）
   - 已实现：登录鉴权、服务运营、首页配置、发现内容、公开 `home`/`discover` API。
   - **M2 已纳入**：公开 `GET /api/map/*`（Gate 已完成）；[15.4–15.5](#154-地图点位管理) 管理端字段表已冻结，CRUD 见 M2-MAP-02/03。
   - 商品/酒店/优惠券/订单管理。
   - AI 知识库和 FAQ 管理。
   - 反馈与数据统计。

6. 真实联调与上线准备
   - 替换 mock。
   - 权限、登录态、错误码、分页、埋点、日志统一。
   - 小程序端兼容测试。

### 2.1.1 内容层收尾与地图真实数据并行规则（强约束）

为避免反复返工，内容层收尾与地图真实数据阶段必须遵循以下规则：

- 不修改既有接口字段名；不删除既有字段；不改变既有字段类型。
- 不修改通用响应外层结构（`code` / `message` / `data`）和分页结构。
- 地图筛选参数（如 `category`、`pointId`、`keyword`）保持兼容，不改名、不改语义。
- 若后端新增能力，优先“新增可选字段”，禁止直接替换旧字段。
- 若确需调整字段，必须采用以下其一：
  - 新增版本接口（如 `/v2/...`）；或
  - 保留旧字段并新增新字段，设置兼容过渡期。
- 内容层页面在联调期必须保留 mock fallback，接口异常时不白屏。
- 所有进入地图的路径必须继续使用 `uni.navigateTo('/pages/map/map?...')`，确保返回来源页。

### 2.1.2 字段变更审批模板（提交即评审）

使用说明：
- 任何涉及接口字段名、字段类型、字段语义、分页结构、筛选参数的变更，必须先提交本模板。
- 未审批通过，不得直接修改前后端实现。
- 变更完成后需回填联调结果并更新文档版本记录。

```md
# 字段变更审批单

## 1. 基本信息
- 申请人：
- 申请日期：
- 所属模块：`首页` / `发现` / `搜索` / `地图` / `其他`
- 接口路径：
- 请求方式：GET / POST / PUT / DELETE
- 计划上线版本：

## 2. 变更类型（可多选）
- [ ] 新增字段（向后兼容）
- [ ] 字段语义调整（不改名）
- [ ] 字段类型调整（潜在不兼容）
- [ ] 字段重命名（不兼容）
- [ ] 删除字段（不兼容）
- [ ] 分页结构调整（不兼容）
- [ ] 筛选参数调整（重点评审）

## 3. 变更明细
| 项 | 变更前 | 变更后 | 是否兼容 | 说明 |
|---|---|---|---|---|
| 字段名/参数名 |  |  | 是/否 |  |
| 字段类型 |  |  | 是/否 |  |
| 字段语义 |  |  | 是/否 |  |
| 默认值 |  |  | 是/否 |  |
| 必填/可选 |  |  | 是/否 |  |

## 4. 影响评估
- 影响页面：`首页` / `发现` / `搜索` / `地图` / `其他`
- 影响端：`H5` / `小程序` / `管理端` / `服务端`
- 影响范围说明：
- 是否影响现有导航参数（`category` / `pointId` / `keyword`）：是 / 否
- 是否影响历史数据解析：是 / 否

## 5. 兼容方案（必填）
- [ ] 保持原字段，同时新增字段（推荐）
- [ ] 新增 `/v2` 接口（推荐）
- [ ] 仅内部变更，无外部影响（需证明）
- 兼容期开始：
- 兼容期结束：
- 废弃字段计划移除版本：

## 6. 回滚方案（必填）
- 回滚触发条件：
- 回滚步骤：
- 数据回滚策略：
- 预计回滚耗时：

## 7. 联调与验收
- 联调负责人（前端）：
- 联调负责人（后端）：
- 测试负责人：
- 验收清单：
  - [ ] 接口正常返回
  - [ ] mock fallback 可用
  - [ ] 页面不白屏
  - [ ] 地图跳转与返回路径正常
  - [ ] 分页/筛选行为正确

## 8. 审批结论
- 后端负责人：
- 前端负责人：
- 产品/项目负责人：
- 结论：通过 / 驳回 / 补充信息
- 备注：
```

审批建议（默认规则）：
- 涉及字段重命名、删字段、改类型、改分页结构，默认按“不兼容变更”处理。
- 不兼容变更默认必须采用“保留旧字段 + 新字段”或“新增 `/v2` 接口”。
- 地图相关参数 `category` / `pointId` / `keyword` 如需调整，必须专项评审并提供完整回归清单。

### 2.1.3 服务层接口契约冻结结果（已冻结）

- **冻结日期**：2026-05-30
- **冻结范围**：点评、意见反馈、问卷、客服工单、帮助中心 FAQ（只读）、帮助中心静态配置。
- **不在本期冻结**：`POST /api/ai-service/chat`、流式对话、会话、知识库检索、ASR/TTS（归属数字人 AI 专项，见第 9 章）。
- **路径约定**：问卷以 v4 路径 `/api/questionnaires` 为准；v2/v3 的 `/api/surveys` 仅作历史参考，新实现不采用。

服务层接口冻结一览：

| 接口 | 方法 | 认证 | 说明 |
| --- | --- | --- | --- |
| `/api/reviews` | POST | 需要 | 提交点评 |
| `/api/reviews` | GET | 可选 | 按对象查点评列表（发现详情 Tab） |
| `/api/user/reviews` | GET | 需要 | 我的点评 |
| `/api/feedback` | POST | 需要 | 意见反馈 |
| `/api/questionnaires` | GET | 可选 | 进行中问卷列表 |
| `/api/questionnaires/:id` | GET | 可选 | 问卷题目 |
| `/api/questionnaires/:id/submit` | POST | 需要 | 提交问卷 |
| `/api/support/tickets` | POST | 需要 | 提交客服工单 |
| `/api/user/support/tickets` | GET | 需要 | 我的工单 |
| `/api/ai-service/faqs` | GET | 可选 | 帮助中心 FAQ（**只读**，服务层本期禁止调 chat） |
| `/api/service/config` | GET | 可选 | 帮助中心电话、工作时间（可与 faqs 合并返回） |

变更规则（与 2.1.0 一致）：

- 不允许删除或重命名上表路径及已冻结请求/响应字段。
- 不允许改变通用响应 `{ code, message, data }` 与分页结构。
- 允许新增**可选**字段；不兼容变更须保留旧字段或新增 `/v2`。
- 前端联调期须保留 mock fallback，提交失败时保留表单内容、不白屏。
- 图片须先 `POST /api/upload/image` 取得 `url`，再写入 `images` 数组（见第 14 章）。

### 2.2 本阶段开发边界

内容层开发只负责：

- 首页展示配置。
- 发现内容展示。
- 搜索聚合。
- 进入地图的跳转入口和返回路径。

内容层开发不负责：

- 重构地图页 UI。
- 删除或替换地图现有点位数据。
- 调整地图已有分类交互。
- 直接接入真实地图导航算法。

---

## 3. 基础约定

### 3.1 Base URL

```text
开发环境：http://localhost:3000
测试环境：https://test-api.example.com
生产环境：https://api.example.com
```

实际域名以后端部署为准。

### 3.2 通用请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
```

未登录可访问接口不需要 `Authorization`。

### 3.3 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 3.4 分页响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "list": []
  }
}
```

### 3.5 常用状态码

| code | 说明 |
| --- | --- |
| 200 | 请求成功 |
| 400 | 参数错误 |
| 401 | 未登录或登录失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 业务冲突 |
| 500 | 服务器错误 |

### 3.6 金额与时间

- 金额：后端统一使用分，例如 `21000` 表示 210 元。
- 时间：统一使用 `YYYY-MM-DD HH:mm:ss`。
- 日期：统一使用 `YYYY-MM-DD`。

---

## 4. 用户与认证模块

### 4.1 登录

- URL：`POST /api/auth/login`
- 认证：不需要

请求示例：

```json
{
  "username": "test",
  "password": "123456"
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "mock-token",
    "user": {
      "id": 1,
      "nickname": "灵山游客",
      "avatarUrl": "https://cdn.example.com/avatar.png",
      "phone": "13800000000"
    }
  }
}
```

### 4.2 微信授权登录

- URL：`POST /api/auth/wechat-login`
- 认证：不需要
- 当前状态：前端入口已有，后端待开发。

请求示例：

```json
{
  "code": "wx-login-code",
  "encryptedData": "",
  "iv": ""
}
```

### 4.3 手机号登录

- URL：`POST /api/auth/phone-login`
- 认证：不需要
- 当前状态：前端入口已有，后端待开发。

### 4.4 注册

- URL：`POST /api/auth/register`
- 认证：不需要

### 4.5 获取当前用户资料

- URL：`GET /api/user/profile`
- 认证：需要

### 4.6 更新用户资料

- URL：`PUT /api/user/profile`
- 认证：需要

---

## 5. 首页模块

首页模块用于驱动 `src/pages/index/index.vue`。当前前端已有 `src/api/home.ts` mock：

- `fetchHomeConfig()`
- `fetchHomeWeather()`
- `fetchShows(date?)`

### 5.1 获取首页配置

- URL：`GET /api/home/config`
- 认证：可选
- 当前前端：mock 已完成，真实接口待联调。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "heroSlides": [
      {
        "id": 1,
        "title": "灵山大佛全景",
        "subtitle": "在山湖之间仰望庄严佛光",
        "kicker": "Lingshan Grand Buddha",
        "imageUrl": "https://cdn.example.com/home/hero1.jpg",
        "themeColor": "#f8f1e3"
      }
    ],
    "matrixItems": [
      {
        "key": "dailyTicket",
        "title": "当日门票",
        "desc": "160元起",
        "icon": "ticketToday",
        "target": {
          "type": "ticket"
        }
      }
    ],
    "actionCards": [
      {
        "key": "buy",
        "title": "立即购买",
        "desc": "门票与套票",
        "icon": "buy",
        "target": {
          "type": "ticket"
        }
      }
    ],
    "collectionSections": [
      {
        "key": "shows",
        "title": "演出",
        "subtitle": "场次提醒 · 地点导航 · 演出介绍",
        "items": [
          {
            "id": 201,
            "title": "九龙灌浴",
            "desc": "大型音乐动态群雕表演",
            "tag": "Shows",
            "nextShowText": "11：30下一场",
            "background": "linear-gradient(140deg, #386b8f 0%, #8fbdda 100%)",
            "target": {
              "type": "map",
              "keyword": "九龙灌浴"
            }
          }
        ]
      }
    ],
    "feedItems": [
      {
        "id": 1,
        "type": "攻略推文",
        "title": "灵山集章全攻略",
        "desc": "整理隐藏章点和推荐动线，适合首次游玩。",
        "source": "游玩攻略",
        "actionText": "阅读",
        "background": "linear-gradient(140deg, #526f52 0%, #b5c987 100%)",
        "target": {
          "type": "discoverPost",
          "id": 2
        }
      }
    ]
  }
}
```

### 5.2 获取首页天气状态

- URL：`GET /api/home/weather`
- 认证：可选
- 当前前端：mock 已完成。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "icon": "☀",
    "temperature": "26°C",
    "airQuality": "良"
  }
}
```

### 5.3 获取演出场次

- URL：`GET /api/shows`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| date | string | 否 | 日期，默认当天 |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 201,
      "title": "九龙灌浴",
      "place": "九龙灌浴广场",
      "date": "2026-05-28",
      "times": ["10:00", "11:30", "13:30", "15:00"],
      "nextShowText": "11：30下一场"
    }
  ]
}
```

---

## 6. 发现内容模块

发现模块用于驱动：

- `src/pages/discover/discover.vue`
- `src/pages/discover/discoverDetail.vue`
- `src/api/discover.ts`

当前前端已经支持分类、分页 mock、详情多类型字段。

### 6.1 获取发现内容列表

- URL：`GET /api/discover/posts`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 否 | `recommend`、`activity`、`guide`、`show`、`food`、`creative` |
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 6,
    "list": [
      {
        "id": 1,
        "category": "activity",
        "title": "梵宫文化体验",
        "subtitle": "灵山梵宫",
        "priceText": "免费",
        "coverUrl": "https://cdn.example.com/discover/1.jpg",
        "tagText": "体验活动",
        "summary": "沉浸式体验佛前供奉香花活动，感受梵宫艺术空间。",
        "location": "灵山梵宫廊所庭",
        "publishTime": "今日推荐",
        "actionText": "预约",
        "target": {
          "type": "discoverPost",
          "id": 1
        }
      }
    ]
  }
}
```

### 6.2 获取发现内容详情

- URL：`GET /api/discover/posts/:id`
- 认证：可选

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "category": "activity",
    "title": "梵宫文化体验",
    "subtitle": "灵山梵宫",
    "priceText": "免费",
    "coverUrl": "https://cdn.example.com/discover/1.jpg",
    "tagText": "体验活动",
    "summary": "沉浸式体验佛前供奉香花活动，感受梵宫艺术空间。",
    "location": "灵山梵宫廊所庭",
    "publishTime": "今日推荐",
    "actionText": "预约",
    "place": "灵山梵宫廊所庭",
    "joinWay": "点击“立即预约”即可参与",
    "durationText": "约15分钟",
    "contentText": "伴随佛通宝塔升起，游客朋友们可以沉浸式体验佛前供奉香花活动。",
    "meaningText": "带您走进佛教文化艺术的神圣殿堂。",
    "detailImageUrl": "https://cdn.example.com/discover/detail1.jpg",
    "buttonText": "立即预约",
    "relatedTargets": [
      {
        "title": "查看梵宫位置",
        "desc": "在地图中查看活动地点",
        "target": {
          "type": "map",
          "keyword": "灵山梵宫"
        }
      }
    ]
  }
}
```

### 6.3 内容分类说明

| category | 说明 |
| --- | --- |
| recommend | 推荐 |
| activity | 体验活动 |
| guide | 攻略 |
| show | 演出 |
| food | 美食 |
| creative | 文创 |

---

## 7. 搜索模块

搜索模块用于驱动 `src/pages/search/search.vue` 和首页/商城搜索入口。

当前前端已经支持：

- 热门词。
- 历史搜索。
- 输入搜索。
- 类型筛选。
- 结果列表。
- 结果跳转。

### 7.1 获取热门搜索词

- URL：`GET /api/search/hot-keywords`
- 认证：可选

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    "灵山大佛门票",
    "九龙灌浴圣水瓶",
    "灵山禅茶",
    "素面",
    "梵宫素斋",
    "集章攻略"
  ]
}
```

### 7.2 全局搜索

- URL：`GET /api/search`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| keyword | string | 是 | 搜索关键词 |
| type | string | 否 | `all`、`ticket`、`hotel`、`product`、`spot`、`show`、`food`、`article` |
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 3,
    "list": [
      {
        "id": 101,
        "type": "spot",
        "title": "灵山大佛",
        "subtitle": "世界露天青铜释迦牟尼立像",
        "coverUrl": "https://cdn.example.com/search/spot101.jpg",
        "tagText": "景点",
        "target": {
          "type": "map",
          "keyword": "灵山大佛"
        }
      }
    ]
  }
}
```

### 7.3 搜索结果类型说明

| type | 说明 | 跳转建议 |
| --- | --- | --- |
| ticket | 门票 | 门票列表或商品详情 |
| hotel | 酒店 | 酒店列表或商品详情 |
| product | 商品/文创 | 商城或商品详情 |
| spot | 景点 | 地图页 |
| show | 演出 | 地图页或演出详情 |
| food | 餐厅 | 地图页或餐饮预约 |
| article | 攻略/内容 | 发现详情 |

---

## 8. 地图模块专项

### 8.1 当前地图状态

当前地图页文件：

- `src/pages/map/map.vue`

当前已有能力：

- 地图展示。
- 点位 marker。
- 分类：景点、素斋、卫生间、停车场、服务。
- 点击 marker 展示底部详情卡。
- 点击分类切换点位。
- 点击导航调用 `uni.openLocation`。
- 从其它页面进入地图时，已加返回按钮，可以回到来源页面。

当前约束：

- 不要在内容层开发中重构地图 UI。
- 不要删除地图已有分类与点位。
- 不要破坏“卫生间”等分类显示地标的现有能力。
- 地图专项应由后续单独任务完善。

### 8.1.1 8a 基础回归（已完成）

**静态自检（CI/本地可跑）**

```bash
npm run verify:map
```

校验项：冻结分类 `spot/food/toilet/parking/service` 存在、18 类分类、152 个点位 id 不重复、路线 `pointIds` 可解析、地图页接入 `fetchMap*` 与 fallback。

**模拟接口失败（验证不白屏）**

在项目 `.env` 或 `.env.local` 中设置：

```env
VITE_MAP_SIMULATE_API_ERROR=true
```

重新运行小程序后，地图应仍展示 `fallbackMapCategories` / `fallbackMapPoints`，分类栏与 marker 可用。

**手动回归清单**

- [ ] 切换 `toilet`、`parking`、`service` 及新增分类，marker 正常
- [ ] 点击 marker → 底部详情 → 导航（`openLocation`）
- [ ] 带 `category` / `pointId` / `keyword` 进入地图（`pointId` 优先）
- [ ] 从首页/发现/搜索进入地图后 `navigateBack` 返回来源页
- [ ] 线路推荐、15 分钟生活圈、定位、地图内搜索

### 8.1.2 后端联调（第 9 步，已完成）

默认仍使用 `src/api/mapData.ts` mock，不依赖真实坐标精修。

**开启远程地图 API**

在项目 `.env` 或 `.env.local` 中设置（参见仓库根目录 `.env.example`）：

```env
VITE_MAP_USE_REMOTE_API=true
```

行为说明（`src/api/map.ts`）：

- `fetchMapCategories` / `fetchMapPoints` / `fetchMapRoutes`：请求 `GET /api/map/*`，`auth: false`，失败不弹全局 toast。
- 响应为空或 HTTP 失败时，自动回退 `fallbackMapCategories` / `filterPoints(fallbackMapPoints)` / 本地路线。
- `fetchMapPointDetail`：远程失败时回退本地 `detailExtras` + 列表点位，不清空已展示的详情卡。
- `isMapRemoteApiEnabled()`：供调试判断当前是否走远程。

与 `VITE_MAP_SIMULATE_API_ERROR=true` 可同时用于联调前自测：模拟失败应仍展示 fallback。

### 8.1.3 8b 全量回归（静态项已完成）

**静态自检**（`npm run verify:map` 已包含）：

- 18 类分类数据、152 点位、路线 `pointIds` 可解析。
- `map.vue`：`scroll-view` 分类栏、`MAX_MAP_MARKERS=80` 截断与选中点优先保留。
- 首页/发现/搜索中 `type: 'map'` 的 `keyword` 能在 mock 标题中命中。

**手动回归**（数据仍为粗坐标时也可做）：

- [ ] 分类过多时横向滑动，选中项自动滚入视区。
- [ ] `facility` 等大类出现「当前显示 x/y 个点位」提示。
- [ ] 地图内 keyword 筛选、多 marker 滑动流畅。
- [ ] 首页/发现/搜索跳转与 `pointId`/`keyword` 一致。

### 8.2 获取地图点位

- URL：`GET /api/map/points`
- 认证：可选
- 当前状态：默认 mock；设置 `VITE_MAP_USE_REMOTE_API=true` 后走真实接口，失败自动 fallback。
- 契约状态：已冻结，不允许重命名或删除现有请求参数和响应字段。

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 否 | 点位分类 |
| keyword | string | 否 | 搜索关键词 |
| latitude | number | 否 | 当前纬度 |
| longitude | number | 否 | 当前经度 |
| includeClosed | boolean | 否 | 是否包含关闭点位 |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 101,
      "category": "spot",
      "title": "灵山大佛",
      "latitude": 31.421,
      "longitude": 120.108,
      "address": "无锡市滨湖区马山灵山路1号",
      "desc": "世界露天青铜释迦牟尼立像，高88米。",
      "openTime": "08:00-17:00",
      "status": "open",
      "tags": ["地标", "祈福", "拍照"],
      "iconKey": "spot",
      "distanceText": "距入口约1.2公里"
    }
  ]
}
```

### 8.3 获取点位详情

- URL：`GET /api/map/points/:id`
- 认证：可选
- 契约状态：已冻结，详情字段只允许新增可选字段。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 101,
    "category": "spot",
    "title": "灵山大佛",
    "latitude": 31.421,
    "longitude": 120.108,
    "address": "无锡市滨湖区马山灵山路1号",
    "desc": "世界露天青铜释迦牟尼立像，高88米。",
    "images": ["https://cdn.example.com/map/101.jpg"],
    "openTime": "08:00-17:00",
    "suggestedDuration": "45分钟",
    "serviceTags": ["讲解", "拍照", "无障碍"],
    "relatedShowIds": [],
    "relatedProductIds": []
  }
}
```

### 8.4 获取地图分类

- URL：`GET /api/map/categories`
- 认证：可选
- 契约状态：已冻结，必须保留现有 `spot`、`food`、`toilet`、`parking`、`service` 分类语义。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "key": "spot",
      "label": "景点",
      "icon": "spot",
      "color": "#8b6138",
      "sort": 1
    },
    {
      "key": "toilet",
      "label": "卫生间",
      "icon": "toilet",
      "color": "#7b9eb3",
      "sort": 3
    }
  ]
}
```

### 8.5 路线推荐

- URL：`GET /api/map/routes`
- 认证：可选
- 契约状态：已冻结，路线通过 `pointIds` 关联地图点位。

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| scene | string | 否 | `culture`、`family`、`relax`、`food` |
| duration | number | 否 | 可游览时长，单位分钟 |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "历史文化深度游",
      "scene": "culture",
      "durationText": "约3小时",
      "pointIds": [103, 106, 101, 102],
      "desc": "串联祥符禅寺、天下第一掌、灵山大佛、梵宫等文化节点。"
    }
  ]
}
```

### 8.6 地图后续需要修改的具体事项

地图专项后续建议按以下顺序做：

1. 盘点真实点位数据
   - 景点、演出、餐饮、卫生间、停车场、游客服务、医疗点、商店、出入口、充电桩。
   - 补全经纬度、名称、地址、开放时间、图片、标签、状态。

2. 分类体系整理
   - 保留现有分类。
   - 补充分组和排序。
   - 分类图标和颜色从接口返回。

3. 点位接口接入
   - 先保留现有 UI。
   - 将静态点位逐步替换成 `GET /api/map/points`。
   - 接口失败时保留本地兜底点位，避免地图白屏。

4. 点位详情增强
   - 展示开放状态、推荐停留、服务标签、图片、相关演出、相关商品。
   - 点击 marker 后底部卡片展示更完整信息。

5. 搜索与地图联动
   - 搜索结果进入地图时携带 `keyword`、`category` 或 `pointId`。
   - 地图页根据参数高亮或选中点位。
   - 不清空返回栈。

6. 路线推荐
   - 从首页路线、AI 推荐、搜索进入地图路线。
   - 根据路线点位绘制路径。

7. 停车与厕所等实时服务
   - 停车余位、厕所位置、服务中心状态可作为后续增强。

### 8.7 基础回归（8a）验收记录

验收日期：2026-05-30  
验收方式：静态自检脚本 + 代码审查 + H5 构建

| 验收项 | 结果 | 说明 |
| --- | --- | --- |
| 冻结 5 类 + 新增分类可切换 | 通过 | `MAP_CATEGORIES` 18 类，分类栏横向滚动动态渲染 |
| toilet / parking / service 不消失 | 通过 | `mapData.ts` 均含点位 |
| marker 点击、底部详情、导航 | 通过 | `selectPoint` + `fetchMapPointDetail`，`uni.openLocation` |
| 从首页/发现/搜索进入可返回 | 通过 | `goContentTarget` 使用 `navigateTo('/pages/map/map?...')`，`canGoBack` + `navigateBack` |
| category / pointId / keyword 参数 | 通过 | `applyEntryParams` 优先级：pointId > keyword > category > spot |
| 接口失败不白屏 | 通过 | 分类/点位/详情/路线均有 fallback；`ensureMapFallbackState` 兜底 |
| mock 与文档结构一致 | 通过 | `{ code, message, data }` 字段与 2.1.0 冻结一致 |

自动化自检：

```bash
cd traveluniapp
npm run verify:map
npm run build:h5
```

模拟接口失败（验证 fallback）：

在 `.env` 或 `.env.local` 增加：

```env
VITE_MAP_SIMULATE_API_ERROR=true
```

重新运行小程序后，地图应仍显示 `fallbackMapCategories` / `fallbackMapPoints`，并 toast「已使用本地地图数据」。

---

## 9. 数字人 AI 模块

### 9.1 当前 AI 状态

当前页面：

- `src/pages/ai/index.vue`

当前接口：

- `src/api/ai.ts`

当前已有能力：

- 数字人形象展示。
- 快捷提问。
- 输入文字提问。
- H5 浏览器语音识别。
- H5 浏览器语音播报。
- 本地知识库匹配。
- 命中不到本地知识时请求 AI。

当前问题：

- `src/api/ai.ts` 暴露了大模型 API Key，必须移除。
- 前端直连大模型不安全，也不利于日志、限流、审核和知识库增强。
- 小程序端 `window.SpeechRecognition`、`speechSynthesis` 不适用，需要小程序能力或后端服务替代。
- AI 回复没有流式输出、会话 ID、历史上下文、埋点和错误恢复。

### 9.2 获取推荐问题 / FAQ 列表

- URL：`GET /api/ai-service/faqs`
- 认证：可选
- **字段契约**：以 [13.9 帮助中心 FAQ](#139-帮助中心-faq只读) 为准（含 `answer`、`type`、`sort`）；AI 页与服务层帮助中心共用本接口。
- **服务层**：帮助中心仅只读调用本接口；数字人对话见 9.3。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "question": "九龙灌浴几点演出",
      "answer": "每日平日 10:00、11:30、13:30、15:00 场次。",
      "category": "show",
      "type": "normal",
      "sort": 1
    },
    {
      "id": 2,
      "question": "亲子游怎么玩",
      "answer": "建议从祥符禅寺出发，经九龙灌浴至梵宫。",
      "category": "route",
      "type": "normal",
      "sort": 2
    }
  ]
}
```

### 9.3 AI 对话

- URL：`POST /api/ai-service/chat`
- 认证：可选
- 说明：前端只请求本接口，后端再调用大模型服务。

请求示例：

```json
{
  "sessionId": "ai-session-001",
  "message": "推荐一条亲子路线",
  "scene": "guide",
  "context": {
    "currentPage": "home",
    "userLocation": {
      "latitude": 31.421,
      "longitude": 120.108
    }
  }
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sessionId": "ai-session-001",
    "answer": "建议从祥符禅寺出发，先到天下第一掌打卡，再观看九龙灌浴，最后到梵宫休息。",
    "suggestedTargets": [
      {
        "type": "map",
        "keyword": "九龙灌浴"
      }
    ],
    "relatedQuestions": [
      "九龙灌浴下一场几点",
      "附近有什么适合孩子吃的餐厅"
    ]
  }
}
```

### 9.4 AI 流式对话

- URL：`POST /api/ai-service/chat/stream`
- 认证：可选
- 说明：后续如果需要打字机效果，可用 SSE 或 WebSocket。

### 9.5 创建 AI 会话

- URL：`POST /api/ai-service/sessions`
- 认证：可选

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sessionId": "ai-session-001",
    "createdAt": "2026-05-28 19:30:00"
  }
}
```

### 9.6 获取 AI 会话历史

- URL：`GET /api/ai-service/sessions/:sessionId/messages`
- 认证：可选

### 9.7 景点讲解

- URL：`GET /api/ai-service/spot-explain`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pointId | number | 否 | 地图点位 ID |
| keyword | string | 否 | 点位关键词 |
| style | string | 否 | `short`、`child`、`culture` |

### 9.8 AI 路线推荐

- URL：`POST /api/ai-service/route-recommend`
- 认证：可选

请求示例：

```json
{
  "duration": 180,
  "scene": "family",
  "interests": ["亲子", "演出", "美食"],
  "startPointId": 501
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "title": "亲子轻松半日游",
    "durationText": "约3小时",
    "pointIds": [501, 106, 105, 201],
    "reason": "路线步行强度较低，包含祈福打卡、演出和午餐。"
  }
}
```

### 9.9 语音识别与语音合成

后续小程序端建议优先使用平台能力或后端服务：

- `POST /api/ai-service/asr`：上传音频，返回识别文字。
- `POST /api/ai-service/tts`：输入文本，返回音频地址或音频流。

---

## 10. 商城模块

当前商城交易闭环已具备前端 mock。后续真实接口继续沿用 v3 结构。

### 10.1 商城首页

- URL：`GET /api/mall/home`
- 认证：可选

### 10.2 商品列表

- URL：`GET /api/mall/products`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | string | 否 | `ticket`、`hotel`、`annualCard`、`couponPackage`、`food`、`creative` |
| keyword | string | 否 | 搜索关键词 |
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页数量，默认 20 |

**响应 data**（分页，与 [`PaginatedResult<Product>`](src/api/mall.ts) 一致）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| list | Product[] | 当前页商品列表 |
| page | number | 当前页 |
| pageSize | number | 每页条数 |
| total | number | 总条数 |
| hasMore | boolean | 是否有下一页（服务端分页结构附带） |

**Product 单条字段**（公开列表）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 商品 ID |
| type | string | 商品类型，见 [16.2](#162-producttype) |
| title | string | 标题 |
| subtitle | string | 副标题 |
| price | number | 售价（分） |
| originPrice | number | 原价（分） |
| coverUrl | string | 封面图 URL |
| tags | string[] | 展示标签 |
| stock | number | 库存 |

### 10.3 商品详情

- URL：`GET /api/mall/products/:id`
- 认证：可选
- 说明：仅 `status=on_sale` 可访问；否则 `40401`

**响应 data**：`ProductDetail` = `Product` + 下列字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| coverImages | string[] | 详情轮播图 |
| description | string | 图文详情 |
| notice | string | 购买须知 |
| specs | ProductSpec[] | 规格 SKU 列表 |

**ProductSpec**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 规格 ID |
| name | string | 规格名称 |
| price | number | 规格价格（分） |

### 10.4 领券中心

- URL：`GET /api/mall/coupons`
- 认证：可选

### 10.5 领取优惠券

- URL：`POST /api/mall/coupons/:id/collect`
- 认证：需要

---

## 11. 订单模块

### 11.1 创建订单

- URL：`POST /api/orders`
- 认证：需要

### 11.2 获取订单列表

- URL：`GET /api/orders`
- 认证：需要

### 11.3 获取订单详情

- URL：`GET /api/orders/:id`
- 认证：需要

### 11.4 取消订单

- URL：`POST /api/orders/:id/cancel`
- 认证：需要

### 11.5 模拟支付

- URL：`POST /api/orders/:id/mock-pay`
- 认证：需要

后续真实支付接入时新增：

- `POST /api/pay/wechat/prepay`
- `POST /api/pay/wechat/notify`
- `GET /api/pay/orders/:orderNo/status`

---

## 12. 用户服务模块

### 12.1 我的优惠券

- URL：`GET /api/user/coupons`
- 认证：需要

### 12.2 按订单查询可用优惠券

- URL：`GET /api/user/coupons/available`
- 认证：需要

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| amount | number | 是 | 订单金额，单位分 |
| type | string | 是 | 商品类型 |

### 12.3 常用游客信息

- `GET /api/user/travelers`
- `POST /api/user/travelers`
- `PUT /api/user/travelers/:id`
- `DELETE /api/user/travelers/:id`

### 12.0 登录与账号隔离（2026-06）

- `POST /api/auth/login`
  - 普通账号：`username` + `password`
  - 手机号：`username`=11 位手机号，`password`=`phone_auth`（自动注册/绑定 `phone`）
  - 微信（H5 模拟）：`username`/`wechatId` 为设备唯一 `wx_*`，`password`=`wechat_auth`（每设备一用户，不再共用 `wechat_member`）
- `POST /api/auth/register`：独立账号注册，返回 JWT
- 订单 `GET/POST /api/orders*`、优惠券 `GET/POST /api/user/coupons*`、问卷提交等均按 **JWT 内 userId** 隔离

### 12.4 收货地址

- `GET /api/user/addresses`
- `POST /api/user/addresses`
- `PUT /api/user/addresses/:id`
- `DELETE /api/user/addresses/:id`

---

## 13. 点评、反馈、问卷与客服服务

> **契约状态**：已冻结（2026-05-30）。详见 [2.1.3](#213-服务层接口契约冻结结果已冻结)、数据字典 [16.8–16.12](#168-reviewtargettype-点评对象类型)。

### 13.0 模块说明

**前端 API 层（第 1 步已完成）**

- 实现文件：[`src/api/service.ts`](src/api/service.ts)、[`src/api/serviceData.ts`](src/api/serviceData.ts)
- 路径常量：[`src/config/api.ts`](src/config/api.ts) → `API_PATHS.service`
- 环境变量：`VITE_SERVICE_USE_REMOTE_API`、`VITE_SERVICE_SIMULATE_API_ERROR`（见 `.env.example`）
- 自检：`npm run verify:service`

**前端页面（第 2 步已完成）**

- 帮助中心：[`src/pages/service/help.vue`](src/pages/service/help.vue)
- 工单：[`ticketCreate.vue`](src/pages/service/ticketCreate.vue)、[`ticketList.vue`](src/pages/service/ticketList.vue)
- 点评/反馈/问卷：[`reviews.vue`](src/pages/mine/reviews.vue)、[`reviewEdit.vue`](src/pages/mine/reviewEdit.vue)、[`feedback.vue`](src/pages/mine/feedback.vue)、[`surveyList.vue`](src/pages/mine/surveyList.vue)、[`surveyFill.vue`](src/pages/mine/surveyFill.vue)
- 我的页入口：[`mine.vue`](src/pages/mine/mine.vue) → `联系客服` 进帮助中心（非 AI 页）

**入口串联（第 3 步已完成）**

- 首页矩阵「游客服务」：`ContentTarget.type = help` → [`navigation.ts`](src/utils/navigation.ts)
- 商城客服图标 → 帮助中心
- 发现详情「点评」Tab：列表 + 写点评（`discoverPost`）
- 地图详情卡「写点评」（`spot` + `pointId`）
- 订单详情「已完成」：去评价（`order`）+ 联系客服

**后端实现（第 4 步已完成）**

- 目录：[`server/`](server/)（Express + JSON 存储）
- 启动：`cd server && npm install && npm run dev`
- 表结构说明：[`server/docs/SCHEMA.md`](server/docs/SCHEMA.md)
- 冒烟测试：`cd server && npm run verify`
- 联调：`.env.local` 设置 `VITE_API_BASE_URL=http://localhost:3000` 与 `VITE_SERVICE_USE_REMOTE_API=true`

**业务目标**

| 能力 | 用户场景 | 关联模块 |
| --- | --- | --- |
| 点评 | 对景点/订单/商品/发现内容评分留言 | 地图 `pointId`、订单、商城、发现详情 |
| 意见反馈 | 向景区提交建议/投诉/设施问题 | 上传图片、可选关联点位/订单 |
| 问卷 | 满意度调研，完成后展示奖励提示 | 优惠券/积分（发奖逻辑可二期） |
| 帮助中心 FAQ | 常见问题只读展示 | 复用 `GET /api/ai-service/faqs`，**不调 AI 对话** |
| 人工客服 | 景区电话 + 工单留言 | `uni.makePhoneCall`、工单后台处理 |

**前端页面规划（契约级，实现见第 19 章）**

| 页面路径 | 说明 |
| --- | --- |
| `pages/service/help` | 帮助中心：FAQ + 电话 + 工单入口 |
| `pages/service/ticketCreate` | 提交工单 |
| `pages/service/ticketList` | 我的工单 |
| `pages/mine/reviews` | 我的点评 |
| `pages/mine/reviewEdit` | 写点评 |
| `pages/mine/feedback` | 意见反馈 |
| `pages/mine/surveyList` | 问卷列表 |
| `pages/mine/surveyFill` | 填写问卷 |

**入口 query 约定（冻结）**

| 页面 | 参数 | 说明 |
| --- | --- | --- |
| `reviewEdit` | `targetType`, `targetId`, `title?`, `orderId?` | 地图/发现/订单带入对象 |
| `ticketCreate` | `category?`, `relatedOrderId?`, `relatedPointId?` | 从 FAQ「人工」或订单页带入 |
| `feedback` | `relatedPointId?`, `relatedOrderId?` | 可选预填 |

---

### 13.1 提交点评

- URL：`POST /api/reviews`
- 认证：需要
- 当前状态：契约已冻结；前端 API 层已实现 [`src/api/service.ts`](src/api/service.ts) + [`src/api/serviceData.ts`](src/api/serviceData.ts)（mock fallback，页面待第 2 步）。
- 说明：同一用户对同一 `targetType + targetId` 默认仅允许一条有效点评；重复提交返回业务错误码 `40901`（可由后端配置为覆盖更新，须在实现说明中写明）。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| targetType | string | 是 | 见 [16.8 ReviewTargetType](#168-reviewtargettype-点评对象类型) |
| targetId | number | 是 | 地图点位 id / 订单 id / 商品 id / 发现帖 id |
| rating | number | 是 | 1–5 整数 |
| content | string | 是 | 正文，1–500 字 |
| images | string[] | 否 | 图片 URL 列表，最多 9 张；须先走 [14.1 上传图片](#141-上传图片) |
| orderId | number | 否 | 关联订单 id（核销后点评、与 `targetType=order` 配合） |

请求示例：

```json
{
  "targetType": "spot",
  "targetId": 101,
  "rating": 5,
  "content": "讲解很详细，适合亲子游。",
  "images": ["https://cdn.example.com/review/1.jpg"],
  "orderId": null
}
```

**响应 data**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 点评 id |
| createdAt | string | 是 | ISO8601 或 `YYYY-MM-DD HH:mm:ss` |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 90001,
    "createdAt": "2026-05-30 14:20:00"
  }
}
```

---

### 13.2 我的点评

- URL：`GET /api/user/reviews`
- 认证：需要

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页条数，默认 10，最大 50 |
| targetType | string | 否 | 按对象类型筛选 |

**列表项（data.list[]）**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 点评 id |
| targetType | string | 是 | 对象类型 |
| targetId | number | 是 | 对象 id |
| targetTitle | string | 是 | 展示用标题，如「灵山大佛」「灵山大佛成人票」 |
| rating | number | 是 | 1–5 |
| content | string | 是 | 正文 |
| images | string[] | 否 | 图片 URL |
| createdAt | string | 是 | 创建时间 |
| status | string | 是 | 见 [16.9 ReviewStatus](#169-reviewstatus-点评状态) |

**分页（data 外层，与全局分页一致）**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| list | array | 是 | 列表 |
| page | integer | 是 | 当前页 |
| pageSize | integer | 是 | 每页条数 |
| total | integer | 是 | 总条数 |
| hasMore | boolean | 是 | 是否还有下一页 |

---

### 13.3 按对象查询点评（发现详情「点评」Tab）

- URL：`GET /api/reviews`
- 认证：可选（未登录仅可读已发布内容）

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| targetType | string | 是 | 对象类型 |
| targetId | number | 是 | 对象 id |
| page | integer | 否 | 默认 1 |
| pageSize | integer | 否 | 默认 10 |

**列表项**：与 13.2 相同，但可不返回 `status`（仅 `published`）；未登录不返回当前用户是否已评。

**分页**：同 13.2。

---

### 13.4 提交意见反馈

- URL：`POST /api/feedback`
- 认证：需要
- 说明：面向景区运营收集建议/投诉；与 13.7 工单区分——反馈偏「意见」，工单偏「需人工回复的售后/咨询」。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | string | 是 | 见 [16.10 FeedbackType](#1610-feedbacktype-反馈类型) |
| content | string | 是 | 正文，1–1000 字 |
| images | string[] | 否 | 最多 6 张，先上传 |
| contact | string | 否 | 手机号，便于回访 |
| relatedPointId | number | 否 | 关联地图点位 id（如卫生间、景点） |
| relatedOrderId | number | 否 | 关联订单 id |

请求示例：

```json
{
  "type": "suggestion",
  "content": "建议增加夜间导览路线。",
  "images": ["https://cdn.example.com/feedback/1.jpg"],
  "contact": "13800000000",
  "relatedPointId": 301,
  "relatedOrderId": null
}
```

**响应 data**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 反馈 id |
| createdAt | string | 是 | 创建时间 |

---

### 13.5 问卷列表

- URL：`GET /api/questionnaires`
- 认证：可选
- 说明：仅返回状态为「进行中」的问卷；已截止、已填完的不出现在列表（或由后端标记 `submitted: true` 供前端置灰）。

**列表项（data[]，非分页，数量通常 ≤ 5）**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 问卷 id |
| title | string | 是 | 标题 |
| desc | string | 否 | 简短说明 |
| rewardHint | string | 否 | 奖励提示文案，如「完成后可获赠小额优惠券」 |
| deadline | string | 否 | 截止时间 |
| submitted | boolean | 否 | 当前用户是否已提交（未登录恒为 false 或不返回） |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "灵山文旅满意度调研",
      "desc": "约 2 分钟完成",
      "rewardHint": "完成后随机赠送积功德星或小额优惠券",
      "deadline": "2026-12-31 23:59:59",
      "submitted": false
    }
  ]
}
```

---

### 13.6 问卷详情

- URL：`GET /api/questionnaires/:id`
- 认证：可选

**响应 data**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 问卷 id |
| title | string | 是 | 标题 |
| desc | string | 否 | 说明 |
| questions | array | 是 | 题目列表 |

**questions[] 题目项**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 题目 id |
| type | string | 是 | 见 [16.11 QuestionType](#1611-questiontype-问卷题型) |
| title | string | 是 | 题干 |
| required | boolean | 否 | 是否必答，默认 true |
| options | array | 否 | 选择题选项，`type` 为 `single`/`multi` 时必填 |

**options[]**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 选项 id，如 `a`、`b` |
| label | string | 是 | 展示文案 |

---

### 13.7 提交问卷

- URL：`POST /api/questionnaires/:id/submit`
- 认证：需要
- 说明：同一用户同一问卷仅可提交一次；重复提交返回 `40902`。

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 问卷 id |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| answers | array | 是 | 答案列表 |

**answers[]**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| questionId | number | 是 | 题目 id |
| value | string \| string[] \| number | 是 | `single` 为选项 id 字符串；`multi` 为选项 id 数组；`text` 为字符串；`score` 为 1–5 数字 |

请求示例：

```json
{
  "answers": [
    { "questionId": 1, "value": "5" },
    { "questionId": 2, "value": ["a", "c"] },
    { "questionId": 3, "value": "希望增加夜场导览" }
  ]
}
```

**响应 data**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| submissionId | number | 是 | 提交记录 id |
| rewardHint | string | 否 | 提交成功后的奖励说明（可与发券结果联动） |
| createdAt | string | 是 | 提交时间 |

---

### 13.8 客服工单（人工客服）

#### 13.8.1 提交工单

- URL：`POST /api/support/tickets`
- 认证：需要
- 说明：用户从帮助中心「转人工」、订单售后等入口提交；后台人工处理并更新状态（管理端见 15.9）。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 是 | 见 [16.12 SupportTicketCategory](#1612-supportticketcategory-工单分类) |
| content | string | 是 | 问题描述，1–1000 字 |
| contact | string | 是 | 联系电话 |
| images | string[] | 否 | 最多 6 张 |
| relatedOrderId | number | 否 | 关联订单 |
| relatedPointId | number | 否 | 关联地图点位 |

请求示例：

```json
{
  "category": "ticket_refund",
  "content": "订单未核销，申请退款咨询",
  "contact": "13800000000",
  "images": [],
  "relatedOrderId": 10001,
  "relatedPointId": null
}
```

**响应 data**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 工单 id |
| ticketNo | string | 是 | 工单编号，展示用 |
| status | string | 是 | 初始为 `open` |
| createdAt | string | 是 | 创建时间 |

#### 13.8.2 我的工单

- URL：`GET /api/user/support/tickets`
- 认证：需要

**查询参数**：`page`、`pageSize`（同 13.2）

**列表项**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 工单 id |
| ticketNo | string | 是 | 工单编号 |
| category | string | 是 | 分类 |
| content | string | 是 | 问题摘要（可截断） |
| status | string | 是 | `open` / `processing` / `closed` |
| adminReply | string | 否 | 客服回复摘要 |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 否 | 最后更新时间 |

**分页**：同 13.2。

---

### 13.9 帮助中心 FAQ（只读）

- URL：`GET /api/ai-service/faqs`
- 认证：可选
- **服务层约束**：帮助中心、我的-联系客服**仅允许**调用本接口；**禁止**在服务层页面调用 `POST /api/ai-service/chat`（数字人专项见第 9 章）。
- 与第 9.2 关系：字段以本章为准；第 9.2 为 AI 页快捷问题场景，共用同一数据源。

**响应 data[] 条目**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | FAQ id |
| question | string | 是 | 问题文案 |
| answer | string | 否 | 答案；`type=human` 时可空，前端展示「提交工单」 |
| category | string | 否 | 分组：`ticket` / `show` / `route` / `parking` / `food` / `other` |
| type | string | 否 | `normal`（默认，展示问答）或 `human`（转人工入口） |
| sort | number | 否 | 排序，越小越靠前 |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "question": "儿童和老年人门票价格",
      "answer": "6-18周岁及60-69周岁半价（105元），6岁或1.4米以下及70岁以上免票。",
      "category": "ticket",
      "type": "normal",
      "sort": 1
    },
    {
      "id": 2,
      "question": "人工客服",
      "category": "other",
      "type": "human",
      "sort": 99
    }
  ]
}
```

**前端行为约定**

- `type=normal` 且有 `answer`：展开显示答案。
- `type=human`：跳转 `pages/service/ticketCreate`，不发起 AI 对话。
- 页面顶部固定展示景区电话（见 13.10）。

---

### 13.10 帮助中心静态配置

- URL：`GET /api/service/config`
- 认证：可选
- 说明：可与 `faqs` 合并为单一接口；若拆分，本接口仅返回运营配置。前端 mock 阶段可写死在 `serviceData.ts`。

**响应 data**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| servicePhone | string | 是 | 景区客服电话，用于 `uni.makePhoneCall` |
| serviceHours | string | 是 | 工作时间文案，如「每日 08:30–17:00」 |
| servicePhoneRemark | string | 否 | 补充说明 |

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "servicePhone": "0510-85933333",
    "serviceHours": "每日 08:30–17:00（节假日以景区公告为准）",
    "servicePhoneRemark": "票务、退款、投诉均可致电"
  }
}
```

---

### 13.11 服务层业务错误码（建议）

| code | 说明 | 典型场景 |
| --- | --- | --- |
| 40001 | 参数校验失败 | 缺少 targetType、rating 超范围 |
| 40101 | 未登录 | 提交类接口无 token |
| 40301 | 无权限 | 非本人订单关联 |
| 40401 | 对象不存在 | targetId 无效 |
| 40901 | 重复点评 | 同一对象已评 |
| 40902 | 重复提交问卷 | 同一问卷已填 |
| 42901 | 提交过于频繁 | 反馈/工单限流 |

HTTP 状态码与 `code` 可同时返回；前端以 `code` 为准展示 toast。

---

### 13.12 管理员端关联（规划，非用户端实现）

用户端提交的数据由管理端处理，接口规划见 **15.9 反馈处理与数据统计**，建议扩展：

- `GET /api/admin/feedback`、`PUT /api/admin/feedback/:id/status`
- `GET /api/admin/support/tickets`、`PUT /api/admin/support/tickets/:id`（回复、改状态）
- `GET /api/admin/reviews`、`PUT /api/admin/reviews/:id/status`（审核）
- 问卷题目 CRUD：`/api/admin/questionnaires`（二期）

---

## 14. 上传模块

### 14.1 上传图片

- URL：`POST /api/upload/image`
- 认证：需要
- Content-Type：`multipart/form-data`
- 表单字段名：`file`
- **服务层用法**：点评、意见反馈、客服工单的 `images` 均须先调用本接口取得 `url` 再提交（见第 13 章）。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "https://cdn.example.com/upload/1.jpg"
  }
}
```

### 14.2 上传音频

- URL：`POST /api/upload/audio`
- 认证：需要
- 用于后续 AI 语音识别、反馈音频等。

---

## 15. 管理员端接口规划

管理员端建议在用户端数据结构稳定后开发。

### 15.0 管理端首期冻结范围（MVP + 内容，2026-05-30）

**首期纳入（2026-05-30）**：管理员登录、服务层运营（反馈/工单/点评/FAQ/问卷/客服配置/统计概览）、首页配置、发现内容管理、C 端公开只读 `home` / `discover`。

**M2 已纳入（2026-06）**：[15.4 地图点位管理](#154-地图点位管理)、[15.5 地图分类管理](#155-地图分类管理) 字段表与 store 结构；公开 `GET /api/map/*` 已读 `store.mapCategories` / `store.mapPoints` / `store.mapRoutes`（Gate，M2-MAP-00）。管理端 CRUD 路由契约见下文，实现见 M2-MAP-02/03。

**M2 已纳入（2026-06）**：[15.8 商城商品与订单管理](#158-商城商品与订单管理) 字段表已冻结；公开 `GET /api/mall/products`、`GET /api/mall/products/:id` 已读 `store.products`（Gate，M2-MALL-00）。管理端商品/订单 CRUD 契约见 15.8，实现见 M2-MALL-02/03。

**待二期**：15.6–15.7 AI 知识库与会话；15.8 核销扫码等运营细化见 M2-MALL-03 之后。

**鉴权**：除 `POST /api/admin/auth/login` 外，所有 `/api/admin/*` 需 Header `Authorization: Bearer <adminToken>`。本地调试可设 `ADMIN_AUTH_DISABLED=true`（**生产环境禁止**，`NODE_ENV=production` 时无效且禁止启动）。生产改密见 `server/docs/ADMIN_PRODUCTION.md`。

**公开 API（无鉴权，与 store 同源）**：

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/home/config` | GET | 返回 `HomeConfig`：`heroSlides`、`matrixItems`、`actionCards`、`collectionSections`、`feedItems` |
| `/api/discover/posts` | GET | 仅 `status=published`；query：`category`、`page`、`pageSize` |
| `/api/discover/posts/:id` | GET | 详情，字段对齐 `DiscoverPostDetail` |
| `/api/map/categories` | GET | 分类列表，字段对齐 [`MapCategory`](src/api/map.ts) |
| `/api/map/points` | GET | 点位列表，query 见 [8.2](#82-获取地图点位)；字段对齐 [`MapPoint`](src/api/map.ts) |
| `/api/map/points/:id` | GET | 点位详情，基础 + 增强字段对齐 [`MapPointDetail`](src/api/map.ts) |
| `/api/map/routes` | GET | 路线列表，字段对齐 [`MapRoute`](src/api/map.ts) |
| `/api/mall/products` | GET | 商品列表，仅 `status=on_sale`；query 见 [10.2](#102-商品列表)；字段对齐 [`Product`](src/api/mall.ts) |
| `/api/mall/products/:id` | GET | 商品详情，字段对齐 [`ProductDetail`](src/api/mall.ts) |

**15.4–15.5 地图管理（M2 字段表已冻结）**

- store：`mapCategories`、`mapPoints`、`mapPointDetails`（key 为点位 `id`）、`mapRoutes`；种子与 C 端 `mapData.ts` / `map.ts` fallback 同源。
- C 端类型权威定义：[`src/api/map.ts`](src/api/map.ts) 中 `MapCategory`、`MapPoint`、`MapPointDetail`、`MapPointStatus`。
- 变更规则：与 [2.1.0](#210-地图接口契约冻结) 一致，不得删除冻结分类（尤其 `spot`、`food`、`toilet`、`parking`、`service`）及现有点位 `id` 语义；仅允许新增可选字段。

**15.8 商城管理（M2 字段表已冻结）**

- store：`products`（商品全量记录，含详情字段与 `status`）、`orders`（用户订单，与 C 端 [`OrderItem`](src/api/mine.ts) / [`OrderDetail`](src/api/mine.ts) 同源）。
- C 端类型权威定义：[`src/api/mall.ts`](src/api/mall.ts) 中 `Product`、`ProductDetail`、`ProductSpec`、`ProductType`；[`src/api/mine.ts`](src/api/mine.ts) 中 `OrderItem`、`OrderDetail`。
- 公开 API：仅返回 `status=on_sale` 商品；管理端可见全部状态。
- 变更规则：不得删除已上架商品 `id` 语义（如 `1001` 成人票）；`type` 取值见 [16.2 ProductType](#162-producttype)。

**15.1 管理员登录（冻结）**

- `POST /api/admin/auth/login`
- 请求：`{ username, password }`
- 成功 `data`：`{ token, admin: { id, name, role } }`
- 种子账号：`admin` / `DevOnly!2026`（仅开发；生产用 `npm run admin:set-password` 改密）

**15.2 首页配置管理（冻结）**

- `GET /api/admin/home/config`、`PUT /api/admin/home/config`
- body/响应结构与 C 端 [`HomeConfig`](src/api/home.ts) 一致

**15.3 发现内容管理（冻结）**

- `GET /api/admin/discover/posts`（query：`category`、`status`）
- `POST /api/admin/discover/posts`
- `PUT /api/admin/discover/posts/:id`
- `DELETE /api/admin/discover/posts/:id`
- `PUT /api/admin/discover/posts/:id/status`（`published` / `draft`）
- 列表字段对齐 `DiscoverPost`；详情扩展字段对齐 `DiscoverPostDetail`；`target` 遵循 `ContentTarget`

**15.9 服务层运营（冻结，补齐）**

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/admin/feedback` | GET | 意见反馈列表 |
| `/api/admin/feedback/:id/status` | PUT | 改 `status` |
| `/api/admin/support/tickets` | GET | 工单列表 |
| `/api/admin/support/tickets/:id` | PUT | `status`、`adminReply` |
| `/api/admin/reviews` | GET | 点评列表 |
| `/api/admin/reviews/:id/status` | PUT | `pending` / `published` / `rejected` |
| `/api/admin/ai-service/faqs` | GET/POST/PUT/DELETE | 与 `store.faqs`、用户端 `GET /api/ai-service/faqs` 同源 |
| `/api/admin/questionnaires` | GET/POST/PUT | 问卷 CRUD，题目内嵌；GET 列表含 `submissionCount` |
| `/api/admin/questionnaires/:id/submissions` | GET | 某问卷的用户答卷列表（含题目文案与 `displayValue`） |
| `/api/admin/service/config` | GET/PUT | `servicePhone`、`serviceHours` 等 |
| `/api/admin/statistics/overview` | GET | 各表 count 概览 |

变更规则：与 2.1.0 一致，仅允许新增可选字段。

### 15.1 管理员登录

- URL：`POST /api/admin/auth/login`

### 15.2 首页配置管理

- `GET /api/admin/home/config`
- `PUT /api/admin/home/config`

管理内容：

- 首页轮播。
- 功能矩阵。
- 快捷卡片。
- 集合栏。
- 猜你喜欢。
- 天气与演出运营文案。

### 15.3 发现内容管理

- `GET /api/admin/discover/posts`
- `POST /api/admin/discover/posts`
- `PUT /api/admin/discover/posts/:id`
- `DELETE /api/admin/discover/posts/:id`
- `PUT /api/admin/discover/posts/:id/status`

管理内容：

- 活动。
- 攻略。
- 演出内容。
- 美食推荐。
- 文创内容。
- 封面图、详情图、关联目标。

### 15.4 地图点位管理

- **契约状态**：M2 已纳入（字段表冻结）；**实现状态**：管理 CRUD 待 M2-MAP-02；公开只读 `GET /api/map/*` 已实现（M2-MAP-00）。
- **鉴权**：需 `Authorization: Bearer <adminToken>`。
- **数据对齐**：列表/写入字段与 C 端 [`MapPoint`](src/api/map.ts)、[`MapPointDetail`](src/api/map.ts) 一一对应；`distanceText` 为公开 API 按用户坐标动态计算，**不入 store**。

**store 结构**

| store 键 | 类型 | 说明 |
| --- | --- | --- |
| mapPoints | `MapPoint[]` | 点位基础字段（不含 `distanceText`） |
| mapPointDetails | `Record<number, MapPointDetailExtras>` | 以点位 `id` 为 key 的详情增强字段 |
| mapRoutes | `MapRoute[]` | 路线（`pointIds` 引用 `mapPoints[].id`） |

**MapPoint 字段（与 TypeScript 一致）**

| 字段 | 类型 | 必填 | 读写 | 说明 |
| --- | --- | --- | --- | --- |
| id | number | 是 | 只读 | 点位唯一 ID；与 C 端 marker `id`、路线 `pointIds` 一致；新建时由 `counters.mapPoint` 递增 |
| category | string | 是 | 读写 | 分类 key，须存在于 `mapCategories[].key` |
| title | string | 是 | 读写 | 点位名称 |
| latitude | number | 是 | 读写 | 纬度（WGS84） |
| longitude | number | 是 | 读写 | 经度（WGS84） |
| address | string | 是 | 读写 | 地址或景区内位置文案 |
| desc | string | 是 | 读写 | 简介 |
| openTime | string | 否 | 读写 | 开放或营业时间，如 `08:00-17:00` |
| status | string | 否 | 读写 | 点位状态，见下表 `MapPointStatus`；默认 `open` |
| tags | string[] | 否 | 读写 | 展示标签 |
| iconKey | string | 否 | 读写 | marker 图标标识；默认与 `category` 相同 |
| distanceText | string | 否 | 只读 | 仅公开 `GET /api/map/points` 在传入 `latitude`/`longitude` 时计算返回；管理端不存储 |

**MapPointStatus（与 `MapPointStatus` 类型一致）**

| 值 | 说明 | C 端行为 |
| --- | --- | --- |
| open | 正常开放 | 默认展示；`includeClosed=false` 时包含 |
| closed | 关闭/隐藏 | `includeClosed=false` 时公开 API 过滤 |
| busy | 拥挤/限流 | 展示但可提示繁忙（前端可选样式） |

**MapPointDetail 增强字段（写入 `mapPointDetails[id]`，公开详情 API 合并返回）**

| 字段 | 类型 | 必填 | 读写 | 说明 |
| --- | --- | --- | --- | --- |
| images | string[] | 否 | 读写 | 点位图片 URL 列表 |
| suggestedDuration | string | 否 | 读写 | 推荐停留时长，如 `45分钟` |
| serviceTags | string[] | 否 | 读写 | 服务标签，如 `讲解`、`无障碍` |
| relatedShowIds | number[] | 否 | 读写 | 关联演出 ID（发现/演出内容） |
| relatedProductIds | number[] | 否 | 读写 | 关联商品 ID（商城 SKU，二期对接） |

**接口列表**

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/admin/map/points` | GET | 管理端点位列表（含 `status=closed`） |
| `/api/admin/map/points` | POST | 新建点位 |
| `/api/admin/map/points/:id` | GET | 单条详情（基础 + `mapPointDetails` 合并） |
| `/api/admin/map/points/:id` | PUT | 全量更新基础字段及详情增强字段 |
| `/api/admin/map/points/:id` | DELETE | 删除点位（同时移除 `mapPointDetails[id]`；路线中 `pointIds` 引用需在实现时校验） |
| `/api/admin/map/points/:id/status` | PUT | 仅更新 `status` |

#### 15.4.1 获取点位列表

- URL：`GET /api/admin/map/points`
- 认证：需要

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 否 | 按分类 key 筛选 |
| keyword | string | 否 | 在 `title`、`desc`、`address`、`tags` 中子串匹配 |
| status | string | 否 | `open` / `closed` / `busy` |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 20，最大 50 |

**响应 data**（分页，与项目通用分页结构一致）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| list | MapPoint[] | 不含 `distanceText` |
| page | number | 当前页 |
| pageSize | number | 每页条数 |
| total | number | 总条数 |
| hasMore | boolean | 是否有下一页 |

#### 15.4.2 新建点位

- URL：`POST /api/admin/map/points`
- 认证：需要

**请求体**（`MapPoint` 可写字段 + 可选 `MapPointDetail` 增强字段；不可传 `id`、`distanceText`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 是 | 分类 key |
| title | string | 是 | 点位名称 |
| latitude | number | 是 | 纬度 |
| longitude | number | 是 | 经度 |
| address | string | 是 | 地址 |
| desc | string | 是 | 简介 |
| openTime | string | 否 | 营业时间 |
| status | string | 否 | 默认 `open` |
| tags | string[] | 否 | 标签 |
| iconKey | string | 否 | 默认 `category` |
| images | string[] | 否 | 存入 `mapPointDetails` |
| suggestedDuration | string | 否 | 存入 `mapPointDetails` |
| serviceTags | string[] | 否 | 存入 `mapPointDetails` |
| relatedShowIds | number[] | 否 | 存入 `mapPointDetails` |
| relatedProductIds | number[] | 否 | 存入 `mapPointDetails` |

**响应 data**：完整 `MapPointDetail`（新建后的 `id` + 基础字段 + 增强字段）。

请求示例：

```json
{
  "category": "spot",
  "title": "灵山大佛",
  "latitude": 31.421,
  "longitude": 120.108,
  "address": "无锡市滨湖区马山灵山路1号",
  "desc": "世界露天青铜释迦牟尼立像。",
  "openTime": "08:00-17:00",
  "status": "open",
  "tags": ["地标", "祈福"],
  "iconKey": "spot",
  "images": ["https://cdn.example.com/map/101.jpg"],
  "suggestedDuration": "45分钟",
  "serviceTags": ["讲解", "拍照", "无障碍"],
  "relatedShowIds": [],
  "relatedProductIds": [1001, 1002]
}
```

#### 15.4.3 获取 / 更新点位

- URL：`GET /api/admin/map/points/:id`、`PUT /api/admin/map/points/:id`
- 认证：需要
- `GET` 响应 data：`MapPointDetail`（`mapPoints` 与 `mapPointDetails[id]` 合并）
- `PUT` 请求体：同 [15.4.2](#1542-新建点位) 可写字段；`id` 不可改

#### 15.4.4 更新点位状态

- URL：`PUT /api/admin/map/points/:id/status`
- 认证：需要

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | string | 是 | `open` \| `closed` \| `busy` |

**响应 data**：更新后的 `MapPoint`（仅基础字段）。

#### 15.4.5 删除点位

- URL：`DELETE /api/admin/map/points/:id`
- 认证：需要
- 成功：`code: 200`；同时删除 `mapPointDetails` 中对应项。

**建议错误码**

| code | 说明 |
| --- | --- |
| 40001 | 参数校验失败（缺 title、经纬度非法、status 枚举错误） |
| 40401 | 点位或分类不存在 |
| 40901 | 删除失败：仍被 `mapRoutes.pointIds` 引用 |

---

### 15.5 地图分类管理

- **契约状态**：M2 已纳入（字段表冻结）；**实现状态**：管理 CRUD 已实现（M2-MAP-03）。
- **鉴权**：需 `Authorization: Bearer <adminToken>`。
- **数据对齐**：与 C 端 [`MapCategory`](src/api/map.ts) 一一对应；公开 `GET /api/map/categories` 与管理端读同一 `store.mapCategories`。

**MapCategory 字段（与 TypeScript 一致）**

| 字段 | 类型 | 必填 | 读写 | 说明 |
| --- | --- | --- | --- | --- |
| key | string | 是 | 创建后不可改 | 分类唯一标识，如 `spot`、`toilet`；路由 `:key` 参数 |
| label | string | 是 | 读写 | 展示名称，如 `景点` |
| icon | string | 是 | 读写 | 图标标识（与 C 端分类栏、`iconKey` 映射） |
| color | string | 是 | 读写 | 主题色，十六进制如 `#8b6138` |
| sort | number | 是 | 读写 | 排序权重，越小越靠前 |

**冻结分类（不得 DELETE，不得改 `key`）**

| key | label | 说明 |
| --- | --- | --- |
| spot | 景点 | 核心景点 marker |
| food | 餐饮 | 含素斋/餐饮点位 |
| toilet | 卫生间 | 生活圈必备 |
| parking | 停车场 | 生活圈必备 |
| service | 游客服务 | 咨询/服务中心 |

当前种子另含 `entrance`、`drinking`、`nursery`、`ticket`、`facility`、`guide`、`shop`、`hotel`、`shuttle`、`medical`、`rest`、`smoking`、`plant` 等扩展分类，与 [`mapData.ts`](src/api/mapData.ts) `MAP_CATEGORIES` 一致。

**接口列表**

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/admin/map/categories` | GET | 全部分类，按 `sort` 升序 |
| `/api/admin/map/categories` | POST | 新增分类 |
| `/api/admin/map/categories/:key` | PUT | 更新 `label`、`icon`、`color`、`sort` |
| `/api/admin/map/categories/:key` | DELETE | 删除分类（冻结 key 禁止；存在关联点位时拒绝） |

#### 15.5.1 获取分类列表

- URL：`GET /api/admin/map/categories`
- 认证：需要

**响应 data**：`MapCategory[]`（按 `sort` 升序）。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "key": "spot",
      "label": "景点",
      "icon": "spot",
      "color": "#8b6138",
      "sort": 1
    },
    {
      "key": "toilet",
      "label": "卫生间",
      "icon": "toilet",
      "color": "#7b9eb3",
      "sort": 2
    }
  ]
}
```

#### 15.5.2 新建分类

- URL：`POST /api/admin/map/categories`
- 认证：需要

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| key | string | 是 | 唯一 key，小写英文，创建后不可修改 |
| label | string | 是 | 展示名 |
| icon | string | 是 | 图标标识 |
| color | string | 是 | 色值 |
| sort | number | 是 | 排序 |

**响应 data**：`MapCategory`。

#### 15.5.3 更新 / 删除分类

- URL：`PUT /api/admin/map/categories/:key`、`DELETE /api/admin/map/categories/:key`
- 认证：需要
- `PUT` 请求体：`label`、`icon`、`color`、`sort`（不可改 `key`）
- `DELETE`：冻结 key 返回 `40301`；若 `mapPoints` 中仍有 `category=:key` 的点位，返回 `40901`

**建议错误码**

| code | 说明 |
| --- | --- |
| 40001 | 参数校验失败 |
| 40301 | 禁止删除冻结分类 |
| 40401 | 分类不存在 |
| 40901 | 分类仍有关联点位 |

---

### 15.6 AI 知识库管理

- `GET /api/admin/ai/knowledge`
- `POST /api/admin/ai/knowledge`
- `PUT /api/admin/ai/knowledge/:id`
- `DELETE /api/admin/ai/knowledge/:id`

管理内容：

- 景点介绍。
- 演出时间。
- 门票政策。
- 交通停车。
- 餐饮服务。
- 亲子路线。
- FAQ。

### 15.7 AI 会话与日志

- `GET /api/admin/ai/sessions`
- `GET /api/admin/ai/sessions/:id/messages`
- `GET /api/admin/ai/metrics`

### 15.8 商城商品与订单管理

- **契约状态**：M2 已纳入（字段表冻结）；**实现状态**：公开 `GET /api/mall/products`、`GET /api/mall/products/:id` 已实现（M2-MALL-00）；管理端商品 CRUD 待 M2-MALL-02；管理端订单列表/改状态待 M2-MALL-03。
- **鉴权**：`/api/admin/mall/*`、`/api/admin/orders/*` 需 `Authorization: Bearer <adminToken>`。
- **数据对齐**：商品字段与 C 端 [`Product`](src/api/mall.ts)、[`ProductDetail`](src/api/mall.ts) 一致；订单与 [`OrderItem`](src/api/mine.ts)、[`OrderDetail`](src/api/mine.ts) 及现有 [`orders.js`](server/src/routes/orders.js) store 结构一致。
- **待二期**：优惠券包管理、酒店房型拆分、核销扫码（M2-MALL-03 之后）。

**store 结构**

| store 键 | 类型 | 说明 |
| --- | --- | --- |
| products | `StoreProduct[]` | 商品全量记录（列表字段 + 详情字段 + `status`） |
| orders | `StoreOrder[]` | 用户订单；`userId` 关联 `users[].id` |

**StoreProduct 字段（`store.products[]`，与 TypeScript 一致）**

| 字段 | 类型 | 必填 | 读写 | 说明 |
| --- | --- | --- | --- | --- |
| id | number | 是 | 只读 | 商品唯一 ID；新建由 `counters.product` 递增（实现时） |
| type | string | 是 | 读写 | 商品类型，见 [16.2 ProductType](#162-producttype) |
| title | string | 是 | 读写 | 标题 |
| subtitle | string | 是 | 读写 | 副标题 |
| price | number | 是 | 读写 | 售价（分） |
| originPrice | number | 是 | 读写 | 原价（分） |
| coverUrl | string | 是 | 读写 | 列表封面图 URL |
| tags | string[] | 否 | 读写 | 展示标签 |
| stock | number | 是 | 读写 | 库存；`0` 表示售罄 |
| status | string | 是 | 读写 | 上架状态，见下表 `ProductStatus`；默认 `on_sale` |
| coverImages | string[] | 否 | 读写 | 详情轮播图；公开详情 API 返回 |
| description | string | 否 | 读写 | 图文详情 |
| notice | string | 否 | 读写 | 购买须知 |
| specs | ProductSpec[] | 否 | 读写 | 规格列表，元素字段见下表 |

**ProductSpec（`specs[]` 元素，与 [10.3](#103-商品详情) 一致）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 规格 ID |
| name | string | 规格名称 |
| price | number | 规格价格（分） |

**ProductStatus（管理端写入，公开 API 过滤）**

| 值 | 说明 | C 端行为 |
| --- | --- | --- |
| on_sale | 上架 | `GET /api/mall/products` 可见 |
| off_sale | 下架 | 公开 API 不返回；详情 `40401` |

**商品管理接口列表（契约，M2-MALL-02 实现）**

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/admin/mall/products` | GET | 管理端商品列表（含下架） |
| `/api/admin/mall/products` | POST | 新建商品 |
| `/api/admin/mall/products/:id` | GET | 单条详情（`ProductDetail` + `status`） |
| `/api/admin/mall/products/:id` | PUT | 全量更新 |
| `/api/admin/mall/products/:id` | DELETE | 删除商品 |
| `/api/admin/mall/products/:id/status` | PUT | 仅更新 `status`（`on_sale` / `off_sale`） |

#### 15.8.1 管理端获取商品列表

- URL：`GET /api/admin/mall/products`
- 认证：需要

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | string | 否 | 按 [16.2](#162-producttype) 筛选 |
| keyword | string | 否 | 在 `title`、`subtitle`、`tags` 中子串匹配 |
| status | string | 否 | `on_sale` / `off_sale` |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 20，最大 50 |

**响应 data**：分页结构，`list` 为 `StoreProduct`（含 `status`）。

#### 15.8.2 管理端新建商品

- URL：`POST /api/admin/mall/products`
- 认证：需要

**请求体**（不可传 `id`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | string | 是 | 商品类型 |
| title | string | 是 | 标题 |
| subtitle | string | 是 | 副标题 |
| price | number | 是 | 售价（分） |
| originPrice | number | 是 | 原价（分） |
| coverUrl | string | 是 | 封面图 |
| stock | number | 是 | 库存 |
| status | string | 否 | 默认 `on_sale` |
| tags | string[] | 否 | 标签 |
| coverImages | string[] | 否 | 详情图 |
| description | string | 否 | 详情文案 |
| notice | string | 否 | 须知 |
| specs | ProductSpec[] | 否 | 规格 |

**响应 data**：新建后的完整 `StoreProduct`（含分配的 `id`）。

#### 15.8.3 管理端更新 / 删除商品

- `GET /api/admin/mall/products/:id`：返回 `StoreProduct`
- `PUT /api/admin/mall/products/:id`：请求体同 [15.8.2](#1582-管理端新建商品)；`id` 不可改
- `DELETE /api/admin/mall/products/:id`：删除记录
- `PUT /api/admin/mall/products/:id/status`：请求体 `{ "status": "on_sale" | "off_sale" }`

---

**StoreOrder 字段（`store.orders[]`，与 C 端订单一致）**

| 字段 | 类型 | 必填 | 读写 | 说明 |
| --- | --- | --- | --- | --- |
| id | number | 是 | 只读 | 订单 ID |
| userId | number | 是 | 只读 | 下单用户 ID |
| orderNo | string | 是 | 只读 | 订单号，如 `LS202605140001` |
| status | string | 是 | 读写 | 订单状态，见 [16.6 OrderStatus](#166-orderstatus) |
| title | string | 是 | 只读 | 订单展示标题（首商品） |
| coverUrl | string | 否 | 只读 | 封面图 |
| payAmount | number | 是 | 只读 | 实付金额（分） |
| quantity | number | 是 | 只读 | 商品总件数 |
| createdAt | string | 是 | 只读 | 创建时间 `YYYY-MM-DD HH:mm:ss` |
| couponDiscount | number | 否 | 只读 | 优惠券抵扣（分） |
| couponTitle | string | 否 | 只读 | 所用优惠券标题 |
| productType | string | 否 | 只读 | 主商品类型，见 [16.2](#162-producttype) |
| items | OrderLineItem[] | 是 | 只读 | 订单行明细 |
| qrCodeUrl | string | 否 | 读写 | 核销二维码 URL（二期） |
| payAt | string | 否 | 只读 | 支付时间 |
| remark | string | 否 | 读写 | 备注 |

**OrderLineItem（`items[]` 元素）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| title | string | 商品标题 |
| skuName | string | 规格名称 |
| quantity | number | 数量 |
| price | number | 单价（分） |

**C 端列表项 `OrderItem`**：为上表除去 `userId`、`items`、`qrCodeUrl`、`payAt`、`remark`，并附加只读 `statusText`（中文状态文案）。

**订单管理接口列表（契约，M2-MALL-03 实现）**

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/admin/orders` | GET | 管理端订单列表（跨用户） |
| `/api/admin/orders/:id` | GET | 订单详情（含 `userId`、行明细） |
| `/api/admin/orders/:id/status` | PUT | 更新订单状态（如取消） |

#### 15.8.4 管理端获取订单列表

- URL：`GET /api/admin/orders`
- 认证：需要

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | string | 否 | 见 [16.6 OrderStatus](#166-orderstatus)；`all` 或不传表示全部 |
| userId | number | 否 | 按用户 ID 筛选 |
| keyword | string | 否 | 在 `orderNo`、`title` 中子串匹配 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 20，最大 50 |

**响应 data**：分页结构，`list` 元素为 `StoreOrder` 列表视图（含 `userId`、`statusText`；不含完整 `items` 时可仅摘要，详情走 `GET :id`）。

#### 15.8.5 管理端更新订单状态

- URL：`PUT /api/admin/orders/:id/status`
- 认证：需要

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | string | 是 | 目标状态：`pendingPay`、`pendingUse`、`completed`、`cancelled`、`refunded` |

**响应 data**：更新后的 `StoreOrder`（或 `OrderDetail` 形状）。

**状态流转建议（实现时校验）**

| 当前 | 允许变更为 |
| --- | --- |
| pendingPay | cancelled、pendingUse（支付后） |
| pendingUse | completed、cancelled、refunded |
| completed | refunded（特例） |
| cancelled | — |
| refunded | — |

### 15.9 反馈处理与数据统计

- `GET /api/admin/feedback`
- `PUT /api/admin/feedback/:id/status`
- `GET /api/admin/support/tickets`（建议，对应 [13.8](#138-客服工单人工客服)）
- `PUT /api/admin/support/tickets/:id`（回复、改状态）
- `GET /api/admin/reviews`、`PUT /api/admin/reviews/:id/status`（点评审核，建议）
- `GET /api/admin/statistics/overview`
- `GET /api/admin/statistics/content`
- `GET /api/admin/statistics/orders`
- `GET /api/admin/statistics/ai`

---

## 16. 数据字典

### 16.1 ContentTarget

| type | 字段 | 说明 |
| --- | --- | --- |
| ticket | 无 | 跳转门票页 |
| hotel | 无 | 跳转酒店页 |
| annualCard | 无 | 跳转年卡页 |
| mall | 无 | 跳转商城首页 |
| discoverPost | id | 跳转发现详情 |
| search | keyword | 跳转搜索页 |
| map | category、pointId、keyword | 跳转现有地图页 |
| help | 无 | 跳转帮助中心 `pages/service/help`（服务层，见第 13 章） |
| toast | message | 显示提示 |

地图目标必须使用 `uni.navigateTo`，避免清空返回栈。

### 16.2 ProductType

| 值 | 说明 |
| --- | --- |
| ticket | 门票 |
| hotel | 酒店 |
| annualCard | 年卡 |
| couponPackage | 优惠券包 |
| food | 餐饮 |
| creative | 文创商品 |

### 16.3 DiscoverCategory

| 值 | 说明 |
| --- | --- |
| recommend | 推荐 |
| activity | 体验活动 |
| guide | 攻略 |
| show | 演出 |
| food | 美食 |
| creative | 文创 |

### 16.4 SearchType

| 值 | 说明 |
| --- | --- |
| all | 全部 |
| ticket | 门票 |
| hotel | 酒店 |
| product | 商品 |
| spot | 景点 |
| show | 演出 |
| food | 餐厅 |
| article | 攻略 |

### 16.5 MapPointCategory

现有前端分类：

| 值 | 说明 |
| --- | --- |
| spot | 景点 |
| food | 素斋/餐饮 |
| toilet | 卫生间 |
| parking | 停车场 |
| service | 服务 |

后续建议补充：

| 值 | 说明 |
| --- | --- |
| show | 演出 |
| shop | 商店 |
| entrance | 出入口 |
| medical | 医疗点 |
| charger | 充电桩 |

### 16.6 OrderStatus

| 值 | 说明 |
| --- | --- |
| pendingPay | 待付款 |
| pendingUse | 待使用 |
| completed | 已完成 |
| cancelled | 已取消 |
| refunded | 已退款 |

### 16.6.1 ProductStatus

| 值 | 说明 |
| --- | --- |
| on_sale | 上架（公开商城可见） |
| off_sale | 下架（仅管理端可见） |

### 16.7 CouponStatus

| 值 | 说明 |
| --- | --- |
| available | 可用 |
| used | 已使用 |
| expired | 已过期 |

### 16.8 ReviewTargetType（点评对象类型）

| 值 | 说明 | targetId 含义 |
| --- | --- | --- |
| spot | 地图景点/设施点位 | `map` 点位 id，如 101 |
| order | 订单 | 订单 id |
| product | 商城商品 | 商品 id |
| discoverPost | 发现内容 | 发现帖 id |

### 16.9 ReviewStatus（点评状态）

| 值 | 说明 |
| --- | --- |
| pending | 待审核 |
| published | 已发布 |
| rejected | 已拒绝 |

### 16.10 FeedbackType（反馈类型）

| 值 | 说明 |
| --- | --- |
| suggestion | 建议 |
| complaint | 投诉 |
| facility | 设施/环境问题 |
| other | 其他 |

### 16.11 QuestionType（问卷题型）

| 值 | 说明 | value 类型 |
| --- | --- | --- |
| single | 单选 | string（选项 id） |
| multi | 多选 | string[] |
| text | 简答 | string |
| score | 评分 | number（1–5） |

### 16.12 SupportTicketCategory（工单分类）

| 值 | 说明 |
| --- | --- |
| ticket_refund | 门票退款/改期 |
| order_issue | 订单/支付问题 |
| facility | 景区设施 |
| route_guide | 游览咨询 |
| other | 其他 |

## 17. 下一阶段最小可交付范围

### 17.1 前端最小可交付

1. 内容层联调
   - 首页配置真实接口。
   - 发现列表和详情真实接口。
   - 搜索真实接口。
   - mock fallback 保留。

2. 地图专项第一阶段
   - 真实点位数据整理。
   - 地图点位接口接入。
   - 分类接口接入。
   - 保留现有 UI 和交互。
   - 从搜索/发现进入地图后选中或高亮对应点位。

3. AI 数字人第一阶段
   - 移除前端 API Key。
   - 接入后端 AI 代理接口。
   - 接入 FAQ 和知识库。
   - 保留简易 UI，但优化错误提示和加载状态。

4. 服务层（契约见第 13 章，**第 0 步已完成**）
   - [ ] `src/api/service.ts` + mock fallback。
   - [ ] 帮助中心、反馈、工单、点评、问卷页面。
   - [ ] 与上传、订单、地图点位入口串联。

### 17.2 后端最小可交付

1. 用户认证与用户资料。
2. 首页配置接口。
3. 发现内容接口。
4. 搜索接口。
5. 地图点位接口。
6. 商城商品接口。
7. 订单接口。
8. 优惠券接口。
9. AI 代理接口。
10. 上传接口。
11. 服务层（**已实现**，见 `server/`）：点评、反馈、问卷、工单、`GET /api/service/config`；FAQ 只读 `ai-service/faqs`；`POST /api/upload/image`。
12. 管理端首期（**已实现**）：`POST /api/admin/auth/login`；`/api/admin/*` 服务运营 + 首页/发现；公开 `GET /api/home/config`、`GET /api/discover/posts`；H5 后台 `admin-web/`（`npm run dev` 端口 5174）。验收：`cd server && npm run verify:admin`。

### 17.3 必须优先修复的问题

- 移除前端大模型 API Key。
- 地图真实数据不能继续长期写死在页面中，但要专项改造，不要在内容层里零散修改。
- 搜索、首页、发现跳地图时必须保留返回栈。
- 小程序端语音识别和语音播报不能依赖 H5 `window` 能力。
- 后端接口错误时前端必须保留 mock 或空状态兜底，避免白屏。

---

## 18. 联调验收清单

### 18.1 首页

- 首页轮播、功能矩阵、集合栏、猜你喜欢来自接口。
- 接口失败时不白屏。
- 顶部天气展示正常。
- 搜索框进入搜索页。
- 门票入口进入商城门票页。
- 地图入口进入地图后可返回首页。

### 18.2 发现

- 分类切换正常。
- 分页加载正常。
- 详情页支持活动、攻略、演出、美食类型。
- 详情相关入口可跳转。
- 地图入口进入地图后可返回详情页。

### 18.3 搜索

- 热门词正常。
- 历史搜索正常。
- 输入搜索正常。
- 类型筛选正常。
- 景点、演出、餐厅结果进入地图且可返回搜索页。
- 攻略结果进入发现详情。

### 18.4 地图

- 原有 UI 不变。
- 原有分类不丢失。
- 卫生间等分类仍能显示点位。
- 从其它页面进入地图时有返回按钮。
- 导航按钮可用。

### 18.5 AI 数字人

- 快捷问题可点击。
- 输入框可提问。
- 后端代理接入后不再暴露 API Key。
- AI 接口失败有友好提示。
- 小程序端语音能力有兼容方案。

### 18.6 服务层

- [ ] 帮助中心展示 FAQ、`servicePhone` 可拨号。
- [ ] FAQ `type=human` 进入工单页，不调用 AI chat。
- [ ] 意见反馈可上传图片并提交；失败保留表单。
- [ ] 工单可提交、我的工单可查看状态。
- [ ] 点评可从地图/发现/订单入口进入；我的点评可列表查看。
- [ ] 问卷列表、填写、提交成功提示 `rewardHint`。
- [ ] 未登录访问需登录接口时跳转登录页。
- [ ] 接口失败 mock fallback，页面不白屏。

---

## 19. 附：当前前端文件对应关系

| 模块 | 文件 |
| --- | --- |
| 首页 | `src/pages/index/index.vue` |
| 首页 API | `src/api/home.ts` |
| 发现列表 | `src/pages/discover/discover.vue` |
| 发现详情 | `src/pages/discover/discoverDetail.vue` |
| 发现 API | `src/api/discover.ts` |
| 搜索页 | `src/pages/search/search.vue` |
| 搜索 API | `src/api/search.ts` |
| 地图页 | `src/pages/map/map.vue` |
| 数字人 AI 页 | `src/pages/ai/index.vue` |
| 数字人 AI API | `src/api/ai.ts` |
| 服务层 API（规划） | `src/api/service.ts` |
| 帮助中心（规划） | `src/pages/service/help.vue` |
| 工单（规划） | `src/pages/service/ticketCreate.vue`、`ticketList.vue` |
| 点评/反馈/问卷（规划） | `src/pages/mine/reviews.vue`、`reviewEdit.vue`、`feedback.vue`、`surveyList.vue`、`surveyFill.vue` |
| 图片上传 | `src/utils/upload.ts` |
| 统一跳转 | `src/utils/navigation.ts` |
| 接口配置 | `src/config/api.ts` |
| 服务层后端 | `server/src/index.js` |
| 管理后台 H5 | `admin-web/`（Vue3 + Element Plus，端口 5174；部署见 `admin-web/README.md`） |
| 管理端 API 封装 | `admin-web/src/api/admin.ts` |

### 18.6 管理端联调清单（首期）

- [ ] `admin` / `DevOnly!2026` 登录成功（错误密码 401）
- [ ] 修改 FAQ 后小程序帮助中心可见（`VITE_SERVICE_USE_REMOTE_API=true`）
- [ ] 工单 `adminReply` 后用户工单列表可见
- [ ] 点评 `rejected` 后发现详情不展示
- [ ] 首页配置保存后小程序首页更新（`VITE_HOME_USE_REMOTE_API=true`）
- [ ] 发现帖下架后 C 端列表不展示（`VITE_DISCOVER_USE_REMOTE_API=true`）
- [ ] `cd server && npm run verify:admin` 通过

