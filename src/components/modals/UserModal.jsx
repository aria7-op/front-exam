import React from 'react';
import { 
  MdEmail, 
  MdLock, 
  MdPerson, 
  MdPhone, 
  MdCake, 
  MdHome, 
  MdAdminPanelSettings, 
  MdWc, 
  MdAssessment, 
  MdSettings, 
  MdCheckCircle, 
  MdCancel,
  MdSave,
  MdAdd,
  MdClose,
  MdPrint
} from 'react-icons/md';

const UserModal = ({ 
  showModal, 
  onClose, 
  editingUser, 
  formData, 
  setFormData, 
  onSubmit, 
  isPending,
  context = 'users',
  onPrint
}) => {
  if (!showModal) return null;

  // Set default role based on context
  React.useEffect(() => {
    if (!editingUser && context === 'users') {
      setFormData(prev => ({ ...prev, role: 'STUDENT' }));
    } else if (!editingUser && context === 'settings') {
      setFormData(prev => ({ ...prev, role: 'MODERATOR' }));
    }
  }, [context, editingUser, setFormData]);

  // Get modal title and description based on context
  const getModalInfo = () => {
    if (context === 'settings') {
      return {
        title: editingUser ? 'Edit Moderator' : 'Add New Moderator',
        description: editingUser ? 'Update moderator information' : 'Create a new moderator account',
        subtitle: editingUser ? 'Update moderator information below' : 'Fill in the moderator details to create a new account'
      };
    }
    return {
      title: editingUser ? 'Edit User' : 'Add New User',
      description: editingUser ? 'Update user information' : 'Create a new user account',
      subtitle: editingUser ? 'Update user information below' : 'Fill in the user details to create a new account'
    };
  };

  const modalInfo = getModalInfo();

  // Print styles
  const printStyles = `
    @media print {
      @page {
        margin: 1in;
        size: A4;
      }
      
      body {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      .print-content {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1f2937;
        line-height: 1.6;
      }
      
      .print-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #3b82f6;
      }
      
      .print-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1e40af;
        margin: 0 0 0.5rem 0;
      }
      
      .print-subtitle {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
      }
      
      .print-section {
        margin-bottom: 2rem;
        break-inside: avoid;
      }
      
      .print-section-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1e40af;
        margin: 0 0 1rem 0;
        padding-bottom: 0.25rem;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .print-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      
      .print-field {
        margin-bottom: 0.75rem;
      }
      
      .print-label {
        font-weight: 600;
        color: #374151;
        display: block;
        margin-bottom: 0.25rem;
      }
      
      .print-value {
        color: #6b7280;
        padding: 0.25rem 0;
      }
      
      .print-footer {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
        font-size: 0.75rem;
        color: #9ca3af;
        text-align: center;
      }
      
      .no-print {
        display: none !important;
      }
    }
  `;

  const handlePrint = () => {
    if (onPrint) {
      onPrint(formData);
    } else {
      window.print();
    }
  };

  return (
    <>
      <style>{printStyles}</style>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-auto border border-gray-200">
          {/* Modal Header */}
          <div className="p-8 pb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-indigo-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-2xl border-2 border-blue-200 shadow-lg">
                <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl border-2 border-blue-200 shadow-md">
                  {editingUser ? (
                    <MdSave className="text-3xl text-blue-700" />
                  ) : (
                    <MdAdd className="text-3xl text-blue-700" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900 m-0 leading-tight">
                    {modalInfo.title}
                  </h3>
                  <span className="text-sm text-gray-600 font-medium px-3 py-1 bg-white/70 rounded-full border border-blue-100">
                    {modalInfo.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-md transition-all duration-200 flex items-center justify-center hover:bg-blue-100"
                  title="Print user information"
                >
                  <MdPrint className="text-xl" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-500 hover:text-red-600 rounded-md transition-all duration-200 flex items-center justify-center hover:bg-gray-100"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              {modalInfo.subtitle}
            </p>
          </div>
          
          {/* Modal Body */}
          <div className="p-10 bg-gradient-to-b from-white/80 to-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="flex flex-col gap-5">
                {/* Email */}
                <div>
                  <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                    <MdEmail className="mr-2 text-base text-blue-600 flex-shrink-0" />
                    <span className="inline-block align-middle">
                      Email *
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    placeholder="user@example.com"
                    className={`w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                      editingUser ? 'bg-gray-100' : 'bg-white'
                    }`}
                  />
                </div>

                {/* Password */}
                {!editingUser && (
                  <div>
                    <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                      <MdLock className="mr-2 text-base text-blue-600 flex-shrink-0" />
                      <span className="inline-block align-middle">
                        Password *
                      </span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                )}

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                      <MdPerson className="mr-2 text-base text-blue-600 flex-shrink-0" />
                      <span className="inline-block align-middle">
                        First Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                      <MdPerson className="mr-2 text-base text-blue-600 flex-shrink-0" />
                      <span className="inline-block align-middle">
                        Last Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Phone & Date of Birth */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                      <MdPhone className="mr-2 text-base text-blue-600 flex-shrink-0" />
                      <span className="inline-block align-middle">
                        Phone
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                      <MdCake className="mr-2 text-base text-blue-600 flex-shrink-0" />
                      <span className="inline-block align-middle">
                        Date of Birth
                      </span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                    <MdHome className="mr-2 text-base text-blue-600 flex-shrink-0" />
                    <span className="inline-block align-middle">
                      Address
                    </span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    rows="3"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm resize-y transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-inherit"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-5">
                {/* Role & Gender - Role is hidden, only show Gender */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                      <MdWc className="mr-2 text-base text-blue-600 flex-shrink-0" />
                      <span className="inline-block align-middle">
                        Gender
                      </span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center justify-start mb-2.5 font-semibold text-gray-700 text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 leading-none">
                    <MdAssessment className="mr-2 text-base text-blue-600 flex-shrink-0" />
                    <span className="inline-block align-middle">
                      Status
                    </span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
                  <h4 className="m-0 mb-5 text-lg font-bold text-gray-800 flex items-center px-4 py-3 bg-white/70 rounded-xl border border-blue-100">
                    <MdSettings className="mr-2.5 text-xl text-blue-600" />
                    Account Settings
                  </h4>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-3 w-4.5 h-4.5 accent-blue-600"
                      />
                      <span className="font-medium text-gray-700 flex items-center">
                        <MdCheckCircle className="mr-1.5 text-base text-green-600 flex-shrink-0" />
                        Account Active
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.isEmailVerified}
                        onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                        className="mr-3 w-4.5 h-4.5 accent-blue-600"
                      />
                      <span className="font-medium text-gray-700 flex items-center">
                        <MdEmail className="mr-1.5 text-base text-blue-600 flex-shrink-0" />
                        Email Verified
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.isPhoneVerified}
                        onChange={(e) => setFormData({ ...formData, isPhoneVerified: e.target.checked })}
                        className="mr-3 w-4.5 h-4.5 accent-blue-600"
                      />
                      <span className="font-medium text-gray-700 flex items-center">
                        <MdPhone className="mr-1.5 text-base text-blue-600 flex-shrink-0" />
                        Phone Verified
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-5 mt-10 pt-8 border-t-2 border-gray-200 justify-end bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl">
              <button
                onClick={onClose}
                disabled={isPending}
                className="px-7 py-3.5 border-2 border-gray-300 rounded-xl bg-white text-gray-700 font-semibold text-sm cursor-pointer transition-all duration-300 shadow-sm hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdCancel className="mr-1.5 text-base" />
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={isPending}
                className={`px-7 py-3.5 border-none rounded-xl text-white font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-md hover:-translate-y-0.5 hover:shadow-lg ${
                  isPending 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {editingUser ? (
                      <>
                        <MdSave className="mr-1.5 text-base" />
                        Update {context === 'settings' ? 'Moderator' : 'User'}
                      </>
                    ) : (
                      <>
                        <MdAdd className="mr-1.5 text-base" />
                        Add {context === 'settings' ? 'Moderator' : 'User'}
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserModal;
