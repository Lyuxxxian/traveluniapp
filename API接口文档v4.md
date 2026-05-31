# 旅游 AI 助手 - API 接口文档 v4

## 1. 文档说明

- 项目名称：灵山文旅 AI 助手微信小程序
- 前端技术栈：UniApp + Vue 3 + Vite
- 文档版本：v4.0
- 更新日期：2026-05-28
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

4. 服务层
   - 点评、反馈、问卷、客服 FAQ、人工客服转接。
   - 与用户资料、上传、订单、地图点位关联。

5. 管理员端
   - 首页运营位管理。
   - 发现内容管理。
   - 地图点位管理。
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

### 8.2 获取地图点位

- URL：`GET /api/map/points`
- 认证：可选
- 当前状态：前端已接 `src/api/map.ts` mock，真实接口待联调。
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

### 9.2 获取推荐问题

- URL：`GET /api/ai-service/faqs`
- 认证：可选

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "question": "九龙灌浴几点演出",
      "category": "show"
    },
    {
      "id": 2,
      "question": "亲子游怎么玩",
      "category": "route"
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
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |

### 10.3 商品详情

- URL：`GET /api/mall/products/:id`
- 认证：可选

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

### 12.4 收货地址

- `GET /api/user/addresses`
- `POST /api/user/addresses`
- `PUT /api/user/addresses/:id`
- `DELETE /api/user/addresses/:id`

---

## 13. 点评、反馈与问卷

### 13.1 提交点评

- URL：`POST /api/reviews`
- 认证：需要

请求示例：

```json
{
  "targetType": "spot",
  "targetId": 101,
  "rating": 5,
  "content": "讲解很详细，适合亲子游。",
  "images": []
}
```

### 13.2 我的点评

- URL：`GET /api/user/reviews`
- 认证：需要

### 13.3 提交意见反馈

- URL：`POST /api/feedback`
- 认证：需要

### 13.4 问卷列表

- URL：`GET /api/questionnaires`
- 认证：可选

### 13.5 提交问卷

- URL：`POST /api/questionnaires/:id/submit`
- 认证：需要

---

## 14. 上传模块

### 14.1 上传图片

- URL：`POST /api/upload/image`
- 认证：需要
- Content-Type：`multipart/form-data`
- 表单字段名：`file`

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

- `GET /api/admin/map/points`
- `POST /api/admin/map/points`
- `PUT /api/admin/map/points/:id`
- `DELETE /api/admin/map/points/:id`
- `PUT /api/admin/map/points/:id/status`

管理内容：

- 点位基础信息。
- 经纬度。
- 分类。
- 图标。
- 开放时间。
- 是否显示。
- 关联商品、演出、文章。

### 15.5 地图分类管理

- `GET /api/admin/map/categories`
- `POST /api/admin/map/categories`
- `PUT /api/admin/map/categories/:key`
- `DELETE /api/admin/map/categories/:key`

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

### 15.8 商品、酒店、优惠券、订单管理

沿用 v3 管理端规划：

- 商品管理。
- 酒店与房型管理。
- 优惠券管理。
- 订单管理。
- 核销管理。

### 15.9 反馈处理与数据统计

- `GET /api/admin/feedback`
- `PUT /api/admin/feedback/:id/status`
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

### 16.7 CouponStatus

| 值 | 说明 |
| --- | --- |
| available | 可用 |
| used | 已使用 |
| expired | 已过期 |

---

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

4. 服务层
   - 反馈提交。
   - 点评提交。
   - 问卷提交。

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
| 统一跳转 | `src/utils/navigation.ts` |
| 接口配置 | `src/config/api.ts` |

