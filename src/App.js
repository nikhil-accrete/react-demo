import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TodoList from './components/TodoList';
import UserList from './components/UserList';
import Dashboard from './components/Dashboard';
import { statsAPI } from './services/api';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await statsAPI.healthCheck();
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('error');
      console.error('API Health Check Failed:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="navbar">
            <div className="nav-brand">
              <h1>🚀 Node.js + React App</h1>
              <span className={`api-status ${apiStatus}`}>
                API: {apiStatus}
              </span>
            </div>
            <div className="nav-links">
              <Link to="/">Dashboard</Link>
              <Link to="/todos">Todos</Link>
              <Link to="/users">Users</Link>
            </div>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/users" element={<UserList />} />
          </Routes>
        </main>

        <footer className="App-footer">
          <p>Full-Stack App with Node.js API + React Frontend</p>
          <button onClick={checkApiHealth} className="btn-secondary">
            🔄 Check API Status
          </button>
        </footer>
      </div>
    </Router>
  );
}

export default App;