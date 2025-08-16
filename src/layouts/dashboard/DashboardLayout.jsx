import React from 'react';

const Sidebar = () => (
  <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4">
    <div className="text-2xl font-bold mb-8 text-blue-600 dark:text-blue-400">Smart Attendance</div>
    <nav className="flex-1 space-y-2">
      <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Dashboard</a>
      <a href="/attendance" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Attendance</a>
      <a href="/tasks" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Tasks</a>
      <a href="/projects" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Projects</a>
      <a href="/users" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Users</a>
      <a href="/analytics" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Analytics</a>
      <a href="/reports" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Reports</a>
      <a href="/settings" className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Settings</a>
    </nav>
  </aside>
);

const Header = () => (
  <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 justify-between">
    <div className="font-semibold text-lg">Dashboard</div>
    <div className="flex items-center gap-4">
      {/* Add user avatar, notifications, theme toggle, etc. here */}
    </div>
  </header>
);

const DashboardLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  </div>
);

export default DashboardLayout;