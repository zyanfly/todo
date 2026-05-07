# Node.js + React TODO 学习项目

这是一个适合前端开发者学习 Node.js 的 TODO 混合项目：

- 后端：Node.js + Express，提供任务的增删改查和完成状态切换接口
- 前端：React + Ant Design，实现创建、编辑、完成、删除任务
- 本地开发：后端使用内存数组，方便先学习 Express
- Cloudflare 部署：后端使用 D1 数据库，避免部署后任务数据丢失

## 目录结构

```text
.
├── server
│   └── src
│       ├── index.js                 # 本地 Node.js 后端入口
│       ├── worker.js                # Cloudflare Worker 入口
│       ├── createApp.js             # 共享的 Express 应用
│       └── repositories             # 数据存储实现（内存 / D1）
│   ├── migrations
│   │   └── 0000_create_todos_table.sql
│   └── wrangler.jsonc              # Cloudflare Workers 配置
├── client
│   └── src
│       ├── api
│       │   └── todos.js  # 前端请求封装
│       ├── App.jsx       # TODO 页面
│       └── main.jsx      # React 入口
└── package.json          # 根目录工作区脚本
```

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

启动后访问：

- 前端：http://localhost:5173
- 后端：http://localhost:3001

前端接口地址来自 [client/.env.example](/Users/yanfeng/Documents/profile/nodejs-demo/client/.env.example) 中的 `VITE_API_BASE_URL`。  
如果你需要自定义本地环境变量，可以新建 `client/.env.local`。

## Cloudflare 开发模式

如果你想本地模拟 Cloudflare Worker + D1，可以运行：

```bash
npm run dev:cloudflare
```

这时前端建议把 `VITE_API_BASE_URL` 改成：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8787/api
```

## 后端接口

### 获取任务列表

```http
GET /api/todos
```

### 创建任务

```http
POST /api/todos
Content-Type: application/json

{
  "title": "学习 Express"
}
```

### 更新任务

```http
PUT /api/todos/:id
Content-Type: application/json

{
  "title": "学习 Express 路由",
  "completed": true
}
```

### 删除任务

```http
DELETE /api/todos/:id
```

## 部署到 Cloudflare

### 1. 部署后端到 Workers

先登录 Cloudflare：

```bash
npx wrangler login
```

创建 D1 数据库：

```bash
npm run d1:create --workspace server
```

执行后，Cloudflare 会返回一个 `database_id`。把它填到 [server/wrangler.jsonc](/Users/yanfeng/Documents/profile/nodejs-demo/server/wrangler.jsonc) 的 `database_id` 中。

然后先应用本地迁移：

```bash
npm run d1:migrate:local --workspace server
```

再把迁移应用到远程数据库：

```bash
npm run d1:migrate:remote --workspace server
```

最后部署 Worker：

```bash
npm run deploy:server
```

部署完成后，你会得到一个 Worker 地址，例如：

```text
https://todo-api-demo.<your-subdomain>.workers.dev
```

### 2. 部署前端到 Pages

把代码推到 GitHub，然后在 Cloudflare Dashboard 中创建一个 Pages 项目并连接仓库。

构建配置使用：

- Build command: `npm run build --workspace client`
- Build output directory: `client/dist`

在 Pages 项目中添加环境变量：

```bash
VITE_API_BASE_URL=https://todo-api-demo.<your-subdomain>.workers.dev/api
```

### 3. 配置 CORS

如果你的前端部署在 Pages，后端部署在 Workers，那么需要把 Pages 域名写到 [server/wrangler.jsonc](/Users/yanfeng/Documents/profile/nodejs-demo/server/wrangler.jsonc) 的 `CORS_ORIGIN` 中，例如：

```json
"vars": {
  "CORS_ORIGIN": "https://your-project.pages.dev"
}
```

如果你有自定义域名，也可以把它填进去。多个来源可以用英文逗号分隔。

## 学习建议

建议你按这个顺序阅读后端代码：

1. [server/src/createApp.js](/Users/yanfeng/Documents/profile/nodejs-demo/server/src/createApp.js)
2. [server/src/repositories/memoryTodoRepository.js](/Users/yanfeng/Documents/profile/nodejs-demo/server/src/repositories/memoryTodoRepository.js)
3. [server/src/repositories/d1TodoRepository.js](/Users/yanfeng/Documents/profile/nodejs-demo/server/src/repositories/d1TodoRepository.js)
4. [server/src/worker.js](/Users/yanfeng/Documents/profile/nodejs-demo/server/src/worker.js)

这样你会比较清楚地看到：

- Express 路由本身和“存储实现”是怎么分开的
- 本地 Node.js 服务和 Cloudflare Worker 是怎么共用同一套业务逻辑的
- 为什么部署到 Cloudflare 后需要把内存数组换成 D1
