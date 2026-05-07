const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(result?.message || "请求失败");
  }

  return result?.data;
}

export function getTodos() {
  return request("/todos");
}

export function createTodo(title) {
  return request("/todos", {
    method: "POST",
    body: JSON.stringify({ title })
  });
}

export function updateTodo(id, todoPatch) {
  return request(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(todoPatch)
  });
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, {
    method: "DELETE"
  });
}
