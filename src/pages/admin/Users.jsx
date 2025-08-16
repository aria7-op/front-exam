import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, adminAPI, bookingAPI, attemptAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';
import toast from 'react-hot-toast';
import UserModal from '../../components/modals/UserModal';
import { 
  MdEdit,
  MdVisibility,
  MdViewColumn,
  MdVisibilityOff,
  MdViewList,
  MdViewModule,
  MdSearch,
  MdAdd,
  MdClose,
  MdPerson,
  MdEmail,
  MdPhone,
  MdCake,
  MdWc,
  MdHome,
  MdAdminPanelSettings,
  MdAssessment,
  MdCheckCircle,
  MdSettings,
  MdLock,
  MdCancel
} from 'react-icons/md';

const Users = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [realTimeUsers, setRealTimeUsers] = useState([]);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [viewUserLoading, setViewUserLoading] = useState(false);
  const [viewUserError, setViewUserError] = useState('');
  const [viewUserExamInfo, setViewUserExamInfo] = useState({
    bookings: [],
    attempts: [],
    stats: null
  });
  
  // Available columns with their display names and icons
  const availableColumns = [
    { key: 'firstName', label: 'First Name', icon: MdPerson },
    { key: 'lastName', label: 'Last Name', icon: MdPerson },
    { key: 'email', label: 'Email', icon: MdEmail },
    { key: 'phone', label: 'Phone', icon: MdPhone },
    { key: 'dateOfBirth', label: 'Date of Birth', icon: MdCake },
    { key: 'gender', label: 'Gender', icon: MdWc },
    { key: 'address', label: 'Address', icon: MdHome },
    { key: 'role', label: 'Role', icon: MdAdminPanelSettings },
    { key: 'status', label: 'Status', icon: MdAssessment },
    { key: 'isActive', label: 'Active', icon: MdCheckCircle },
    { key: 'isEmailVerified', label: 'Email Verified', icon: MdEmail },
    { key: 'isPhoneVerified', label: 'Phone Verified', icon: MdPhone },
    { key: 'createdAt', label: 'Created At', icon: MdSettings },
    { key: 'lastLoginAt', label: 'Last Login', icon: MdSettings }
  ];
  
  // Default visible columns
  const [visibleColumns, setVisibleColumns] = useState({
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    status: true,
    isActive: true,
    createdAt: true,
    phone: false,
    dateOfBirth: false,
    gender: false,
    address: false,
    isEmailVerified: false,
    isPhoneVerified: false,
    lastLoginAt: false
  });

  // Handle URL parameters for opening modal from Settings
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('action') === 'create') {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        profileImage: '',
        profilePicture: '',
        address: '',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        role: 'STUDENT',
        status: 'ACTIVE',
        departmentId: ''
      });
      setShowUserModal(true);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  // WebSocket event handlers for real-time user updates
  useEffect(() => {
    if (!currentUser) return;

    // Handle user login events
    const handleUserLogin = (data) => {
      queryClient.invalidateQueries(['users']);
      setRealTimeUsers(prev => {
        const existingUser = prev.find(u => u.id === data.userId);
        if (existingUser) {
          return prev.map(u => 
            u.id === data.userId 
              ? { ...u, isOnline: true, lastSeen: new Date().toISOString() }
              : u
          );
        }
        return prev;
      });
    };

    // Handle user logout events
    const handleUserLogout = (data) => {
      setRealTimeUsers(prev => 
        prev.map(u => 
          u.id === data.userId 
            ? { ...u, isOnline: false, lastSeen: new Date().toISOString() }
            : u
        )
      );
    };

    // Set up event listeners
    socketService.onUserLogin(handleUserLogin);
    socketService.onUserLogout(handleUserLogout);

    // Cleanup event listeners
    return () => {
      socketService.offUserLogin(handleUserLogin);
      socketService.offUserLogout(handleUserLogout);
    };
  }, [currentUser, queryClient]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    profileImage: '',
    profilePicture: '',
    address: '',
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
    role: 'STUDENT',
    status: 'ACTIVE',
    departmentId: ''
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users', searchTerm, selectedRole, selectedStatus],
    queryFn: () => adminAPI.getAllUsers({ 
      search: searchTerm, 
      role: selectedRole !== 'all' ? selectedRole : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined
    }),
    refetchInterval: 30000
  });

  // Create user mutation - 2 STEPS: register then update
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      // Step 1: Create user with basic fields via /auth/register
      const basicUserData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      };
      
      console.log('Step 1 - Creating user with basic fields:', basicUserData);
      
      const createdUser = await adminAPI.createUser(basicUserData);
      const userId = createdUser.data.data?.user?.id || createdUser.data.user?.id;
      
      if (!userId) {
        throw new Error('Failed to get user ID from creation response');
      }
      
      console.log('Step 1 completed - User ID:', userId);
      
      // Step 2: Update user with additional Prisma fields
      const additionalData = {
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString() : null,
        gender: userData.gender,
        profileImage: userData.profileImage,
        profilePicture: userData.profilePicture,
        address: userData.address,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        isEmailVerified: userData.isEmailVerified || false,
        isPhoneVerified: userData.isPhoneVerified || false,
        status: userData.status ? userData.status.toUpperCase() : 'ACTIVE',
        departmentId: userData.departmentId
      };
      
      // Remove null/undefined values
      const filteredAdditionalData = Object.fromEntries(
        Object.entries(additionalData).filter(([_, value]) => value !== null && value !== undefined)
      );
      
      if (Object.keys(filteredAdditionalData).length > 0) {
        console.log('Step 2 - Updating user with additional data:', filteredAdditionalData);
        try {
          await adminAPI.updateUser(userId, filteredAdditionalData);
          console.log('Step 2 completed successfully');
        } catch (updateError) {
          console.error('Step 2 failed:', updateError.response?.data);
          // Don't throw - user was created successfully in Step 1
        }
      }
      
      return createdUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User created successfully!');
      setShowUserModal(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        profileImage: '',
        profilePicture: '',
        address: '',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        role: 'STUDENT',
        status: 'ACTIVE',
        departmentId: ''
      });
    },
    onError: (error) => {
      console.error('Create user error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed validation errors if available
      if (error.response?.data?.error?.details) {
        console.error('Validation details:', error.response.data.error.details);
        const details = error.response.data.error.details;
        const errorMessages = details.map(detail => detail.message).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || error.response?.data?.error?.message || 'Failed to create user');
      }
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }) => adminAPI.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User updated successfully!');
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        role: 'STUDENT',
        status: 'ACTIVE'
      });
    },
    onError: (error) => {
      console.error('Update user error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminAPI.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully!');
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      profileImage: '',
      profilePicture: '',
      address: '',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      role: 'STUDENT',
      status: 'ACTIVE'
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',
      address: user.address || '',
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      role: user.role,
      status: user.status || 'ACTIVE'
    });
    setShowUserModal(true);
  };

  const handleViewUser = (user) => {
    setViewedUser(user);
    setShowViewModal(true);
    // Load exam-related data for students
    setViewUserLoading(true);
    setViewUserError('');
    Promise.allSettled([
      adminAPI.getUserDetails(user.id),
      // Admin list all bookings, filter by user on client if API supports it; request a few recent
      bookingAPI.getAllBookings({ userId: user.id, limit: 5, page: 1 }),
      attemptAPI.getAttemptHistory({ userId: user.id, page: 1, limit: 5 }),
    ])
      .then(([detailsRes, bookingsRes, attemptsRes]) => {
        // Merge full details if available
        if (detailsRes.status === 'fulfilled') {
          const full = detailsRes.value?.data?.data?.user || detailsRes.value?.data?.user || null;
          if (full) setViewedUser(prev => ({ ...prev, ...full }));
        }

        // Derive totals and samples
        const bookingsTotal = bookingsRes.status === 'fulfilled' ? (bookingsRes.value?.data?.data?.pagination?.total || 0) : 0;
        const attemptsTotal = attemptsRes.status === 'fulfilled' ? (attemptsRes.value?.data?.data?.pagination?.total || 0) : 0;
        const sampleBookings = bookingsRes.status === 'fulfilled' ? (bookingsRes.value?.data?.data?.bookings || []) : [];
        const sampleAttempts = attemptsRes.status === 'fulfilled' ? (attemptsRes.value?.data?.data?.attempts || []) : [];

        // Compute passed attempts if not provided
        const passedAttempts = sampleAttempts.filter(a => a.result === 'PASSED' || a.status === 'PASSED' || a.isPassed)?.length || 0;

        setViewUserExamInfo({
          bookings: sampleBookings,
          attempts: sampleAttempts,
          stats: {
            totalBookings: bookingsTotal,
            totalAttempts: attemptsTotal,
            passedAttempts,
          }
        });
      })
      .catch(() => setViewUserError('Failed to load user data'))
      .finally(() => setViewUserLoading(false));
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewedUser(null);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      profileImage: '',
      profilePicture: '',
      address: '',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      role: 'STUDENT',
      status: 'ACTIVE'
    });
  };

  const handleSubmit = () => {
    if (editingUser) {
      // Update existing user
      if (formData.firstName && formData.lastName) {
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
          status: formData.status
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        console.log('Sending update data:', updateData);
        updateUserMutation.mutate({ userId: editingUser.id, userData: updateData });
        setShowUserModal(false);
      } else {
        toast.error('Please fill in all required fields');
      }
    } else {
      // Create new user
      if (formData.email && formData.password && formData.firstName && formData.lastName) {
        createUserMutation.mutate(formData);
        setShowUserModal(false);
      } else {
        toast.error('Please fill in all required fields');
      }
    }
  };

  const handleUpdateUser = () => {
    if (formData.firstName && formData.lastName) {
      // Only send fields that the backend accepts for updates
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
        status: formData.status
      };
      
      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      console.log('Sending update data:', updateData);
      updateUserMutation.mutate({ userId: editingUser.id, userData: updateData });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const handleSelectAllColumns = () => {
    const allVisible = {};
    availableColumns.forEach(col => {
      allVisible[col.key] = true;
    });
    setVisibleColumns(allVisible);
  };

  const handleDeselectAllColumns = () => {
    const allHidden = {};
    availableColumns.forEach(col => {
      allHidden[col.key] = false;
    });
    setVisibleColumns(allHidden);
  };

  const renderCellContent = (user, columnKey) => {
    switch (columnKey) {
      case 'firstName':
      case 'lastName':
        return (
          <div style={{ fontWeight: '600', color: 'var(--secondary-900)' }}>
            {columnKey === 'firstName' ? user.firstName : user.lastName}
          </div>
        );
      case 'email':
        return user.email;
      case 'phone':
        return user.phone || 'N/A';
      case 'dateOfBirth':
        return user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A';
      case 'gender':
        return user.gender || 'N/A';
      case 'address':
        return user.address || 'N/A';
      case 'role':
        return (
          <span className={`badge ${
            user.role === 'SUPER_ADMIN' ? 'badge-danger' :
            user.role === 'ADMIN' ? 'badge-warning' :
            user.role === 'MODERATOR' ? 'badge-info' : 'badge-primary'
          }`}>
            {user.role}
          </span>
        );
      case 'status':
        return (
          <span className={`badge ${
            user.status === 'ACTIVE' || user.isActive ? 'badge-success' : 'badge-warning'
          }`}>
            {user.status || (user.isActive ? 'ACTIVE' : 'INACTIVE')}
          </span>
        );
      case 'isActive':
        return (
          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
            {user.isActive ? 'Yes' : 'No'}
          </span>
        );
      case 'isEmailVerified':
        return (
          <span className={`badge ${user.isEmailVerified ? 'badge-success' : 'badge-secondary'}`}>
            {user.isEmailVerified ? 'Verified' : 'Unverified'}
          </span>
        );
      case 'isPhoneVerified':
        return (
          <span className={`badge ${user.isPhoneVerified ? 'badge-success' : 'badge-secondary'}`}>
            {user.isPhoneVerified ? 'Verified' : 'Unverified'}
          </span>
        );
      case 'createdAt':
        return new Date(user.createdAt).toLocaleDateString();
      case 'lastLoginAt':
        return user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never';
      default:
        return user[columnKey] || 'N/A';
    }
  };

  const filteredUsers = usersData?.data?.data?.users || [];

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center p-8 md:p-10">
        <div className="text-xl md:text-2xl text-gray-600">Loading users...</div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-10">
        <div className="text-xl md:text-2xl text-red-600">Error loading users</div>
        <div className="text-sm md:text-base text-gray-600 mt-2">
          {usersError.message}
        </div>
      </div>
    );
  }

    return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Users Management</h2>
          
          {/* Search, Filters and Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Search and Filters */}
            <div className="flex flex-row items-center gap-2 lg:gap-3">
              {/* Mobile Search - Icon only that expands */}
              <div className="lg:hidden">
                {!showMobileSearch ? (
                  <button
                    onClick={() => setShowMobileSearch(true)}
                    className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                    title="Search"
                  >
                    <MdSearch className="text-base" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-40 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowMobileSearch(false);
                        setSearchTerm('');
                      }}
                      className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      <MdClose className="text-base" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Desktop Search - Always visible */}
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hidden lg:block w-48 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              
              {/* Filter Selects - Narrower on mobile */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-24 lg:w-32 px-2 lg:px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="STUDENT">Student</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-24 lg:w-32 px-2 lg:px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            
            {/* Right Side - Action Buttons */}
            <div className="flex flex-row items-center gap-3">
              {/* View Toggle Button */}
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="flex items-center justify-center min-w-[44px] px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                title={viewMode === 'table' ? 'Switch to Card View' : 'Switch to Table View'}
              >
                {viewMode === 'table' ? (
                  <MdViewModule className="text-base" />
                ) : (
                  <MdViewList className="text-base" />
                )}
              </button>
              
              <button 
                className="flex items-center justify-center whitespace-nowrap min-w-[110px] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                onClick={handleAddUser}
              >
                <MdAdd className="mr-2 text-base flex-shrink-0" />
                <span>Add User</span>
              </button>
              
              <button 
                className="flex items-center justify-center whitespace-nowrap min-w-[100px] px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold text-sm rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                onClick={() => setShowColumnModal(true)}
              >
                <MdViewColumn className="mr-2 text-base flex-shrink-0" />
                <span>Columns</span>
              </button>
            </div>
          </div>
        </div>

                {/* Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {availableColumns.filter(col => visibleColumns[col.key]).map(col => {
                    const IconComponent = col.icon;
                    return (
                      <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <IconComponent className="text-sm" />
                          {col.label}
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {availableColumns.filter(col => visibleColumns[col.key]).map(col => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderCellContent(user, col.key)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => handleViewUser(user)}
                        title="View Details"
                      >
                        <MdVisibility className="mr-1.5 text-sm" />
                        View
                      </button>
                      <button 
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <MdEdit className="mr-1.5 text-sm" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Card View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 p-3 sm:p-4 md:p-6">
              {filteredUsers.map((user) => (
              <div key={user.id} className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1 hover:border-gray-300 overflow-hidden">
              {/* Top Border Accent - simple role colors */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-purple-400'
                    : user.role === 'ADMIN'
                    ? 'bg-amber-400'
                    : user.role === 'MODERATOR'
                    ? 'bg-blue-400'
                    : 'bg-green-400'
                }`}
              ></div>
                
                {/* Card Content */}
                <div className="relative p-4 sm:p-5 md:p-6">
                
                {/* Header */}
                <div className="relative flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    {/* Avatar - simple role colors */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm sm:text-lg md:text-xl shadow-xl ring-1 sm:ring-2 ring-white flex-shrink-0 ${
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-700'
                          : user.role === 'MODERATOR'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* View Button */}
                    <button 
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-blue-300 rounded-lg sm:rounded-xl text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:shadow-md flex-shrink-0"
                      onClick={() => handleViewUser(user)}
                      title="View Details"
                    >
                      <MdVisibility className="text-sm sm:text-base" />
                    </button>
                    {/* Edit Button */}
                    <button 
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-blue-300 rounded-lg sm:rounded-xl text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:shadow-md flex-shrink-0"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                    >
                      <MdEdit className="text-sm sm:text-base" />
                    </button>
                  </div>
                </div>
                
                {/* Role Badge - simple role colors */}
                <div className="mb-3 sm:mb-4 md:mb-5">
                  <div
                    className={`inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-sm border ${
                      user.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : user.role === 'MODERATOR'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-green-100 text-green-700 border-green-200'
                    }`}
                  >
                    <MdAdminPanelSettings className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span className="hidden xs:inline">{user.role}</span>
                    <span className="xs:hidden">{user.role.split('_')[0]}</span>
                  </div>
                </div>
                
                {/* User Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {availableColumns.filter(col => visibleColumns[col.key] && col.key !== 'firstName' && col.key !== 'lastName' && col.key !== 'email' && col.key !== 'role').map(col => {
                    const IconComponent = col.icon;
                    const content = renderCellContent(user, col.key);
                    if (!content || content === 'N/A') return null;
                    
                    return (
                      <div key={col.key} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-gray-100 hover:to-gray-50 rounded-lg sm:rounded-xl border border-gray-100 hover:border-gray-200 min-h-[56px] sm:min-h-[64px] transition-all duration-200 hover:shadow-sm">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md border border-gray-100 flex-shrink-0">
                          <IconComponent className="text-gray-600 text-sm sm:text-base" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                            {col.label}
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                            {content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Status Indicator */}
                <div className="mt-3 sm:mt-4 md:mt-5 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm ${
                        user.isActive ? 'bg-green-400 ring-1 sm:ring-2 ring-green-100' : 'bg-red-400 ring-1 sm:ring-2 ring-red-100'
                      }`}></div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Removed colored hover overlay for a cleaner hover effect */}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="text-gray-500 text-lg">No users found</div>
            <div className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</div>
          </div>
        )}
      </div>


      {/* Column Visibility Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 md:p-6 lg:p-8 rounded-t-2xl relative overflow-hidden">
              <div className="absolute -top-1/2 -right-1/5 w-32 md:w-48 h-32 md:h-48 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
              
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-lg">
                    <MdViewColumn className="text-xl md:text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      Column Visibility
                    </h3>
                    <span className="text-sm md:text-base text-white text-opacity-80 font-medium block mt-1">
                      Choose which columns to show in the table
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowColumnModal(false)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 text-white p-2 rounded-xl backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <MdClose className="text-lg md:text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
                <button
                  onClick={handleSelectAllColumns}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <MdVisibility className="text-base" />
                  Select All
                </button>
                <button
                  onClick={handleDeselectAllColumns}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-lg bg-gray-50 text-gray-700 font-semibold text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <MdVisibilityOff className="text-base" />
                  Deselect All
                </button>
              </div>

              {/* Column Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableColumns.map(col => {
                  const IconComponent = col.icon;
                  return (
                    <label
                      key={col.key}
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        visibleColumns[col.key] 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50'
                      } hover:shadow-sm`}
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key]}
                        onChange={() => handleColumnToggle(col.key)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <IconComponent className={`text-lg flex-shrink-0 ${
                        visibleColumns[col.key] ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className={`font-medium text-sm ${
                        visibleColumns[col.key] ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {col.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 rounded-b-2xl flex justify-center">
              <button
                onClick={() => setShowColumnModal(false)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <MdCheckCircle className="text-base" />
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {showViewModal && viewedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-t-2xl relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {viewedUser.firstName?.[0]}{viewedUser.lastName?.[0]}
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold">{viewedUser.firstName} {viewedUser.lastName}</h3>
                    <p className="text-white/80 text-sm">{viewedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow label="First Name" value={viewedUser.firstName} icon={MdPerson} />
                <DetailRow label="Last Name" value={viewedUser.lastName} icon={MdPerson} />
                <DetailRow label="Email" value={viewedUser.email} icon={MdEmail} />
                <DetailRow label="Phone" value={viewedUser.phone || 'N/A'} icon={MdPhone} />
                <DetailRow label="Date of Birth" value={viewedUser.dateOfBirth ? new Date(viewedUser.dateOfBirth).toLocaleDateString() : 'N/A'} icon={MdCake} />
                <DetailRow label="Gender" value={viewedUser.gender || 'N/A'} icon={MdWc} />
                <DetailRow label="Address" value={viewedUser.address || 'N/A'} icon={MdHome} />
                <DetailRow label="Role" value={viewedUser.role} icon={MdAdminPanelSettings} />
                <DetailRow label="Status" value={viewedUser.status || (viewedUser.isActive ? 'ACTIVE' : 'INACTIVE')} icon={MdAssessment} />
                <DetailRow label="Active" value={viewedUser.isActive ? 'Yes' : 'No'} icon={MdCheckCircle} />
                <DetailRow label="Email Verified" value={viewedUser.isEmailVerified ? 'Yes' : 'No'} icon={MdEmail} />
                <DetailRow label="Phone Verified" value={viewedUser.isPhoneVerified ? 'Yes' : 'No'} icon={MdPhone} />
                <DetailRow label="Created At" value={viewedUser.createdAt ? new Date(viewedUser.createdAt).toLocaleString() : 'N/A'} icon={MdSettings} />
                <DetailRow label="Last Login" value={viewedUser.lastLoginAt ? new Date(viewedUser.lastLoginAt).toLocaleString() : 'Never'} icon={MdSettings} />
              </div>

              {viewedUser.role === 'STUDENT' && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Exam Activity</h4>
                  {viewUserLoading ? (
                    <div className="text-gray-500 text-sm">Loading exam data...</div>
                  ) : viewUserError ? (
                    <div className="text-red-600 text-sm">{viewUserError}</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <StatCard label="Total Bookings" value={viewUserExamInfo.stats?.totalBookings ?? 0} />
                        <StatCard label="Total Attempts" value={viewUserExamInfo.stats?.totalAttempts ?? 0} />
                        <StatCard label="Passed Attempts" value={viewUserExamInfo.stats?.passedAttempts ?? 0} />
                      </div>
                      {/* Recent Booking */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Recent Booking</h5>
                        {viewUserExamInfo.bookings.length === 0 ? (
                          <div className="text-gray-500 text-sm">No bookings found.</div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-sm text-gray-800"><span className="font-semibold">Exam:</span> {viewUserExamInfo.bookings[0].exam?.title || 'N/A'}</div>
                            <div className="text-sm text-gray-800"><span className="font-semibold">Booking Date:</span> {viewUserExamInfo.bookings[0].createdAt ? new Date(viewUserExamInfo.bookings[0].createdAt).toLocaleString() : 'N/A'}</div>
                            <div className="text-sm text-gray-800"><span className="font-semibold">Scheduled:</span> {viewUserExamInfo.bookings[0].scheduledAt ? new Date(viewUserExamInfo.bookings[0].scheduledAt).toLocaleString() : 'N/A'}</div>
                            <div className="text-sm text-gray-800"><span className="font-semibold">Status:</span> {viewUserExamInfo.bookings[0].status || 'N/A'}</div>
                          </div>
                        )}
                      </div>
                      {/* Recent Attempt */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Recent Attempt</h5>
                        {viewUserExamInfo.attempts.length === 0 ? (
                          <div className="text-gray-500 text-sm">No attempts found.</div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-sm text-gray-800"><span className="font-semibold">Exam:</span> {viewUserExamInfo.attempts[0].exam?.title || 'N/A'}</div>
                            <div className="text-sm text-gray-800"><span className="font-semibold">Score:</span> {viewUserExamInfo.attempts[0].score != null ? viewUserExamInfo.attempts[0].score : 'N/A'}</div>
                            <div className="text-sm text-gray-800"><span className="font-semibold">Result:</span> {viewUserExamInfo.attempts[0].status || 'N/A'}</div>
                            <div className="text-sm text-gray-800"><span className="font-semibold">Date:</span> {viewUserExamInfo.attempts[0].completedAt ? new Date(viewUserExamInfo.attempts[0].completedAt).toLocaleString() : (viewUserExamInfo.attempts[0].startedAt ? new Date(viewUserExamInfo.attempts[0].startedAt).toLocaleString() : 'N/A')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-2xl flex justify-end">
              <button
                onClick={handleCloseViewModal}
                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UserModal */}
      <UserModal
        showModal={showUserModal}
        onClose={handleCloseModal}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isPending={false}
        context="users"
      />
    </div>
  );
};

// Small presentational component for detail rows
const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 text-gray-600">
      <Icon className="text-base" />
    </div>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-gray-800 break-words">{value}</div>
    </div>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
    <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
  </div>
);

export default Users; 