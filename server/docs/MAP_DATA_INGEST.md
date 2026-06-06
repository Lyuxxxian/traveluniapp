# 地图点位批量入库（M2-MAP-05）

将运营整理的点位数据写入 `server/data/store.json` 的 `mapPoints` / `mapPointDetails`，与公开 `GET /api/map/*`、管理端 **地图运营 → 点位管理** 同源。

## 三种入库方式

| 方式 | 适用 | 说明 |
| --- | --- | --- |
| **管理端单条** | 少量精修 | `admin-web` → 地图运营 → 新建/编辑，即时生效 |
| **JSON 脚本导入** | 10～数百条批量 | 本文推荐；见下文 |
| **Excel → JSON** | 运营习惯表格 | Excel 填表后导出/转换为 JSON，再走脚本 |

字段契约与 C 端 [`MapPoint`](../../src/api/map.ts)、API v4 [§15.4](../API接口文档v4.md) 一致。

---

## 一、JSON 模板（推荐）

### 1. 复制模板

```bash
cd server
copy data\templates\map-points-import.example.json data\my-points.json
```

模板内已含 **10 条示例行**，可按列改名、改坐标后整批导入。

### 2. 编辑 `my-points.json`

支持两种根结构：

```json
[
  { "category": "spot", "title": "…", "latitude": 31.42, "longitude": 120.11, "address": "…", "desc": "…" }
]
```

或（推荐，可写说明字段）：

```json
{
  "comment": "2026-06 景区精修批次",
  "points": [ … ]
}
```

### 3. 字段说明

**必填（每条）**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| category | string | 分类 key，须已存在于 `mapCategories`（如 `spot`、`food`、`toilet`） |
| title | string | 点位名称（地图 marker 标题） |
| latitude | number | 纬度 WGS84 |
| longitude | number | 经度 WGS84 |
| address | string | 地址文案 |
| desc | string | 简介 |

**可选**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | **建议省略**，由脚本自动分配，避免与种子 101–2706 冲突 |
| openTime | string | 如 `08:00-17:00` |
| status | string | `open`（默认）/ `closed` / `busy` |
| tags | string 或 string[] | 多个标签可用分号：`餐饮;示例` |
| iconKey | string | 默认等于 `category` |
| images | string 或 string[] | 详情图 URL，多图用分号分隔 |
| suggestedDuration | string | 如 `45分钟` |
| serviceTags | string 或 string[] | 服务标签 |
| relatedShowIds | number[] 或字符串 | 关联演出 id |
| relatedProductIds | number[] 或字符串 | 关联商品 id |

### 4. id 与唯一性（重要）

- **追加导入**：不要写 `id`，脚本使用 `counters.mapPoint` 递增（当前种子新点从 10001 起）。
- **禁止**与现有 `store.mapPoints[].id`、路线 `mapRoutes[].pointIds` 重复；预检失败会整批拒绝，**不会部分写入**。
- **覆盖更新**：已知 id 且确认要改，加参数 `--update`（见下文）。

### 5. 预检（必做）

```bash
cd server
npm run map:import:dry -- data/my-points.json
```

输出 `DRY-RUN 通过` 且列出「待新增 N 条」「分配 id: …」后再正式导入。

### 6. 正式导入

```bash
npm run map:import -- data/my-points.json
```

成功后：

```bash
npm run verify:map
```

C 端需 `VITE_MAP_USE_REMOTE_API=true` 并重启 H5/小程序 dev，地图才读远程数据。

### 7. 按 id 覆盖（慎用）

```bash
node scripts/import-map-points.mjs --update data/patch-101.json
```

仅当 JSON 中**显式带 id** 且该 id 已存在时更新该条；仍会做全文件校验。

---

## 二、从 Excel 整理

### 1. 表头（第一行）

建议列名与 JSON 字段一致：

`category` | `title` | `latitude` | `longitude` | `address` | `desc` | `openTime` | `status` | `tags` | `iconKey` | `suggestedDuration`

**不要**在 Excel 里填 `id`（交给脚本自动分配）。

### 2. Excel → JSON

任选其一：

1. **在线转换**：搜索「CSV to JSON array」，Excel 另存为 CSV 后转换，再套入 `{ "points": [ … ] }`。
2. **手工**：参照 `data/templates/map-points-import.example.json` 在 VS Code 中录入（10 条规模足够）。
3. **管理端**：超过 50 条且列很多时，可先用 Excel 校对，再分批复制到管理端（适合精修，不适合大批量）。

### 3. 分类 key 对照

与地图页分类一致，常见：`spot` 景点、`food` 餐饮、`toilet` 卫生间、`parking` 停车场、`service` 游客服务、`entrance` 出入口、`drinking` 饮用水、`medical` 医务室等。完整列表见 `GET /api/map/categories` 或管理端下拉。

### 4. 坐标来源

- 腾讯/高德拾取坐标后，确认与小程序 `<map>` 使用同一坐标系（景区一般为 GCJ-02，与现有种子一致即可）。
- 批量导入后可在管理端 **点位管理** 中单条微调经纬度。

---

## 三、运营检查清单

导入前：

- [ ] 已备份 `server/data/store.json`（或确认在 Git 可回滚分支）
- [ ] `category` 均在分类表中存在
- [ ] 同文件内 `title` 不重复（非强制，但便于客服沟通）
- [ ] 已执行 `npm run map:import:dry`，无 ✗ 校验错误
- [ ] 10 条试点导入后，管理端列表与 `GET /api/map/points?keyword=…` 可查到

导入后：

- [ ] `npm run verify:map` 通过
- [ ] C 端远程开关开启时地图 marker 标题正确
- [ ] `status=closed` 的点位在 `includeClosed=false` 时不展示

---

## 四、npm 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run map:import:dry -- <文件>` | 只校验、分配 id 预览，不写 store |
| `npm run map:import -- <文件>` | 写入 store |
| `npm run verify:map-import` | 自动校验模板 10 条（CI/回归） |

示例：

```bash
cd server
npm run map:import:dry -- data/templates/map-points-import.example.json
npm run verify:map-import
```

---

## 五、故障排查

| 现象 | 处理 |
| --- | --- |
| `分类不存在或无效` | 先在管理端确认分类 key，或 §15.5 种子分类 |
| `id 已存在` | 去掉 JSON 中的 `id`，或改用 `--update` |
| 导入成功但地图仍是旧名 | 重启 C 端 dev；确认 `VITE_MAP_USE_REMOTE_API=true` |
| 导入成功但 API 404 | 重启 `npm run dev`（server 进程缓存 store） |

---

## 六、相关文件

| 路径 | 说明 |
| --- | --- |
| `data/templates/map-points-import.example.json` | 10 条可编辑模板 |
| `scripts/import-map-points.mjs` | 导入脚本 |
| `src/lib/mapImport.js` | 校验与 id 规划 |
| `src/data/mapSeed.js` | 初始 152 点种子（与 C 端 `mapData.ts` 对齐） |
