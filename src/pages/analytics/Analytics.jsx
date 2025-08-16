import React from 'react';
import { useAnalytics } from '../../contexts/analytics/AnalyticsContext';

const Analytics = () => {
  const {
    attendanceStats,
    taskStats,
    userStats,
    isLoading,
    error,
    refreshAllStats
  } = useAnalytics();

  const MetricCard = ({ title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <div className={`w-4 h-4 bg-${color}-600 rounded`}></div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Analytics Dashboard</h1>
        <button
          onClick={refreshAllStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Attendance Rate"
          value={`${attendanceStats.attendanceRate || 0}%`}
          subtitle="This month"
          color="green"
        />
        <MetricCard
          title="Task Completion"
          value={`${taskStats.completionRate || 0}%`}
          subtitle="Overall"
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value={userStats.activeUsers || 0}
          subtitle="Currently online"
          color="yellow"
        />
        <MetricCard
          title="Average Hours"
          value={attendanceStats.averageHours || 0}
          subtitle="Per day"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Attendance Overview">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Check-ins</span>
              <span className="font-semibold">{attendanceStats.totalCheckIns || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Check-outs</span>
              <span className="font-semibold">{attendanceStats.totalCheckOuts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Late arrivals</span>
              <span className="font-semibold text-yellow-600">{attendanceStats.lateArrivals || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overtime hours</span>
              <span className="font-semibold text-blue-600">{attendanceStats.overtimeHours || 0}</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Task Statistics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total tasks</span>
              <span className="font-semibold">{taskStats.totalTasks || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{taskStats.completedTasks || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{taskStats.pendingTasks || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">{taskStats.overdueTasks || 0}</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* User Activity */}
      <ChartCard title="User Activity">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total users</span>
            <span className="font-semibold">{userStats.totalUsers || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active users</span>
            <span className="font-semibold text-green-600">{userStats.activeUsers || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">New users</span>
            <span className="font-semibold text-blue-600">{userStats.newUsers || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Activity rate</span>
            <span className="font-semibold">{userStats.userActivityRate || 0}%</span>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default Analytics; 