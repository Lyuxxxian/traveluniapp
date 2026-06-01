# 服务层数据表（概念模型）

当前实现为 JSON 存储（`data/store.json`），字段与 v4 契约一致，便于后续迁移 MySQL。

## reviews

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 主键 |
| userId | number | 用户 |
| targetType | string | spot / order / product / discoverPost |
| targetId | number | 对象 id |
| targetTitle | string | 展示标题 |
| rating | number | 1–5 |
| content | string | 正文 |
| images | string[] | 图片 URL |
| orderId | number? | 关联订单 |
| status | string | pending / published / rejected |
| createdAt | string | 创建时间 |

## feedback

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 主键 |
| userId | number | 用户 |
| type | string | suggestion / complaint / facility / other |
| content | string | 正文 |
| images | string[] | 图片 |
| contact | string | 手机 |
| relatedPointId | number? | 地图点位 |
| relatedOrderId | number? | 订单 |
| status | string | open / processing / closed |
| createdAt | string | 创建时间 |

## questionnaires / questionnaire_questions

问卷定义内嵌在 `questionnaires[].questions`；题目含 `id, type, title, required, options?`。

## questionnaire_submissions

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| submissionId | number | 主键 |
| userId | number | 用户 |
| questionnaireId | number | 问卷 id |
| answers | array | `{ questionId, value }[]` |
| createdAt | string | 提交时间 |

## support_tickets

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 主键 |
| userId | number | 用户 |
| ticketNo | string | 工单号 |
| category | string | 分类 |
| content | string | 描述 |
| contact | string | 电话 |
| images | string[] | 图片 |
| relatedOrderId | number? | 订单 |
| relatedPointId | number? | 点位 |
| status | string | open / processing / closed |
| adminReply | string | 客服回复 |
| createdAt / updatedAt | string | 时间 |

## ai_faqs

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 主键 |
| question | string | 问题 |
| answer | string? | 答案 |
| category | string? | 分组 |
| type | string? | normal / human |
| sort | number? | 排序 |

## service_config

单对象：`servicePhone`, `serviceHours`, `servicePhoneRemark`。
