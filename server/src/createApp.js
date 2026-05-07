import express from "express";
import cors from "cors";
import {
  createTodo,
  listTodos,
  removeTodo,
  updateTodo
} from "./todoApi.js";

function createCorsOptions(allowedOrigins) {
  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("当前来源不允许访问此接口"));
    }
  };
}

export function createApp({ todoRepository, allowedOrigins = ["http://localhost:5173"] }) {
  const app = express();

  // 允许前端应用访问后端接口。
  // 在 Cloudflare 上部署后，你可以把 Pages 域名写到 CORS_ORIGIN 中。
  app.use(cors(createCorsOptions(allowedOrigins)));

  // 解析 JSON 请求体，并把结果挂到 req.body 上。
  app.use(express.json());

  // 获取所有任务。
  app.get("/api/todos", async (req, res, next) => {
    try {
      const result = await listTodos(todoRepository);

      res.status(result.status).json(result.body);
    } catch (error) {
      next(error);
    }
  });

  // 创建任务。
  app.post("/api/todos", async (req, res, next) => {
    try {
      const result = await createTodo(todoRepository, req.body);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return next(error);
    }
  });

  // 更新任务标题或完成状态。
  app.put("/api/todos/:id", async (req, res, next) => {
    try {
      const result = await updateTodo(todoRepository, req.params.id, req.body);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return next(error);
    }
  });

  // 删除任务。
  app.delete("/api/todos/:id", async (req, res, next) => {
    try {
      const result = await removeTodo(todoRepository, req.params.id);
      return res.status(result.status).json(result.body);
    } catch (error) {
      return next(error);
    }
  });

  app.use((req, res) => {
    res.status(404).json({
      message: "接口不存在"
    });
  });

  // 统一处理 JSON 解析失败、CORS 错误和未捕获异常。
  app.use((err, req, res, next) => {
    console.error(err);

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        message: "请求体不是合法 JSON"
      });
    }

    if (err.message === "当前来源不允许访问此接口") {
      return res.status(403).json({
        message: err.message
      });
    }

    return res.status(500).json({
      message: "服务器内部错误"
    });
  });

  return app;
}
