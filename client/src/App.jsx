import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Typography,
  message
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo
} from "./api/todos.js";

const { Text, Title } = Typography;

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const unfinishedCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  async function loadTodos() {
    setLoading(true);

    try {
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(values) {
    setCreating(true);

    try {
      const todo = await createTodo(values.title);
      setTodos((currentTodos) => [todo, ...currentTodos]);
      form.resetFields();
      messageApi.success("任务已创建");
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(todo) {
    try {
      const updatedTodo = await updateTodo(todo.id, {
        completed: !todo.completed
      });

      setTodos((currentTodos) =>
        currentTodos.map((item) => (item.id === todo.id ? updatedTodo : item))
      );
    } catch (error) {
      messageApi.error(error.message);
    }
  }

  function openEditModal(todo) {
    setEditingTodo(todo);
    editForm.setFieldsValue({
      title: todo.title
    });
  }

  async function handleEdit(values) {
    if (!editingTodo) {
      return;
    }

    try {
      const updatedTodo = await updateTodo(editingTodo.id, {
        title: values.title
      });

      setTodos((currentTodos) =>
        currentTodos.map((item) =>
          item.id === editingTodo.id ? updatedTodo : item
        )
      );
      setEditingTodo(null);
      messageApi.success("任务已更新");
    } catch (error) {
      messageApi.error(error.message);
    }
  }

  async function handleDelete(todo) {
    try {
      await deleteTodo(todo.id);
      setTodos((currentTodos) =>
        currentTodos.filter((item) => item.id !== todo.id)
      );
      messageApi.success("任务已删除");
    } catch (error) {
      messageApi.error(error.message);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <main className="app-shell">
      {contextHolder}

      <section className="todo-board">
        <header className="todo-header">
          <div>
            <Text className="eyebrow">Node.js + React</Text>
            <Title level={1}>TODO 学习项目</Title>
          </div>
          <Space align="center">
            <Text type="secondary">未完成 {unfinishedCount} 项</Text>
            <Button
              aria-label="刷新任务"
              icon={<ReloadOutlined />}
              onClick={loadTodos}
            />
          </Space>
        </header>

        <Form form={form} className="create-form" onFinish={handleCreate}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: "请输入任务标题" }]}
          >
            <Input
              size="large"
              placeholder="输入一个新任务"
              allowClear
              maxLength={60}
            />
          </Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={creating}
            icon={<PlusOutlined />}
          >
            创建
          </Button>
        </Form>

        <List
          className="todo-list"
          loading={loading}
          dataSource={todos}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无任务"
              />
            )
          }}
          renderItem={(todo) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  aria-label="编辑任务"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(todo)}
                />,
                <Popconfirm
                  key="delete"
                  title="删除任务"
                  description="确认删除这个任务吗？"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={() => handleDelete(todo)}
                >
                  <Button
                    danger
                    aria-label="删除任务"
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggle(todo)}
                  />
                }
                title={
                  <Space className="todo-title">
                    <Text delete={todo.completed}>{todo.title}</Text>
                    {todo.completed ? (
                      <CheckCircleOutlined className="done-icon" />
                    ) : null}
                  </Space>
                }
                description={`创建时间：${new Date(
                  todo.createdAt
                ).toLocaleString()}`}
              />
            </List.Item>
          )}
        />
      </section>

      <Modal
        title="编辑任务"
        open={Boolean(editingTodo)}
        okText="保存"
        cancelText="取消"
        onCancel={() => setEditingTodo(null)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label="任务标题"
            name="title"
            rules={[{ required: true, message: "请输入任务标题" }]}
          >
            <Input maxLength={60} allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}

export default App;
