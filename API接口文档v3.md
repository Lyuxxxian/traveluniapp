# 旅游 AI 助手 - API 接口文档 v3

## 1. 文档说明

- 项目名称：灵山文旅 AI 助手微信小程序
- 前端技术栈：UniApp + Vue 3 + Vite
- 当前状态：首页、地图、商城、我的、发现等主导航页面已完成静态界面；商城交易闭环（门票/酒店/年卡/优惠券 → 商品详情 → 下单 → 订单列表 → 订单详情 → 模拟支付）已完成前端封装与 mock 联调。
- 文档目标：根据当前页面结果重新梳理用户端接口、后续管理员端接口，以及下一阶段开发优先级。
- 文档版本：v3.0
- 更新日期：2026-05-17

---

## 2. 总体开发建议

当前项目已经从“页面雏形”进入“功能联调前准备”阶段。下一步建议先不要直接开发管理员端，也不要同时铺开所有二级页面，而是先完成以下三件事：

1. 统一 API 规范、数据模型和 mock 数据结构。
2. 优先打通用户端核心闭环：商城商品/门票/酒店 -> 详情 -> 创建订单 -> 我的订单 -> 订单详情。
3. 在用户端数据结构稳定后，再开发管理员端，用管理员端维护首页运营位、商品、酒店、优惠券、地图点位、演出场次、客服 FAQ 等内容。

推荐开发顺序：

1. 基础层：登录态、用户资料、上传、统一请求封装。（已完成前端封装，后端接口待联调）
2. 商城交易闭环：商品列表、商品详情、购物车、下单、订单列表、订单详情、模拟支付。
3. 内容层：首页配置、发现内容、地图点位、搜索。
4. 服务层：AI 客服、反馈、点评、问卷。
5. 管理员端：内容管理、订单管理、反馈处理、数据统计。

---

## 3. 基础约定

### 3.1 Base URL

```text
开发环境：http://localhost:3000
测试环境：https://test-api.example.com
生产环境：https://api.example.com
```

实际域名待后端部署后确定。

### 3.2 通用请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
```

未登录可访问的接口不需要 `Authorization`。

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
| 409 | 业务状态冲突，例如重复领取优惠券 |
| 500 | 服务器错误 |

### 3.6 金额与时间约定

- 金额：后端统一使用“分”为单位，例如 `21000` 表示 210 元。
- 前端展示：由前端转换为 `¥210`、`¥105` 等文案。
- 时间：统一使用 `YYYY-MM-DD HH:mm:ss`。
- 日期：统一使用 `YYYY-MM-DD`。

---

## 4. 用户与认证模块

### 4.1 登录流程说明

当前前端登录入口不再作为启动页。小程序启动后默认进入首页；用户点击底部“我的”时，如果本地没有 `traveluniapp_token`，则展示未登录状态和“点击登录”按钮。进入登录页后，用户需要先勾选“隐私政策”和“服务协议”，再点击“授权登录成为会员”，之后可选择微信授权登录或手机号登录。

当前前端已完成：

- `src/config/api.ts`：统一 `API_BASE_URL` 与接口路径。
- `src/utils/auth.ts`：本地保存 token 与用户资料。
- `src/utils/request.ts`：统一请求封装，自动携带 token。
- `src/api/user.ts`：登录、获取资料、更新资料接口封装。
- `src/utils/upload.ts`：图片选择与上传封装，当前先服务头像上传。

开发期后端未接入时，前端会使用模拟登录数据写入本地缓存；正式联调时应替换为真实后端返回。

### 4.2 账号密码登录 / 开发期模拟登录

- URL：`POST /api/auth/login`
- 认证：不需要

请求示例：

```json
{
  "username": "test_user",
  "password": "123456"
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": 12345,
      "visitorId": "灵山居士_12345",
      "nickname": "",
      "avatarUrl": "https://cdn.example.com/avatar/default.png"
    }
  }
}
```

说明：

- 当前前端的 `loginByWechat()` 和 `loginByPhone()` 暂时复用该接口封装，并在开发环境后端不可用时生成模拟 token。
- 后续真实微信授权登录建议新增独立接口，见 4.3。

### 4.3 微信授权登录

- URL：`POST /api/auth/wechat-login`
- 认证：不需要
- 当前状态：前端入口已完成，后端接口待开发。

请求示例：

```json
{
  "code": "wx_login_code",
  "encryptedData": "encrypted_user_data",
  "iv": "iv_string"
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": 12345,
      "visitorId": "灵山居士_12345",
      "nickname": "微信用户",
      "avatarUrl": "https://cdn.example.com/avatar/wx.png",
      "phone": ""
    }
  }
}
```

### 4.4 手机号登录

- URL：`POST /api/auth/phone-login`
- 认证：不需要
- 当前状态：前端入口已完成，验证码/手机号授权接口待开发。

请求示例：

```json
{
  "phone": "13800000000",
  "code": "123456"
}
```

响应格式同 4.3。

### 4.5 注册

- URL：`POST /api/auth/register`
- 认证：不需要

请求示例：

```json
{
  "username": "test_user",
  "password": "123456",
  "phone": "13800000000"
}
```

### 4.6 获取当前用户资料

- URL：`GET /api/user/profile`
- 认证：需要

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 12345,
    "visitorId": "灵山居士_12345",
    "nickname": "",
    "displayName": "灵山居士_12345",
    "avatarUrl": "https://cdn.example.com/avatar/default.png",
    "phone": "138****0000",
    "createdAt": "2026-05-14 10:00:00"
  }
}
```

说明：`nickname` 为空时，前端展示 `visitorId`。

前端行为：

- “我的”页进入时，先读取本地缓存，再静默请求该接口刷新最新资料。
- 若开发环境后端未启动，则保留本地缓存，避免页面空白。

### 4.7 更新用户资料

- URL：`PUT /api/user/profile`
- 认证：需要

请求示例：

```json
{
  "nickname": "拈花游客",
  "avatarUrl": "https://cdn.example.com/avatar/u12345.png"
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 12345,
    "visitorId": "灵山居士_12345",
    "nickname": "拈花游客",
    "displayName": "拈花游客",
    "avatarUrl": "https://cdn.example.com/avatar/u12345.png",
    "phone": "138****0000",
    "createdAt": "2026-05-14 10:00:00"
  }
}
```

前端行为：

- 头像昵称编辑页保存时调用该接口。
- 开发期后端不可用时，前端会更新本地缓存作为模拟保存。

---

## 5. 首页模块

首页当前包括顶部轮播、功能矩阵、购票/会员等快捷入口、集合栏、猜你喜欢。

### 5.1 获取首页配置

- URL：`GET /api/home/config`
- 认证：可选

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
        "key": "ticket",
        "title": "当日门票",
        "desc": "快速预约",
        "icon": "ticket"
      }
    ],
    "actionCards": [
      {
        "key": "buy",
        "title": "立即购买",
        "desc": "门票与套票",
        "icon": "buy"
      }
    ],
    "collectionSections": [
      {
        "key": "routes",
        "title": "路线选择",
        "items": [
          {
            "id": 101,
            "title": "历史文化深度游",
            "desc": "串联祥符禅寺、五智门等文化节点",
            "tag": "Routes",
            "coverUrl": "",
            "background": "linear-gradient(140deg, #a56a3d 0%, #d9b06f 100%)"
          }
        ]
      },
      {
        "key": "shows",
        "title": "演出",
        "items": [
          {
            "id": 201,
            "title": "九龙灌浴",
            "desc": "大型音乐动态群雕表演",
            "tag": "Shows",
            "nextShowText": "11：30下一场",
            "background": "linear-gradient(140deg, #386b8f 0%, #8fbdda 100%)"
          }
        ]
      }
    ],
    "feedItems": []
  }
}
```

### 5.2 获取演出场次

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
      "times": ["10:00", "11:30", "13:30", "15:00"],
      "nextShowText": "11：30下一场"
    }
  ]
}
```

---

## 6. 商城模块

商城当前包括搜索栏、客服入口、活动轮播、六个核心模块、近期推荐。

### 6.1 获取商城首页配置

- URL：`GET /api/mall/home`
- 认证：可选

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "promotions": [
      {
        "id": 1,
        "kicker": "早鸟优惠",
        "title": "灵山精舍早鸟预订优惠",
        "desc": "禅意园林住宿，提前预订享专属礼遇",
        "imageUrl": "https://cdn.example.com/mall/promo1.jpg"
      }
    ],
    "modules": [
      {
        "key": "ticket",
        "label": "门票",
        "desc": "当日票预约"
      },
      {
        "key": "hotel",
        "label": "酒店",
        "desc": "禅意住宿"
      }
    ],
    "recommendItems": [
      {
        "id": 1001,
        "type": "hotel",
        "title": "灵山精舍禅意房",
        "desc": "含早课体验与素斋早餐",
        "price": 68800,
        "priceText": "￥688起",
        "coverUrl": "https://cdn.example.com/mall/hotel1.jpg"
      }
    ]
  }
}
```

### 6.2 获取商品列表

- URL：`GET /api/mall/products`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | string | 否 | `ticket`、`hotel`、`annualCard`、`couponPackage`、`food`、`creative` |
| keyword | string | 否 | 搜索关键词 |
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
    "total": 2,
    "list": [
      {
        "id": 1001,
        "type": "ticket",
        "title": "灵山大佛成人票",
        "subtitle": "当日可订，扫码入园",
        "price": 21000,
        "originPrice": 21000,
        "coverUrl": "https://cdn.example.com/products/ticket.jpg",
        "tags": ["成人票", "即买即用"],
        "stock": 999
      }
    ]
  }
}
```

### 6.3 获取商品详情

- URL：`GET /api/mall/products/:id`
- 认证：可选

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1001,
    "type": "ticket",
    "title": "灵山大佛成人票",
    "price": 21000,
    "coverImages": [
      "https://cdn.example.com/products/ticket1.jpg"
    ],
    "tags": ["成人票", "即买即用"],
    "description": "灵山景区成人门票。",
    "notice": "请携带身份证入园。",
    "specs": [
      {
        "id": 1,
        "name": "成人票",
        "price": 21000
      },
      {
        "id": 2,
        "name": "半价票",
        "price": 10500
      }
    ]
  }
}
```

### 6.4 酒店列表

> **说明**：当前前端通过 `GET /api/mall/products?type=hotel` 复用商品列表接口获取酒店数据。后续若酒店需要独立字段（如 `facilities`、房型等），可启用独立接口 `GET /api/mall/hotels`。

响应字段建议（独立接口）：

```json
{
  "id": 2001,
  "name": "灵山精舍",
  "subtitle": "禅意园林住宿",
  "coverUrl": "https://cdn.example.com/hotel/cover.jpg",
  "price": 68800,
  "tags": ["含早课", "含素斋", "禅意园林"],
  "facilities": ["独立卫浴", "庭院景观", "免费停车"]
}
```

### 6.5 停车服务

- URL：`GET /api/mall/parking-lots`
- 认证：可选

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 301,
      "name": "灵山景区 P1 停车场",
      "latitude": 31.421,
      "longitude": 120.105,
      "availableSpaces": 128,
      "totalSpaces": 500,
      "feeRule": "首小时 10 元，之后每小时 5 元",
      "distanceText": "距入口 350m"
    }
  ]
}
```

---

## 7. 搜索模块

### 7.1 搜索专题页热门词

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
    "素面"
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
| type | string | 否 | `all`、`ticket`、`hotel`、`product`、`spot`、`food`、`article` |
| page | integer | 否 | 页码 |

---

## 8. AI 客服模块

### 8.1 获取客服推荐问题

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
      "question": "人工客服",
      "type": "human"
    },
    {
      "id": 2,
      "question": "儿童和老年人门票价格",
      "answer": "6-18周岁及60-69周岁半价（105元），6岁或1.4米以下及70岁以上免票。"
    },
    {
      "id": 3,
      "question": "九龙灌浴表演时间",
      "answer": "每日平日 10:00, 11:30, 13:30, 15:00 场次。"
    },
    {
      "id": 4,
      "question": "如何到达灵山大佛脚下",
      "answer": "可沿 216 级登云道步行到达灵山大佛脚下，建议跟随景区导览路线前往。"
    }
  ]
}
```

### 8.2 AI 对话

- URL：`POST /api/ai-service/chat`
- 认证：可选

请求示例：

```json
{
  "message": "儿童票多少钱？",
  "sessionId": "session_123",
  "history": []
}
```

---

## 9. 订单模块

### 9.1 创建订单

- URL：`POST /api/orders`
- 认证：需要

请求示例：

```json
{
  "source": "mall",
  "items": [
    {
      "productId": 1001,
      "skuId": 1,
      "quantity": 2
    }
  ],
  "useDate": "2026-05-20",
  "visitorIds": [1, 2],
  "couponId": 8001,
  "remark": ""
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| source | string | 是 | 订单来源，如 `mall`、`cart` |
| items | array | 是 | 商品明细 |
| items[].productId | integer | 是 | 商品 ID |
| items[].skuId | integer | 是 | 规格 ID |
| items[].quantity | integer | 是 | 数量 |
| useDate | string | 否 | 使用日期 |
| visitorIds | integer[] | 否 | 常用游客信息 ID 列表 |
| couponId | integer | 否 | 使用的优惠券 ID，传入后后端自动计算折后金额并核销该券 |
| remark | string | 否 | 备注 |

> **说明**：当前前端 mock 层同时传递 `title`、`coverUrl`、`productType` 等冗余字段用于即时展示，正式联调时后端应从 `productId` 查询商品信息。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": 9001,
    "orderNo": "LS202605140001",
    "payAmount": 42000,
    "status": "pendingPay"
  }
}
```

### 9.2 获取订单列表

- URL：`GET /api/orders`
- 认证：需要

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | string | 否 | `all`、`pendingPay`、`pendingUse`、`completed`、`cancelled`、`refunded` |
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |

### 9.3 获取订单详情

- URL：`GET /api/orders/:id`
- 认证：需要

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 9001,
    "orderNo": "LS202605140001",
    "status": "pendingUse",
    "statusText": "待使用",
    "payAmount": 40000,
    "couponDiscount": 2000,
    "couponTitle": "满200减20",
    "productType": "ticket",
    "items": [
      {
        "title": "灵山大佛成人票",
        "skuName": "成人票",
        "quantity": 2,
        "price": 21000
      }
    ],
    "qrCodeUrl": "https://cdn.example.com/qrcode/order9001.png",
    "createdAt": "2026-05-14 10:00:00",
    "payAt": "2026-05-14 10:03:00",
    "remark": ""
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| payAmount | integer | 实付金额（分） |
| couponDiscount | integer | 优惠券减免金额（分），0 表示未使用优惠券 |
| couponTitle | string | 优惠券名称（如"满200减20"） |
| productType | string | 商品类型，用于前端匹配可用优惠券（如 `ticket`、`hotel`、`annualCard`） |
| remark | string | 订单备注 |

### 9.4 取消订单

- URL：`POST /api/orders/:id/cancel`
- 认证：需要

### 9.5 模拟支付

开发阶段建议先使用模拟支付接口，等业务闭环完成后再接真实微信支付。

- URL：`POST /api/orders/:id/mock-pay`
- 认证：需要

---

## 10. 购物车模块

### 10.1 获取购物车

- URL：`GET /api/cart`
- 认证：需要

### 10.2 加入购物车

- URL：`POST /api/cart/items`
- 认证：需要

请求示例：

```json
{
  "productId": 1001,
  "skuId": 1,
  "quantity": 1
}
```

### 10.3 更新购物车数量

- URL：`PUT /api/cart/items/:id`
- 认证：需要

### 10.4 删除购物车项

- URL：`DELETE /api/cart/items/:id`
- 认证：需要

---

## 11. 优惠券模块

### 11.1 领券中心 - 可领取券列表

- URL：`GET /api/mall/products?type=couponPackage`
- 认证：可选

> **说明**：可领优惠券作为特殊商品类型 `couponPackage` 复用 `GET /api/mall/products` 接口，按商品列表格式返回。每张券包含 `stock` 表示剩余可领数量。

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
        "id": 6001,
        "type": "couponPackage",
        "title": "满200减20",
        "subtitle": "门票、酒店、年卡通用",
        "price": 0,
        "originPrice": 0,
        "coverUrl": "https://cdn.example.com/coupon/6001.jpg",
        "tags": ["满减", "通用"],
        "stock": 999
      },
      {
        "id": 6002,
        "type": "couponPackage",
        "title": "满100减10",
        "subtitle": "仅限门票使用",
        "price": 0,
        "originPrice": 0,
        "coverUrl": "https://cdn.example.com/coupon/6002.jpg",
        "tags": ["满减", "门票"],
        "stock": 500
      }
    ]
  }
}
```

### 11.2 领取优惠券

领取分两步：先扣减领券中心库存，再将券写入用户钱包。

**步骤 A：扣减库存**

- URL：`POST /api/mall/coupons/:id/collect`
- 认证：需要

> 将指定优惠券礼包的 `stock` 减 1。若 `stock` 已为 0 则返回 409。

**步骤 B：写入用户钱包**

- URL：`POST /api/user/coupons`
- 认证：需要

请求示例：

```json
{
  "couponPackageId": 6001
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 8004,
    "couponPackageId": 6001,
    "title": "满200减20",
    "subtitle": "门票、酒店、年卡通用",
    "minAmount": 20000,
    "discountAmount": 2000,
    "scopeLabel": "通用",
    "scopeTypes": ["ticket", "hotel", "annualCard"],
    "coverUrl": "https://cdn.example.com/coupon/6001.jpg",
    "validFrom": "2026-05-17",
    "validTo": "2026-08-15",
    "status": "available"
  }
}
```

> **业务规则**：同一用户对同一 `couponPackageId` 仅可领取一次（已领取返回 409）。

### 11.3 我的优惠券

- URL：`GET /api/user/coupons`
- 认证：需要

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 8001,
      "couponPackageId": 6001,
      "title": "满200减20",
      "subtitle": "门票、酒店、年卡通用",
      "minAmount": 20000,
      "discountAmount": 2000,
      "scopeLabel": "通用",
      "scopeTypes": ["ticket", "hotel", "annualCard"],
      "coverUrl": "https://cdn.example.com/coupon/6001.jpg",
      "validFrom": "2026-05-01",
      "validTo": "2026-12-31",
      "status": "available"
    }
  ]
}
```

### 11.4 按订单查询可用优惠券

- URL：`GET /api/user/coupons/available`
- 认证：需要

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| amount | integer | 是 | 订单原始总金额（分） |
| type | string | 是 | 商品类型，如 `ticket`、`hotel`、`annualCard` |

响应格式同 11.3，仅返回满足以下条件的券：

1. 状态为 `available`
2. 订单金额 ≥ 券的 `minAmount`
3. 券的 `scopeTypes` 包含该 `type` 或券为"通用"券

> **说明**：前端在订单详情页（待支付状态）调用该接口，展示可用券列表供用户选择。用户确认后调用 `POST /api/orders` 并传入 `couponId`，由后端核销。

---

## 12. 我的页面相关模块

### 12.1 常用游客信息列表

- URL：`GET /api/user/visitors`
- 认证：需要

### 12.2 新增常用游客信息

- URL：`POST /api/user/visitors`
- 认证：需要

请求示例：

```json
{
  "name": "张三",
  "idCard": "320000********0011",
  "phone": "13800000000",
  "type": "adult"
}
```

### 12.3 收货地址列表

- URL：`GET /api/user/addresses`
- 认证：需要

### 12.4 新增或编辑收货地址

- URL：`POST /api/user/addresses`
- 认证：需要

### 12.5 我的点评

- URL：`GET /api/user/reviews`
- 认证：需要

### 12.6 提交点评

- URL：`POST /api/reviews`
- 认证：需要

请求示例：

```json
{
  "targetType": "spot",
  "targetId": 101,
  "rating": 5,
  "content": "梵宫非常震撼，适合慢慢参观。",
  "images": []
}
```

### 12.7 调查问卷

- URL：`GET /api/surveys/active`
- 认证：可选

### 12.8 提交调查问卷

- URL：`POST /api/surveys/:id/submit`
- 认证：需要

---

## 13. 地图模块

### 13.1 获取地图点位

- URL：`GET /api/map/points`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 否 | `spot`、`food`、`toilet`、`parking`、`service`、`show` |
| latitude | number | 否 | 当前纬度 |
| longitude | number | 否 | 当前经度 |

### 13.2 获取点位详情

- URL：`GET /api/map/points/:id`
- 认证：可选

---

## 14. 发现模块

### 14.1 获取发现内容列表

- URL：`GET /api/discover/posts`
- 认证：可选

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 否 | 分类 |
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |

### 14.2 获取发现内容详情

- URL：`GET /api/discover/posts/:id`
- 认证：可选

---

## 15. 意见反馈与上传

### 15.1 提交意见反馈

- URL：`POST /api/feedback`
- 认证：需要

请求示例：

```json
{
  "type": "suggestion",
  "content": "建议增加夜间导览路线。",
  "images": ["https://cdn.example.com/feedback/1.jpg"],
  "contact": "13800000000"
}
```

### 15.2 上传图片

- URL：`POST /api/upload/image`
- 认证：需要
- Content-Type：`multipart/form-data`
- 表单字段名：`file`
- 当前前端封装：`src/utils/upload.ts`

响应示例：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/uploads/2026/05/14/abc.jpg"
  }
}
```

前端行为：

- `uploadImage(filePath)`：上传指定本地图片路径。
- `chooseAndUploadImage()`：先调用 `uni.chooseImage`，再上传图片。
- 当前头像昵称编辑页已接入该工具。
- 开发期后端上传接口不可用时，前端会回退使用本地临时图片路径用于预览和模拟保存；正式环境应返回 CDN 或对象存储的完整图片 URL。

---

## 16. 管理员端接口规划

管理员端建议等用户端核心数据模型稳定后再做。管理员端不必一开始追求完整，但要先覆盖能驱动前台展示的数据。

### 16.1 管理员登录

- URL：`POST /api/admin/auth/login`

### 16.2 首页运营位管理

- `GET /api/admin/home/config`
- `PUT /api/admin/home/config`

管理内容：

- 首页轮播图
- 功能矩阵
- 首页集合栏
- 猜你喜欢
- 演出场次显示文案

### 16.3 商品管理

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

管理内容：

- 门票
- 酒店
- 年卡
- 优惠券礼包
- 素斋/点餐商品
- 文创商品

### 16.4 酒店与房型管理

- `GET /api/admin/hotels`
- `POST /api/admin/hotels`
- `PUT /api/admin/hotels/:id`
- `POST /api/admin/hotels/:id/rooms`
- `PUT /api/admin/hotel-rooms/:roomId`

### 16.5 优惠券管理

- `GET /api/admin/coupons`
- `POST /api/admin/coupons`
- `PUT /api/admin/coupons/:id`
- `POST /api/admin/coupons/:id/publish`

### 16.6 订单管理

- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `POST /api/admin/orders/:id/refund`
- `POST /api/admin/orders/:id/verify`

### 16.7 地图点位管理

- `GET /api/admin/map/points`
- `POST /api/admin/map/points`
- `PUT /api/admin/map/points/:id`
- `DELETE /api/admin/map/points/:id`

### 16.8 客服 FAQ 管理

- `GET /api/admin/ai-service/faqs`
- `POST /api/admin/ai-service/faqs`
- `PUT /api/admin/ai-service/faqs/:id`
- `DELETE /api/admin/ai-service/faqs/:id`

### 16.9 反馈处理

- `GET /api/admin/feedback`
- `PUT /api/admin/feedback/:id/status`

### 16.10 数据统计

- `GET /api/admin/stats/overview`
- `GET /api/admin/stats/orders`
- `GET /api/admin/stats/products`

---

## 17. 数据字典

### 17.1 商品类型 ProductType

| 值 | 说明 |
| --- | --- |
| ticket | 门票 |
| hotel | 酒店 |
| annualCard | 年卡 |
| couponPackage | 优惠券礼包 |
| food | 餐饮 |
| creative | 文创商品 |
| parking | 停车服务 |

### 17.2 订单状态 OrderStatus

| 值 | 说明 |
| --- | --- |
| pendingPay | 待付款 |
| pendingUse | 待使用 |
| completed | 已完成 |
| cancelled | 已取消 |
| refunded | 已退款 |

### 17.3 地图点位类型 MapPointCategory

| 值 | 说明 |
| --- | --- |
| spot | 景点 |
| food | 餐厅 |
| toilet | 卫生间 |
| parking | 停车场 |
| service | 服务中心 |
| show | 演出地点 |

### 17.4 优惠券状态 CouponStatus（用户钱包券）

| 值 | 说明 |
| --- | --- |
| available | 可使用（满足满减条件且未过期） |
| used | 已使用（下单时核销） |
| expired | 已过期（超过 `validTo`） |

> **说明**：领券中心的可领状态通过商品 `stock` 字段判断（`stock > 0` 即可领），用户钱包中已持有并通过 `POST /api/user/coupons` 写入的券才使用上述三种状态。

---

## 18. 下一阶段最小可交付范围

建议下一阶段只做一条完整闭环：

1. 新增 API 请求封装：统一 baseURL、token、错误提示。（前端已完成）
2. 用户资料接口：获取昵称、头像、游客 ID，支持头像昵称编辑页接入。（前端已完成，后端待联调）
3. 图片上传接口：头像上传已完成前端封装，后续反馈、点评可复用。（前端已完成，后端待联调）
4. 商城商品接口：商城首页、商品列表、商品详情。
5. 订单接口：创建订单、订单列表、订单详情、模拟支付。
6. 优惠券接口：领券中心、我的优惠券。
7. 购物车接口：加入购物车、购物车列表、数量修改、删除。

暂缓内容：

- 真实微信支付。
- 完整管理员端。
- AI 大模型真实接入。
- 停车场实时余位真实数据。
- 地图实时导航。

这样做可以最快让项目从静态页面变成可演示、可联调、可继续扩展的产品原型。
