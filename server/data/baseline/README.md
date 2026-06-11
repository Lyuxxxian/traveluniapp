# 运营数据 Baseline（Git 协作）

管理端写入的 `data/store.json` **不会**进入 Git。本目录存放可提交的运营数据快照，队友 `git pull` 后自动/手动同步到本机 `store.json`。

## 谁在改数据（发布方）

1. 在 admin-web 完成地图/商城/首页等修改并保存
2. 执行：

```bash
cd server
npm run store:publish
git add data/baseline
git commit -m "sync: 运营数据 baseline"
git push
```

## 队友如何接收

1. `git pull`
2. 重启 server：`cd server && npm run dev`（启动时会自动应用较新的 baseline）

若本机已有旧 `store.json` 且未自动更新，可强制同步：

```bash
cd server
npm run store:sync
npm run dev
```

3. 重启 C 端 dev（`npm run dev:h5` 等）。开发环境已默认走 `http://localhost:3000` 远程 API（见根目录 `.env.development`）。

## 同步范围

地图点位/分类/路线、商城商品、首页配置、发现帖、FAQ、问卷、服务配置、优惠券包等。**不含**管理员密码、用户账号、订单、点评等行为数据。
