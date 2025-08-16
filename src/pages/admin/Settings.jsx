import React, { useState } from 'react';
import { MdPersonAdd, MdPeople, MdSettings, MdSecurity } from 'react-icons/md';
import UserModal from '../../components/modals/UserModal';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    systemName: 'Mock Test Pro',
    defaultTestDuration: 60,
    maxStudentsPerTest: 50,
    autoGradeTests: true,
    emailNotifications: true,
    maintenanceMode: false,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  // UserModal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    role: 'MODERATOR', // Default role for Settings context
    status: 'ACTIVE',
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false
  });
  const [isPending, setIsPending] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // UserModal handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      gender: '',
      role: 'MODERATOR',
      status: 'ACTIVE',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      address: user.address || '',
      gender: user.gender || '',
      role: user.role || 'MODERATOR',
      status: user.status || 'ACTIVE',
      isActive: user.isActive !== undefined ? user.isActive : true,
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false
    });
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      gender: '',
      role: 'MODERATOR',
      status: 'ACTIVE',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false
    });
  };

  const handleSubmitUser = async () => {
    setIsPending(true);
    try {
      if (editingUser) {
        // Update existing user (send only allowed fields)
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          gender: formData.gender || null,
          address: formData.address,
          isActive: formData.isActive,
          isEmailVerified: formData.isEmailVerified,
          isPhoneVerified: formData.isPhoneVerified,
          status: (formData.status || 'ACTIVE').toUpperCase()
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await adminAPI.updateUser(editingUser.id, updateData);
        toast.success('User updated successfully!');
      } else {
        // Create user in two steps (register basic, then update additional fields)
        const basicUserData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role || 'MODERATOR'
        };
        const createdUser = await adminAPI.createUser(basicUserData);
        const userId = createdUser.data?.data?.user?.id || createdUser.data?.user?.id;
        if (!userId) {
          throw new Error('Failed to get user ID from creation response');
        }
        const additionalData = {
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          gender: formData.gender || null,
          address: formData.address,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          isEmailVerified: formData.isEmailVerified || false,
          isPhoneVerified: formData.isPhoneVerified || false,
          status: (formData.status || 'ACTIVE').toUpperCase()
        };
        const filteredAdditionalData = Object.fromEntries(
          Object.entries(additionalData).filter(([_, value]) => value !== null && value !== undefined)
        );
        if (Object.keys(filteredAdditionalData).length > 0) {
          try {
            await adminAPI.updateUser(userId, filteredAdditionalData);
          } catch (updateError) {
            console.error('Step 2 failed:', updateError.response?.data || updateError);
            // Do not throw; user was created successfully in step 1
          }
        }
        toast.success('User created successfully!');
      }

      // Reset form and close modal
      handleCloseUserModal();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Error saving user. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
          System Settings
        </h1>
        <p style={{ color: '#64748b' }}>
          Configure system preferences and behavior
        </p>
      </div>

      <div className="form-container">
        <div className="form-title">General Settings</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">System Name</label>
            <input
              type="text"
              className="form-input"
              value={settings.systemName}
              onChange={(e) => handleSettingChange('systemName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Default Test Duration (minutes)</label>
            <input
              type="number"
              className="form-input"
              value={settings.defaultTestDuration}
              onChange={(e) => handleSettingChange('defaultTestDuration', parseInt(e.target.value))}
              min="15"
              max="300"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Students Per Test</label>
            <input
              type="number"
              className="form-input"
              value={settings.maxStudentsPerTest}
              onChange={(e) => handleSettingChange('maxStudentsPerTest', parseInt(e.target.value))}
              min="1"
              max="100"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select 
              className="form-select"
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">GMT</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-container" style={{ marginTop: '2rem' }}>
        <div className="form-title">Feature Settings</div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Auto-Grade Tests</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Automatically grade tests upon completion</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings.autoGradeTests}
                onChange={(e) => handleSettingChange('autoGradeTests', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.autoGradeTests ? '#667eea' : '#cbd5e1',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.autoGradeTests ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.3s'
                }}></span>
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Email Notifications</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Send email notifications for test results</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.emailNotifications ? '#667eea' : '#cbd5e1',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.emailNotifications ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.3s'
                }}></span>
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>Maintenance Mode</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Put system in maintenance mode (admin only)</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.maintenanceMode ? '#ef4444' : '#cbd5e1',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.maintenanceMode ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.3s'
                }}></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="form-container" style={{ marginTop: '2rem' }}>
        <div className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MdPeople style={{ fontSize: '24px', color: 'var(--primary-600)' }} />
          User Management
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Quick actions for managing users in the system
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {/* Create New User Card */}
          <div style={{ 
            padding: '24px', 
            border: '2px solid var(--primary-200)', 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: 'var(--primary-100)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--primary-200)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <MdPersonAdd style={{ fontSize: '28px', color: 'var(--primary-700)' }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: 'var(--secondary-900)',
                  margin: '0 0 4px 0'
                }}>
                  Create New User
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: 'var(--secondary-600)', 
                  margin: 0 
                }}>
                  Add users to the system
                </p>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--secondary-700)', 
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Create new user accounts with customizable roles, permissions, and profile information. 
              Perfect for adding students, moderators, or administrators.
            </p>
            
            <button 
              className="btn btn-primary"
              onClick={handleAddUser}
              style={{ 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <MdPersonAdd style={{ fontSize: '18px' }} />
              Create Moderator Account
            </button>
          </div>

          {/* Manage Users Card */}
          <div style={{ 
            padding: '24px', 
            border: '2px solid var(--secondary-200)', 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--secondary-50) 0%, var(--primary-50) 100%)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: 'var(--secondary-100)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--secondary-200)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <MdPeople style={{ fontSize: '28px', color: 'var(--secondary-700)' }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: 'var(--secondary-900)',
                  margin: '0 0 4px 0'
                }}>
                  Manage All Users
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: 'var(--secondary-600)', 
                  margin: 0 
                }}>
                  View and edit existing users
                </p>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--secondary-700)', 
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Access the full user management interface to search, filter, edit, and manage 
              all user accounts in the system.
            </p>
            
            <button 
              className="btn btn-secondary"
              onClick={() => {
                // Navigate to Users page
                window.location.href = '/admin/users';
              }}
              style={{ 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <MdPeople style={{ fontSize: '18px' }} />
              Open User Management
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn btn-primary">Save Settings</button>
        <button className="btn btn-secondary">Reset to Default</button>
      </div>

      {/* UserModal */}
      <UserModal
        showModal={showUserModal}
        onClose={handleCloseUserModal}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitUser}
        isPending={isPending}
        context="settings"
      />
    </div>
  );
};

export default Settings; 