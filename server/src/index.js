import { createApp } from "./createApp.js";
import { createMemoryTodoRepository } from "./repositories/memoryTodoRepository.js";

const PORT = 3001;
const HOST = "127.0.0.1";

const app = createApp({
  todoRepository: createMemoryTodoRepository(),
  allowedOrigins: ["http://localhost:5173"]
});

app.listen(PORT, HOST, () => {
  console.log(`TODO API server is running at http://localhost:${PORT}`);
});
