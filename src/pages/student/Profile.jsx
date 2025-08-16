import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiUser, 
  FiEdit3, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiAward, 
  FiTrendingUp, 
  FiClock, 
  FiCheckCircle,
  FiX,
  FiLoader
} from 'react-icons/fi';

const StudentProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Fetch profile data
  const { 
    data: profileData, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => authAPI.getProfile(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => authAPI.updateProfile(profileData),
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Refetch profile data to get updated information
      queryClient.invalidateQueries(['student-profile', user?.id]);
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Initialize edit data when profile data changes
  useEffect(() => {
    const userDataFromAPI = profileData?.data?.data?.user || profileData?.data?.user;
    if (userDataFromAPI) {
      setEditData({
        firstName: userDataFromAPI.firstName || '',
        lastName: userDataFromAPI.lastName || '',
        email: userDataFromAPI.email || '',
        phone: userDataFromAPI.phone || '',
        dateOfBirth: userDataFromAPI.dateOfBirth || '',
        gender: userDataFromAPI.gender || '',
        address: userDataFromAPI.address || ''
      });
    }
  }, [profileData]);

  const handleSave = () => {
    // Prepare data for API update
    const updateData = {
      firstName: editData.firstName,
      lastName: editData.lastName,
      phone: editData.phone,
      dateOfBirth: editData.dateOfBirth,
      gender: editData.gender,
      address: editData.address
    };

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    const userDataFromAPI = profileData?.data?.data?.user || profileData?.data?.user;
    if (userDataFromAPI) {
      setEditData({
        firstName: userDataFromAPI.firstName || '',
        lastName: userDataFromAPI.lastName || '',
        email: userDataFromAPI.email || '',
        phone: userDataFromAPI.phone || '',
        dateOfBirth: userDataFromAPI.dateOfBirth || '',
        gender: userDataFromAPI.gender || '',
        address: userDataFromAPI.address || ''
      });
    }
    setIsEditing(false);
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiLoader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Failed to load profile</h2>
          <p className="text-red-600 mb-4">
            {profileError.response?.data?.message || 'An error occurred while loading your profile'}
          </p>
          <button 
            onClick={() => refetchProfile()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Extract user data with fallback to auth context
  const userData = profileData?.data?.data?.user || profileData?.data?.user || user || {};
  const fullName = userData.firstName && userData.lastName 
    ? `${userData.firstName} ${userData.lastName}` 
    : userData.email || 'Student User';

  // Mock performance data (this would come from analytics API in a real app)
  const performanceData = {
    testsTaken: 8,
    averageScore: 85,
    bestScore: 92,
    totalTime: 420
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile</h1>
        <p className="text-gray-600">Manage your personal information and view your performance</p>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Profile Header with Gradient */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 px-6 py-8 text-center text-white">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30 flex items-center justify-center">
                  <FiUser size={32} className="text-white" />
                </div>
                {isEditing && (
                  <button 
                    className="absolute -bottom-1 -right-1 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    <FiEdit3 size={16} />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{fullName}</h2>
              <p className="text-blue-100 font-medium">Student</p>
            </div>

            {/* Profile Stats */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiCalendar className="text-blue-500" size={16} />
                  Member since
                </span>
                <span className="font-semibold text-gray-900">
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiUser className="text-blue-500" size={16} />
                  Role
                </span>
                <span className="font-semibold text-gray-900 capitalize">
                  {userData.role ? userData.role.toLowerCase() : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" size={16} />
                  Status
                </span>
                <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                  userData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {userData.status ? userData.status.charAt(0).toUpperCase() + userData.status.slice(1) : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiMail className="text-blue-500" size={16} />
                  Email Verified
                </span>
                <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                  userData.isEmailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userData.isEmailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600 flex items-center gap-2">
                  <FiPhone className="text-blue-500" size={16} />
                  Phone Verified
                </span>
                <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                  userData.isPhoneVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userData.isPhoneVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <div className="px-6 pb-6">
              <button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsEditing(true)}
                disabled={updateProfileMutation.isPending}
              >
                <FiEdit3 size={18} className="inline mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 h-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="text-blue-500" size={20} />
                Profile Information
              </h3>
            </div>

            <div className="p-6 h-full">
              {isEditing ? (
                <div className="space-y-6 h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiUser className="text-gray-500" size={16} />
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editData.firstName || ''}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiUser className="text-gray-500" size={16} />
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editData.lastName || ''}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiMail className="text-gray-500" size={16} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editData.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                        placeholder="Email cannot be changed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiPhone className="text-gray-500" size={16} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiCalendar className="text-gray-500" size={16} />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editData.dateOfBirth || ''}
                        onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiUser className="text-gray-500" size={16} />
                        Gender
                      </label>
                      <select
                        value={editData.gender || ''}
                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiUser className="text-gray-500" size={16} />
                        Address
                      </label>
                      <textarea
                        value={editData.address || ''}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 mt-auto">
                    <button 
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <FiLoader size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                      onClick={handleCancel}
                      disabled={updateProfileMutation.isPending}
                    >
                      <FiX size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="text-gray-500" size={16} />
                      First Name
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                      {userData.firstName || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="text-gray-500" size={16} />
                      Last Name
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                      {userData.lastName || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiMail className="text-gray-500" size={16} />
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                      {userData.email || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiPhone className="text-gray-500" size={16} />
                      Phone Number
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                      {userData.phone || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiCalendar className="text-gray-500" size={16} />
                      Date of Birth
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                      {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="text-gray-500" size={16} />
                      Gender
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                      {userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not provided'}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="text-gray-500" size={16} />
                      Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                      {userData.address || 'Not provided'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Statistics */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" size={20} />
              Performance Statistics
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle size={24} className="text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{performanceData.testsTaken}</div>
                <div className="text-sm text-blue-700 font-medium">Tests Completed</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiTrendingUp size={24} className="text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">{performanceData.averageScore}%</div>
                <div className="text-sm text-green-700 font-medium">Average Score</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiAward size={24} className="text-white" />
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">{performanceData.bestScore}%</div>
                <div className="text-sm text-yellow-700 font-medium">Best Score</div>
                </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiClock size={24} className="text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">{performanceData.totalTime}</div>
                <div className="text-sm text-purple-700 font-medium">Total Minutes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FiUser className="text-blue-500" size={20} />
              Account Information
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-sm">
                  {userData.id || 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                  {userData.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleString() : 'Never'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                  {userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 