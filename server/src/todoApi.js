function normalizeTitle(title) {
  return typeof title === "string" ? title.trim() : "";
}

export async function listTodos(todoRepository) {
  const todos = await todoRepository.listTodos();

  return {
    status: 200,
    body: {
      data: todos
    }
  };
}

export async function createTodo(todoRepository, input) {
  const title = normalizeTitle(input?.title);

  if (!title) {
    return {
      status: 400,
      body: {
        message: "任务标题不能为空"
      }
    };
  }

  const now = new Date().toISOString();
  const todo = await todoRepository.createTodo({
    title,
    completed: false,
    createdAt: now,
    updatedAt: now
  });

  return {
    status: 201,
    body: {
      data: todo
    }
  };
}

export async function updateTodo(todoRepository, id, input) {
  const currentTodo = await todoRepository.getTodoById(id);

  if (!currentTodo) {
    return {
      status: 404,
      body: {
        message: "任务不存在"
      }
    };
  }

  const nextTitle =
    input?.title === undefined ? currentTodo.title : normalizeTitle(input.title);

  if (!nextTitle) {
    return {
      status: 400,
      body: {
        message: "任务标题不能为空"
      }
    };
  }

  const updatedTodo = await todoRepository.updateTodo(id, {
    title: nextTitle,
    completed:
      input?.completed === undefined ? currentTodo.completed : Boolean(input.completed),
    updatedAt: new Date().toISOString()
  });

  return {
    status: 200,
    body: {
      data: updatedTodo
    }
  };
}

export async function removeTodo(todoRepository, id) {
  const deletedTodo = await todoRepository.deleteTodo(id);

  if (!deletedTodo) {
    return {
      status: 404,
      body: {
        message: "任务不存在"
      }
    };
  }

  return {
    status: 200,
    body: {
      data: deletedTodo
    }
  };
}
