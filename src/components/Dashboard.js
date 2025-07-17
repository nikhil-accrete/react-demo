import React, { useState, useEffect } from 'react';
import { statsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📝 Total Todos</h3>
          <p className="stat-number">{stats?.totalTodos || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>✅ Completed</h3>
          <p className="stat-number">{stats?.completedTodos || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>⏳ Pending</h3>
          <p className="stat-number">{stats?.pendingTodos || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>👥 Total Users</h3>
          <p className="stat-number">{stats?.totalUsers || 0}</p>
        </div>
      </div>

      <div className="server-info">
        <h3>🖥️ Server Information</h3>
        <p><strong>Uptime:</strong> {Math.floor(stats?.serverUptime || 0)} seconds</p>
        <p><strong>Last Updated:</strong> {new Date(stats?.timestamp).toLocaleString()}</p>
      </div>

      <button onClick={fetchStats} className="btn-primary">
        🔄 Refresh Stats
      </button>
    </div>
  );
};

export default Dashboard;