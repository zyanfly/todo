import { createD1TodoRepository } from "./repositories/d1TodoRepository.js";
import {
  createTodo,
  listTodos,
  removeTodo,
  updateTodo
} from "./todoApi.js";

function parseAllowedOrigins(corsOrigin) {
  if (!corsOrigin) {
    return ["*"];
  }

  return corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsHeaders(request, allowedOrigins) {
  const origin = request.headers.get("Origin");

  if (!origin) {
    return {};
  }

  const allowOrigin =
    allowedOrigins.includes("*") || allowedOrigins.includes(origin) ? origin : null;

  if (!allowOrigin) {
    return null;
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

async function readJsonBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return {};
  }

  return request.json();
}

function jsonResponse(status, body, corsHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const allowedOrigins = parseAllowedOrigins(env.CORS_ORIGIN);
    const corsHeaders = getCorsHeaders(request, allowedOrigins);

    if (request.headers.get("Origin") && !corsHeaders) {
      return jsonResponse(403, { message: "当前来源不允许访问此接口" });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders || {}
      });
    }

    const url = new URL(request.url);
    const todoRepository = createD1TodoRepository(env.DB);

    try {
      if (request.method === "GET" && url.pathname === "/api/todos") {
        const result = await listTodos(todoRepository);
        return jsonResponse(result.status, result.body, corsHeaders || {});
      }

      if (request.method === "POST" && url.pathname === "/api/todos") {
        const body = await readJsonBody(request);
        const result = await createTodo(todoRepository, body);
        return jsonResponse(result.status, result.body, corsHeaders || {});
      }

      const todoIdMatch = url.pathname.match(/^\/api\/todos\/([^/]+)$/);

      if (todoIdMatch && request.method === "PUT") {
        const body = await readJsonBody(request);
        const result = await updateTodo(todoRepository, todoIdMatch[1], body);
        return jsonResponse(result.status, result.body, corsHeaders || {});
      }

      if (todoIdMatch && request.method === "DELETE") {
        const result = await removeTodo(todoRepository, todoIdMatch[1]);
        return jsonResponse(result.status, result.body, corsHeaders || {});
      }

      return jsonResponse(404, { message: "接口不存在" }, corsHeaders || {});
    } catch (error) {
      console.error(error);

      if (error instanceof SyntaxError) {
        return jsonResponse(400, { message: "请求体不是合法 JSON" }, corsHeaders || {});
      }

      return jsonResponse(500, { message: "服务器内部错误" }, corsHeaders || {});
    }
  }
};
