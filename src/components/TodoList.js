import React, { useState, useEffect } from 'react';
import { todoAPI, userAPI } from '../services/api';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
    fetchUsers();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getTodos();
      setTodos(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await todoAPI.createTodo(newTodo, selectedUser || null);
      setTodos([response.data.data, ...todos]);
      setNewTodo('');
      setSelectedUser('');
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await todoAPI.updateTodo(id, { completed: !completed });
      setTodos(todos.map(todo => 
        todo.id === id ? response.data.data : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todoAPI.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading todos...</div>;

  return (
    <div className="todo-list">
      <h2>📝 Todo List (MySQL Powered)</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="user-select"
        >
          <option value="">Assign to user (optional)</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary">Add Todo</button>
      </form>

      <div className="todos">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-content">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <div className="todo-details">
                <span className="todo-title">{todo.title}</span>
                {todo.user_name && (
                  <small className="todo-user">👤 {todo.user_name}</small>
                )}
                <small className="todo-date">
                  📅 {new Date(todo.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <p className="empty-state">No todos yet. Add one above!</p>
      )}
    </div>
  );
};

export default TodoList;