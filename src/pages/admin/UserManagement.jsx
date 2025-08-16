import React, { useState } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'student',
      status: 'active',
      testsTaken: 15,
      averageScore: 82.5,
      lastActive: '2024-01-10',
      registeredDate: '2023-09-15'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      role: 'student',
      status: 'active',
      testsTaken: 8,
      averageScore: 78.2,
      lastActive: '2024-01-09',
      registeredDate: '2023-10-20'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'student',
      status: 'inactive',
      testsTaken: 3,
      averageScore: 65.0,
      lastActive: '2023-12-15',
      registeredDate: '2023-11-05'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'student',
      status: 'active',
      testsTaken: 22,
      averageScore: 89.7,
      lastActive: '2024-01-10',
      registeredDate: '2023-08-10'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'admin',
      status: 'active',
      testsTaken: 0,
      averageScore: 0,
      lastActive: '2024-01-10',
      registeredDate: '2023-01-01'
    }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'active'
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const user = {
      id: users.length + 1,
      ...newUser,
      testsTaken: 0,
      averageScore: 0,
      lastActive: new Date().toISOString().split('T')[0],
      registeredDate: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'student', status: 'active' });
    setShowAddUser(false);
  };

  const handleStatusToggle = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  return (
    <div className="fade-in">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            User Management
          </h1>
          <p style={{ color: '#64748b' }}>
            Manage students and administrators in the system
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddUser(true)}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="data-table" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <div className="table-title">Filters</div>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className="form-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="table-title">
            Users ({filteredUsers.length})
          </div>
          <div className="table-actions">
            <button className="btn btn-secondary">Export</button>
            <button className="btn btn-secondary">Bulk Actions</button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Tests Taken</th>
                <th>Average Score</th>
                <th>Last Active</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${user.role === 'admin' ? 'status-active' : 'status-pending'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.testsTaken}</td>
                  <td>
                    {user.averageScore > 0 ? `${user.averageScore}%` : 'N/A'}
                  </td>
                  <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                  <td>{new Date(user.registeredDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                        onClick={() => handleStatusToggle(user.id)}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="form-container" style={{ maxWidth: '500px', margin: '2rem' }}>
            <div className="form-title">Add New User</div>
            <form onSubmit={handleAddUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select 
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary">
                  Add User
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 