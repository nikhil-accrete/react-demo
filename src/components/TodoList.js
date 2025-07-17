import React, { useState, useEffect } from 'react';
import { todoAPI } from '../services/api';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
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

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await todoAPI.createTodo(newTodo);
      setTodos([...todos, response.data.data]);
      setNewTodo('');
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
      <h2>📝 Todo List</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
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
              <span className="todo-title">{todo.title}</span>
              <small className="todo-date">
                {new Date(todo.createdAt).toLocaleDateString()}
              </small>
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