import React from 'react';

const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800">
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800 animate-fade-in">
      <div className="mb-6 text-center">
        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">Smart Attendance</span>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;