# 运营数据 Baseline（Git 快照）

管理端写入的 `data/store.json` **不会**进入 Git。本目录存放可提交的运营数据快照，队友 `git pull` 后可手动同步到本机 `store.json`。

注意：baseline 不是实时多人同步方案。若希望你和队友谁在管理端上传，双方用户端都立即看到，请使用同一个共享后端，见 `server/docs/TEAM_DATA_SYNC.md`。

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
2. 手动同步 baseline（会先备份当前 `store.json` 到 `data/backups/`）：

```bash
cd server
npm run store:sync
npm run dev
```

3. 重启 C 端 dev（`npm run dev:h5` 等）。如果是多人实时协作，请先执行 `npm run team:api -- <共享后端地址>`，不要继续使用各自的 `localhost:3000`。

## 同步范围

地图点位/分类/路线、商城商品、首页配置、发现帖、FAQ、问卷、服务配置、优惠券包等。**不含**管理员密码、用户账号、订单、点评等行为数据。
