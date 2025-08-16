import React from 'react';

const ErrorLayout = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-200 dark:from-gray-900 dark:to-gray-800">
    <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800 animate-fade-in">
      {children}
    </div>
  </div>
);

export default ErrorLayout;