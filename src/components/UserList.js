import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers();
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    try {
      const response = await userAPI.createUser(newUser);
      setUsers([response.data.data, ...users]);
      setNewUser({ name: '', email: '', role: 'user' });
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await userAPI.updateUser(id, userData);
      setUsers(users.map(user => 
        user.id === id ? response.data.data : user
      ));
      setEditingUser(null);
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userAPI.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-management">
      <h2>👥 User Management</h2>
      
      {/* Create User Form */}
      <form onSubmit={createUser} className="user-form">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn-primary">Add User</button>
      </form>

      {/* Users List */}
      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className="user-item">
            {editingUser === user.id ? (
              <EditUserForm 
                user={user} 
                onSave={(userData) => updateUser(user.id, userData)}
                onCancel={() => setEditingUser(null)}
              />
            ) : (
              <div className="user-display">
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <span className={`role ${user.role}`}>{user.role}</span>
                  <small>{new Date(user.created_at).toLocaleDateString()}</small>
                </div>
                <div className="user-actions">
                  <button onClick={() => setEditingUser(user.id)} className="btn-secondary">
                    Edit
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EditUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-user-form">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <div className="form-actions">
        <button type="submit" className="btn-primary">Save</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
};

export default UserManagement;