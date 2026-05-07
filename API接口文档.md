# 旅游AI助手 - 后端接口文档

## 项目概述
- **项目名称**: 旅游AI助手微信小程序
- **技术栈**: UniApp + Vue 3 + Vite
- **前端框架**: UniApp (支持多端发布)
- **文档版本**: v1.0
- **更新日期**: 2026-04-29

---

## 基础信息

### 1. 接口基础配置
- **Base URL**: 待定（部署后配置）
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: 待定（建议使用 Token 或 Session）

### 2. 通用响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

**响应码说明**:
- `200`: 请求成功
- `400`: 参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器错误

---

## 接口列表

### 一、用户模块 (User)

#### 1.1 获取用户信息
**接口说明**: 获取当前登录用户的基本信息

- **URL**: `/api/user/info`
- **Method**: `GET`
- **认证**: 需要

**请求参数**:
```
无需参数（从 Token 中获取用户信息）
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 12345,
    "username": "游客qn8kn1",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "138****8888",
    "registerTime": "2026-04-01 10:00:00"
  }
}
```

---

### 二、订单模块 (Order)

#### 2.1 获取订单列表（按状态筛选）
**接口说明**: 获取用户的订单列表，支持按状态筛选

- **URL**: `/api/orders`
- **Method**: `GET`
- **认证**: 需要

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 订单状态：all(全部), pendingPay(待付款), pendingUse(待使用), completed(已完成) |
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页数量，默认 20 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "list": [
      {
        "id": 1001,
        "title": "梵宫文化体验",
        "timeText": "2026-04-29 15:30",
        "amountText": "¥128.00",
        "status": "pendingUse",
        "orderNo": "ORD20260429001"
      },
      {
        "id": 1002,
        "title": "灵山景区门票",
        "timeText": "2026-04-28 09:00",
        "amountText": "¥88.00",
        "status": "completed",
        "orderNo": "ORD20260428002"
      }
    ]
  }
}
```

#### 2.2 获取订单详情
**接口说明**: 获取单笔订单的详细信息

- **URL**: `/api/orders/:id`
- **Method**: `GET`
- **认证**: 需要

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 订单ID（路径参数） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1001,
    "orderNo": "ORD20260429001",
    "status": "pendingUse",
    "statusText": "待使用",
    "title": "梵宫文化体验",
    "timeText": "2026-04-29 15:30",
    "amountText": "¥128.00",
    "contentText": "订单详情：包含文化体验活动全程导游服务",
    "createTime": "2026-04-29 10:00:00",
    "payTime": "2026-04-29 10:05:00",
    "useTime": null,
    "completeTime": null,
    "items": [
      {
        "name": "文化体验门票",
        "quantity": 2,
        "price": "¥64.00"
      }
    ]
  }
}
```

#### 2.3 创建订单
**接口说明**: 用户下单创建新订单

- **URL**: `/api/orders`
- **Method**: `POST`
- **认证**: 需要

**请求参数**:
```json
{
  "productId": 123,
  "productType": "activity",
  "quantity": 2,
  "useTime": "2026-05-01 10:00:00",
  "remark": "特殊需求备注"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | integer | 是 | 产品ID |
| productType | string | 是 | 产品类型：activity(活动), ticket(门票), hotel(酒店) |
| quantity | integer | 是 | 数量 |
| useTime | string | 是 | 使用时间 |
| remark | string | 否 | 备注信息 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": 1003,
    "orderNo": "ORD20260429003",
    "amount": "¥128.00",
    "payUrl": "https://pay.example.com/..."
  }
}
```

#### 2.4 取消订单
**接口说明**: 用户取消未支付的订单

- **URL**: `/api/orders/:id/cancel`
- **Method**: `POST`
- **认证**: 需要

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 订单ID（路径参数） |
| reason | string | 否 | 取消原因 |

**响应示例**:
```json
{
  "code": 200,
  "message": "订单已取消",
  "data": {
    "orderId": 1003,
    "status": "cancelled"
  }
}
```

---

### 三、发现模块 (Discover)

#### 3.1 获取发现活动列表
**接口说明**: 获取体验活动列表

- **URL**: `/api/discover/posts`
- **Method**: `GET`
- **认证**: 可选

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页数量，默认 20 |
| category | string | 否 | 分类筛选 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 30,
    "list": [
      {
        "id": 1,
        "title": "梵宫文化体验",
        "subtitle": "灵山梵宫",
        "priceText": "免费",
        "coverUrl": "https://example.com/cover1.jpg",
        "category": "文化体验",
        "rating": 4.8
      }
    ]
  }
}
```

#### 3.2 获取活动详情
**接口说明**: 获取单个活动的详细信息

- **URL**: `/api/discover/posts/:id`
- **Method**: `GET`
- **认证**: 可选

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 活动ID（路径参数） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "梵宫文化体验",
    "subtitle": "灵山梵宫",
    "priceText": "免费",
    "coverUrl": "https://example.com/cover1.jpg",
    "place": "灵山梵宫廊所庭",
    "joinWay": "点击"立即预约"即可参与",
    "durationText": "约15分钟",
    "contentText": "伴随佛通宝塔升起，游客朋友们可以沉浸式体验佛前供奉香花活动。",
    "meaningText": "带您走进佛教文化艺术的神圣殿堂...",
    "detailImageUrl": "https://example.com/detail.jpg",
    "images": [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg"
    ],
    "schedule": "每日 09:00-17:00",
    "notice": "请提前预约"
  }
}
```

---

### 四、地图模块 (Map)

#### 4.1 获取地图点位列表
**接口说明**: 获取地图上的各类点位信息（景区、餐厅、卫生间等）

- **URL**: `/api/map/points`
- **Method**: `GET`
- **认证**: 可选

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| category | string | 是 | 分类：spot(景区), food(餐厅), toilet(卫生间), parking(停车场), service(服务中心) |
| latitude | number | 否 | 当前纬度（用于距离计算） |
| longitude | number | 否 | 当前经度（用于距离计算） |
| radius | integer | 否 | 搜索半径（米），默认 5000 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 101,
      "title": "武汉长江大桥桥头堡",
      "latitude": 30.54798,
      "longitude": 114.30865,
      "address": "武昌区临江大道附近",
      "desc": "武汉地标之一，登桥可远眺两江交汇景观",
      "category": "spot",
      "distance": 1200,
      "rating": 4.5,
      "openTime": "全天开放"
    }
  ]
}
```

#### 4.2 获取点位详情
**接口说明**: 获取单个点位的详细信息

- **URL**: `/api/map/points/:id`
- **Method**: `GET`
- **认证**: 可选

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 点位ID（路径参数） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 101,
    "title": "武汉长江大桥桥头堡",
    "latitude": 30.54798,
    "longitude": 114.30865,
    "address": "武昌区临江大道附近",
    "desc": "武汉地标之一，登桥可远眺两江交汇景观，适合城市风光打卡。",
    "category": "spot",
    "phone": "027-12345678",
    "openTime": "全天开放",
    "ticketPrice": "免费",
    "images": [
      "https://example.com/spot1.jpg",
      "https://example.com/spot2.jpg"
    ],
    "facilities": ["停车场", "卫生间", "游客中心"],
    "tips": "建议傍晚时分观赏日落"
  }
}
```

---

### 五、搜索模块 (Search)

#### 5.1 搜索接口
**接口说明**: 全局搜索（景区、酒店、活动等）

- **URL**: `/api/search`
- **Method**: `GET`
- **认证**: 可选

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型：all, spot, hotel, activity |
| page | integer | 否 | 页码 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "spots": [
      {
        "id": 101,
        "type": "spot",
        "title": "九寨沟",
        "desc": "童话世界",
        "coverUrl": "https://example.com/spot.jpg"
      }
    ],
    "hotels": [],
    "activities": []
  }
}
```

---

### 六、优惠券模块 (Coupon)

#### 6.1 获取我的优惠券列表
**接口说明**: 获取用户可用的优惠券

- **URL**: `/api/coupons`
- **Method**: `GET`
- **认证**: 需要

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 状态：unused(未使用), used(已使用), expired(已过期) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 501,
      "title": "满100减20优惠券",
      "type": "discount",
      "value": 20,
      "minAmount": 100,
      "startTime": "2026-04-01 00:00:00",
      "endTime": "2026-05-31 23:59:59",
      "status": "unused",
      "scope": "全平台通用"
    }
  ]
}
```

---

### 七、意见反馈模块 (Feedback)

#### 7.1 提交意见反馈
**接口说明**: 用户提交意见反馈

- **URL**: `/api/feedback`
- **Method**: `POST`
- **认证**: 需要

**请求参数**:
```json
{
  "type": "suggestion",
  "content": "建议增加夜间模式",
  "images": ["https://example.com/feedback1.jpg"],
  "contact": "138****8888"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 反馈类型：suggestion(建议), bug(Bug反馈), complaint(投诉) |
| content | string | 是 | 反馈内容 |
| images | array | 否 | 图片URL数组 |
| contact | string | 否 | 联系方式 |

**响应示例**:
```json
{
  "code": 200,
  "message": "反馈提交成功",
  "data": {
    "feedbackId": 8001
  }
}
```

---

### 八、文件上传模块 (Upload)

#### 8.1 上传图片
**接口说明**: 上传单张图片（头像、反馈图片等）

- **URL**: `/api/upload/image`
- **Method**: `POST`
- **认证**: 需要

**请求参数**:
- Content-Type: `multipart/form-data`
- 参数名: `file` (图片文件)

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/uploads/2026/04/29/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 102400
  }
}
```

---

### 九、支付模块 (Payment)

#### 9.1 创建支付订单
**接口说明**: 创建微信支付订单

- **URL**: `/api/payment/create`
- **Method**: `POST`
- **认证**: 需要

**请求参数**:
```json
{
  "orderId": 1003,
  "payMethod": "wechat"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "timeStamp": "1619686400",
    "nonceStr": "abc123",
    "package": "prepay_id=wx20260429...",
    "signType": "RSA",
    "paySign": "xyz789..."
  }
}
```

#### 9.2 支付结果查询
**接口说明**: 查询支付状态

- **URL**: `/api/payment/query/:orderId`
- **Method**: `GET`
- **认证**: 需要

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": 1003,
    "payStatus": "success",
    "payTime": "2026-04-29 10:05:00",
    "transactionId": "4200001234567890"
  }
}
```

---

### 十、AI 助手模块 (AI Assistant)

#### 10.1 AI 对话接口
**接口说明**: 与 AI 助手进行对话

- **URL**: `/api/ai/chat`
- **Method**: `POST`
- **认证**: 需要

**请求参数**:
```json
{
  "message": "我想去九寨沟旅游，有什么推荐？",
  "contextId": "conv_12345",
  "history": [
    {
      "role": "user",
      "content": "我想去旅游"
    },
    {
      "role": "assistant",
      "content": "请问您想去哪里旅游？"
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "contextId": "conv_12345",
    "reply": "九寨沟是绝佳的选择！我为您推荐以下行程...",
    "suggestions": [
      "九寨沟有哪些景点？",
      "最佳旅游时间是什么时候？",
      "门票多少钱？"
    ]
  }
}
```

---

## 附录

### A. 数据字典

#### 订单状态 (OrderStatus)
| 值 | 说明 |
|---|------|
| all | 全部订单 |
| pendingPay | 待付款 |
| pendingUse | 待使用 |
| completed | 已完成 |
| cancelled | 已取消 |
| refunded | 已退款 |

#### 产品分类 (ProductType)
| 值 | 说明 |
|---|------|
| activity | 体验活动 |
| ticket | 景区门票 |
| hotel | 酒店住宿 |
| food | 餐饮美食 |

#### 地图点位分类 (MapCategory)
| 值 | 说明 |
|---|------|
| spot | 景区 |
| food | 餐厅 |
| toilet | 卫生间 |
| parking | 停车场 |
| service | 服务中心 |

### B. 接口优先级建议

**第一阶段（核心功能）**:
1. 用户登录/注册
2. 获取订单列表
3. 获取订单详情
4. 获取发现活动列表
5. 获取活动详情

**第二阶段（扩展功能）**:
6. 地图点位查询
7. 搜索功能
8. 优惠券管理
9. 创建订单
10. 支付功能

**第三阶段（增值功能）**:
11. AI 对话接口
12. 意见反馈
13. 文件上传
14. 取消订单

### C. 注意事项

1. **分页**: 列表接口建议统一使用 `page` 和 `pageSize` 参数
2. **时间格式**: 统一使用 `YYYY-MM-DD HH:mm:ss` 格式
3. **金额**: 建议使用"分"为单位，前端展示时转换
4. **图片**: 建议使用 CDN 加速，返回完整的 URL
5. **缓存**: 静态数据（如地图点位）可以设置合理的缓存时间
6. **安全**: 敏感操作需要验证用户身份和权限
7. **限流**: 建议对 AI 对话等接口设置请求频率限制

---
**最后更新**: 2026-04-29
