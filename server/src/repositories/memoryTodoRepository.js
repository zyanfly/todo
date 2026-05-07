import { nanoid } from "nanoid";

function createSeedTodo(title) {
  const now = new Date().toISOString();

  return {
    id: nanoid(),
    title,
    completed: false,
    createdAt: now,
    updatedAt: now
  };
}

export function createMemoryTodoRepository() {
  const todos = [createSeedTodo("学习 Node.js 路由")];

  return {
    async listTodos() {
      return todos;
    },

    async getTodoById(id) {
      return todos.find((todo) => todo.id === id) || null;
    },

    async createTodo(todoInput) {
      const todo = {
        id: nanoid(),
        title: todoInput.title,
        completed: todoInput.completed,
        createdAt: todoInput.createdAt,
        updatedAt: todoInput.updatedAt
      };

      todos.unshift(todo);

      return todo;
    },

    async updateTodo(id, todoPatch) {
      const todo = todos.find((item) => item.id === id);

      if (!todo) {
        return null;
      }

      todo.title = todoPatch.title;
      todo.completed = todoPatch.completed;
      todo.updatedAt = todoPatch.updatedAt;

      return todo;
    },

    async deleteTodo(id) {
      const todoIndex = todos.findIndex((todo) => todo.id === id);

      if (todoIndex === -1) {
        return null;
      }

      const [deletedTodo] = todos.splice(todoIndex, 1);
      return deletedTodo;
    }
  };
}
