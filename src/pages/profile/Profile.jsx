import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiX, FiCheck, FiActivity, FiSettings, FiBell, FiBarChart2, FiUsers, FiFileText, FiBook, FiAward, FiShield, FiClock } from 'react-icons/fi';
import { authAPI } from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    authAPI.getProfile()
      .then(res => {
        const user = res.data.data?.user || res.data.user || res.data.data || res.data;
        setProfile(user);
        setEditForm(user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    authAPI.updateProfile(editForm)
      .then(res => {
        setProfile(res.data.data || res.data);
        setIsEditing(false);
        setSaving(false);
      })
      .catch(() => setSaving(false));
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        margin: '20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: 'white',
          padding: '40px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div style={{ fontSize: '18px', fontWeight: '500' }}>Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        borderRadius: '20px',
        margin: '20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: 'white',
          padding: '40px'
        }}>
          <FiUser size={48} style={{ marginBottom: '16px', opacity: 0.8 }} />
          <div style={{ fontSize: '18px', fontWeight: '500' }}>Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gap: '32px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Enhanced Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            borderRadius: '50%',
            zIndex: 0
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            borderRadius: '50%',
            zIndex: 0
          }}></div>

          <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: 'white',
              fontWeight: '700',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(118, 75, 162, 0.3)',
              border: '4px solid white',
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.5), 0 6px 20px rgba(118, 75, 162, 0.4)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(118, 75, 162, 0.3)';
            }}>
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')
              )}
              {/* Status indicator */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)'
              }}></div>
            </div>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0 0 8px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Super Admin
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-block',
              marginBottom: '8px',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
            }}>
              SUPER_ADMIN
            </div>
            <p style={{ 
              color: '#64748b', 
              margin: '8px 0 0 0', 
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <FiMail size={14} />
              admin@mocktest.com
            </p>
          </div>

          <div style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              marginBottom: '16px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCalendar size={16} />
                Member since:
              </span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              marginBottom: '16px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiClock size={16} />
                Last login:
              </span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              marginBottom: '16px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiShield size={16} />
                Email verified:
              </span>
              <span style={{ 
                fontWeight: '600', 
                color: profile.isEmailVerified ? '#22c55e' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: profile.isEmailVerified ? '#22c55e' : '#ef4444'
                }}></div>
                {profile.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(16, 185, 129, 0.05))',
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.1)'
            }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAward size={16} />
                Status:
              </span>
              <span style={{ 
                fontWeight: '600', 
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
                }}></div>
                Active
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
            style={{ 
              width: '100%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isEditing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              position: 'relative',
              zIndex: 1
            }}
            onMouseOver={e => !isEditing && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)')}
            onMouseOut={e => !isEditing && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)')}
          >
            <FiEdit2 size={18} />
            Edit Profile
          </button>
        </div>

        {/* Enhanced Profile Details */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
            borderRadius: '50%',
            zIndex: 0
          }}></div>

          <div style={{ 
            marginBottom: '32px',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 24px 0',
              paddingBottom: '16px',
              borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiUser style={{ color: 'white' }} />
              </div>
              Profile Information
            </h3>

            {isEditing ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiUser style={{ marginRight: '10px', color: '#667eea' }} />
                    First Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiUser style={{ 
                      position: 'absolute', 
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9ca3af',
                      zIndex: 1
                    }} />
                    <input
                      type="text"
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        background: '#f8fafc',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiUser style={{ marginRight: '10px', color: '#667eea' }} />
                    Last Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiUser style={{ 
                      position: 'absolute', 
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9ca3af',
                      zIndex: 1
                    }} />
                    <input
                      type="text"
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        background: '#f8fafc',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiMail style={{ marginRight: '10px', color: '#667eea' }} />
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiMail style={{ 
                      position: 'absolute', 
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9ca3af',
                      zIndex: 1
                    }} />
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        background: '#f8fafc',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiPhone style={{ marginRight: '10px', color: '#667eea' }} />
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiPhone style={{ 
                      position: 'absolute', 
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9ca3af',
                      zIndex: 1
                    }} />
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        background: '#f8fafc',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiUsers style={{ marginRight: '10px', color: '#667eea' }} />
                    Gender
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setEditForm({ ...editForm, gender })}
                        style={{
                          padding: '12px 20px',
                          border: editForm.gender === gender ? '2px solid #667eea' : '2px solid #e2e8f0',
                          borderRadius: '12px',
                          background: editForm.gender === gender ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f8fafc',
                          color: editForm.gender === gender ? 'white' : '#374151',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.3s ease',
                          boxShadow: editForm.gender === gender ? '0 4px 16px rgba(102, 126, 234, 0.3)' : 'none'
                        }}
                        onMouseOver={e => {
                          if (editForm.gender !== gender) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                          }
                        }}
                        onMouseOut={e => {
                          if (editForm.gender !== gender) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <FiUser size={16} />
                        {gender === 'MALE' ? 'Male' : 
                         gender === 'FEMALE' ? 'Female' : 
                         gender === 'OTHER' ? 'Other' : 'Prefer not to say'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiCalendar style={{ marginRight: '10px', color: '#667eea' }} />
                    Date of Birth
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiCalendar style={{ 
                      position: 'absolute', 
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9ca3af',
                      zIndex: 1
                    }} />
                    <input
                      type="date"
                      value={editForm.dateOfBirth ? editForm.dateOfBirth.slice(0,10) : ''}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        background: '#f8fafc',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={e => !saving && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)')}
                    onMouseOut={e => !saving && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3)')}
                  >
                    <FiCheck size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                      color: '#64748b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={e => !saving && (e.target.style.transform = 'translateY(-2px)', e.target.style.background = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)')}
                    onMouseOut={e => !saving && (e.target.style.transform = 'translateY(0)', e.target.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)')}
                  >
                    <FiX size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiUser style={{ marginRight: '10px', color: '#667eea' }} />
                    Full Name
                  </label>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                    borderRadius: '12px', 
                    color: '#1e293b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <FiUser style={{ color: '#667eea' }} />
                    {profile.firstName} {profile.lastName}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiMail style={{ marginRight: '10px', color: '#667eea' }} />
                    Email
                  </label>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                    borderRadius: '12px', 
                    color: '#1e293b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <FiMail style={{ color: '#667eea' }} />
                    {profile.email}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiPhone style={{ marginRight: '10px', color: '#667eea' }} />
                    Phone Number
                  </label>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                    borderRadius: '12px', 
                    color: '#1e293b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <FiPhone style={{ color: '#667eea' }} />
                    {profile.phone || '-'}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiUsers style={{ marginRight: '10px', color: '#667eea' }} />
                    Gender
                  </label>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                    borderRadius: '12px', 
                    color: '#1e293b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <FiUsers style={{ color: '#667eea' }} />
                    {profile.gender || '-'}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                    <FiCalendar style={{ marginRight: '10px', color: '#667eea' }} />
                    Date of Birth
                  </label>
                  <div style={{ 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                    borderRadius: '12px', 
                    color: '#1e293b', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <FiCalendar style={{ color: '#667eea' }} />
                    {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile; 