# 团队管理端数据同步

## 结论

管理端上传/修改的数据写入后端的 `server/data/store.json`。如果你和队友各自启动自己的 `localhost:3000`，就会各写各的本地数据，用户端也只能看到各自电脑的数据。

要实现“你或队友在管理端上传，双方用户端都能看到”，必须让双方的 **admin-web** 和 **C 端** 都连接同一个后端地址。

## 局域网共享后端

选一台电脑作为共享后端，例如你的电脑。

1. 共享后端电脑启动 server：

```bash
cd server
npm run dev
```

启动日志会打印类似：

```text
局域网共享后端: http://192.168.1.23:3000
```

2. 你和队友都在项目根目录执行：

```bash
npm run team:api -- http://192.168.1.23:3000
```

这个命令会同时写入：

- 根目录 `.env.local`：C 端用户端 API 地址
- `admin-web/.env.local`：管理端 API 地址

3. 双方都重启：

```bash
npm run dev:h5
cd admin-web && npm run dev
```

之后任何一方在管理端上传/修改数据，都会写入同一台共享后端的 `store.json`，双方用户端刷新后即可看到。

## 常见问题

- `localhost:3000` 只代表“自己的电脑”，不能用于多人共享。
- 如果队友打不开 `http://你的IP:3000/health`，检查两台电脑是否在同一网络、Windows 防火墙是否允许 Node.js 入站。
- `.env.local` 和 `admin-web/.env.local` 不进 Git，换共享后端地址时每台电脑都要重新执行 `npm run team:api -- <地址>`。

## Git baseline 的用途

`server/data/baseline` 只是把某一时刻的运营数据快照提交到 Git，适合发布默认数据或备份，不是实时多人同步机制。

发布快照：

```bash
cd server
npm run store:publish
git add data/baseline
git commit -m "sync: 运营数据 baseline"
git push
```

队友拉取快照：

```bash
git pull
cd server
npm run store:sync
```

实时协作仍然推荐使用“共享后端”。
