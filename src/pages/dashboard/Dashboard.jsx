import React from 'react';

const Dashboard = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-300">Welcome to Smart Attendance System</h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">AI-powered attendance, task tracking, and workforce analytics at your fingertips.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-green-500">96%</span>
          <span className="text-gray-600 dark:text-gray-300">Attendance Rate</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-500">84</span>
          <span className="text-gray-600 dark:text-gray-300">Active Tasks</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-yellow-500">23</span>
          <span className="text-gray-600 dark:text-gray-300">Active Users</span>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 shadow text-center">
        <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-300">Get Started</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Use the sidebar to navigate to Attendance, Tasks, Analytics, and more. Your smart dashboard will update in real time as you use the system.</p>
      </div>
    </div>
  );
};

export default Dashboard;