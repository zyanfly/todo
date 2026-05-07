import { nanoid } from "nanoid";

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export function createD1TodoRepository(database) {
  return {
    async listTodos() {
      const { results } = await database
        .prepare(
          `
            SELECT
              id,
              title,
              completed,
              created_at AS createdAt,
              updated_at AS updatedAt
            FROM todos
            ORDER BY created_at DESC
          `
        )
        .all();

      return results.map(mapRow);
    },

    async getTodoById(id) {
      const row = await database
        .prepare(
          `
            SELECT
              id,
              title,
              completed,
              created_at AS createdAt,
              updated_at AS updatedAt
            FROM todos
            WHERE id = ?
          `
        )
        .bind(id)
        .first();

      return mapRow(row);
    },

    async createTodo(todoInput) {
      const id = nanoid();

      await database
        .prepare(
          `
            INSERT INTO todos (id, title, completed, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
          `
        )
        .bind(
          id,
          todoInput.title,
          todoInput.completed ? 1 : 0,
          todoInput.createdAt,
          todoInput.updatedAt
        )
        .run();

      return {
        id,
        title: todoInput.title,
        completed: todoInput.completed,
        createdAt: todoInput.createdAt,
        updatedAt: todoInput.updatedAt
      };
    },

    async updateTodo(id, todoPatch) {
      await database
        .prepare(
          `
            UPDATE todos
            SET title = ?, completed = ?, updated_at = ?
            WHERE id = ?
          `
        )
        .bind(
          todoPatch.title,
          todoPatch.completed ? 1 : 0,
          todoPatch.updatedAt,
          id
        )
        .run();

      return this.getTodoById(id);
    },

    async deleteTodo(id) {
      const todo = await this.getTodoById(id);

      if (!todo) {
        return null;
      }

      await database
        .prepare(
          `
            DELETE FROM todos
            WHERE id = ?
          `
        )
        .bind(id)
        .run();

      return todo;
    }
  };
}
