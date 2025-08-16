import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  MdPeople, 
  MdAssignment, 
  MdQuestionMark, 
  MdBarChart, 
  MdAttachMoney 
} from 'react-icons/md';

const Analytics = () => {
  const { user: currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminAPI.getDashboardStats(),
    refetchInterval: 30000
  });

  // Fetch user analytics
  const { data: userAnalytics, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user-analytics'],
    queryFn: () => adminAPI.getUserAnalytics(),
    refetchInterval: 30000
  });

  // Fetch exam analytics
  const { data: examAnalytics, isLoading: examLoading } = useQuery({
    queryKey: ['admin-exam-analytics'],
    queryFn: () => adminAPI.getExamAnalytics(),
    refetchInterval: 30000
  });

  // Fetch question analytics
  const { data: questionAnalytics, isLoading: questionLoading } = useQuery({
    queryKey: ['admin-question-analytics'],
    queryFn: () => adminAPI.getQuestionAnalytics(),
    refetchInterval: 30000
  });

  // Fetch system analytics
  const { data: systemAnalytics, isLoading: systemLoading } = useQuery({
    queryKey: ['admin-system-analytics'],
    queryFn: () => adminAPI.getSystemAnalytics(),
    refetchInterval: 30000,
    enabled: ['SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role)
  });

  // Extract data from API responses
  const stats = dashboardStats?.data?.overview || {};
  const userStats = userAnalytics?.data || {};
  const examStats = examAnalytics?.data || {};
  const questionStats = questionAnalytics?.data || {};
  const systemStats = systemAnalytics?.data || {};

  // Debug logging
  console.log('Analytics Data:', {
    dashboardStats: dashboardStats?.data,
    userAnalytics: userAnalytics?.data,
    examAnalytics: examAnalytics?.data,
    questionAnalytics: questionAnalytics?.data,
    systemAnalytics: systemAnalytics?.data
  });

  const isLoading = statsLoading || userLoading || examLoading || questionLoading || systemLoading;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--secondary-600)' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Analytics Dashboard</h2>
          <div className="data-table-actions">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px'
              }}
            >
              <option value="all">All Categories</option>
              <option value="users">Users</option>
              <option value="exams">Exams</option>
              <option value="questions">Questions</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Users</div>
            <div className="dashboard-card-icon primary">
              <MdPeople style={{ fontSize: '24px', color: 'var(--primary-600)' }} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalUsers || 0}</div>
          <div className="dashboard-card-description">
            {userStats.totalUsers || 0} total users
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Exams</div>
            <div className="dashboard-card-icon success">
              <MdAssignment style={{ fontSize: '24px', color: 'var(--success-600)' }} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalExams || 0}</div>
          <div className="dashboard-card-description">
            {examStats.activeExams || 0} active exams
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Questions</div>
            <div className="dashboard-card-icon warning">
              <MdQuestionMark style={{ fontSize: '24px', color: 'var(--warning-600)' }} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalQuestions || 0}</div>
          <div className="dashboard-card-description">
            {questionStats.totalQuestions || 0} total questions
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Attempts</div>
            <div className="dashboard-card-icon danger">
              <MdBarChart style={{ fontSize: '24px', color: 'var(--danger-600)' }} />
            </div>
          </div>
          <div className="dashboard-card-value">{stats.totalAttempts || 0}</div>
          <div className="dashboard-card-description">
            {examStats.totalAttempts || 0} total attempts
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">Total Revenue</div>
            <div className="dashboard-card-icon info">
              <MdAttachMoney style={{ fontSize: '24px', color: 'var(--info-600)' }} />
            </div>
          </div>
          <div className="dashboard-card-value">${stats.totalRevenue || 0}</div>
          <div className="dashboard-card-description">
            Total revenue generated
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* User Analytics */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">User Analytics</h3>
          </div>
          <div className="chart-content">
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary-600)' }}>
                    {userStats.totalUsers || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Total Users</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--success-600)' }}>
                    {userStats.activeUsers || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Active Users</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--warning-600)' }}>
                    {userStats.newUsers || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>New Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Analytics */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Exam Analytics</h3>
          </div>
          <div className="chart-content">
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary-600)' }}>
                    {examStats.totalExams || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Total Exams</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--success-600)' }}>
                    {examStats.activeExams || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Active Exams</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--warning-600)' }}>
                    {examStats.averageScore || 0}%
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Average Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--danger-600)' }}>
                    {examStats.passRate || 0}%
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Pass Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="chart-container" style={{ marginBottom: '32px' }}>
        <div className="chart-header">
          <h3 className="chart-title">Performance Metrics</h3>
        </div>
        <div className="chart-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--secondary-200)' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary-600)' }}>
                {examStats.averageCompletionTime || 0} min
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Avg Completion Time</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--secondary-200)' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--success-600)' }}>
                {examStats.passRate || 0}%
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Pass Rate</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--secondary-200)' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--warning-600)' }}>
                {questionStats.averageMarks || 0}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Avg Question Marks</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--secondary-200)' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--danger-600)' }}>
                {examStats.abandonmentRate || 0}%
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Abandonment Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Statistics */}
      <div className="chart-container" style={{ marginBottom: '32px' }}>
        <div className="chart-header">
          <h3 className="chart-title">Question Statistics</h3>
        </div>
        <div className="chart-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>Questions by Difficulty</h4>
              {questionStats.questionsByDifficulty ? (
                Object.entries(questionStats.questionsByDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--secondary-700)' }}>{difficulty}</span>
                    <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{count}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--secondary-600)', textAlign: 'center', padding: '20px' }}>
                  No difficulty data available
                </div>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--secondary-900)' }}>Questions by Type</h4>
              {questionStats.questionsByType ? (
                Object.entries(questionStats.questionsByType).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--secondary-700)' }}>{type.replace('_', ' ')}</span>
                    <span style={{ fontWeight: '600', color: 'var(--success-600)' }}>{count}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--secondary-600)', textAlign: 'center', padding: '20px' }}>
                  No type data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="chart-container" style={{ marginBottom: '32px' }}>
        <div className="chart-header">
          <h3 className="chart-title">Category Statistics</h3>
        </div>
        <div className="chart-content">
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
            {dashboardStats?.data?.analytics?.categoryStats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {dashboardStats.data.analytics.categoryStats.map((category, index) => (
                  <div key={index} style={{ textAlign: 'center', padding: '12px', border: '1px solid var(--secondary-200)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary-600)' }}>
                      {category.name}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--secondary-600)', marginTop: '4px' }}>
                      {category.examCount} exams, {category.questionCount} questions
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--secondary-600)', textAlign: 'center', padding: '20px' }}>
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Recent Activity</h3>
        </div>
        <div className="chart-content">
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--secondary-200)' }}>
            {dashboardStats?.data?.recent?.attempts ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {dashboardStats.data.recent.attempts.slice(0, 10).map((attempt, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 0',
                    borderBottom: index < Math.min(dashboardStats.data.recent.attempts.length, 10) - 1 ? '1px solid var(--secondary-200)' : 'none'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{attempt.user?.firstName} {attempt.user?.lastName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>{attempt.exam?.title}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '500', color: 'var(--primary-600)' }}>{attempt.percentage}%</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>
                        {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : examStats.recentAttempts ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {examStats.recentAttempts.map((attempt, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 0',
                    borderBottom: index < examStats.recentAttempts.length - 1 ? '1px solid var(--secondary-200)' : 'none'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{attempt.userName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>{attempt.examTitle}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '500', color: 'var(--primary-600)' }}>{attempt.score}%</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--secondary-600)', padding: '20px' }}>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Analytics (Admin Only) */}
      {['SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role) && systemStats && (
        <div className="chart-container" style={{ marginTop: '32px' }}>
          <div className="chart-header">
            <h3 className="chart-title">System Analytics</h3>
          </div>
          <div className="chart-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--secondary-200)' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--info-600)' }}>
                  {systemStats.uptime || 0}%
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>System Uptime</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--secondary-200)' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--purple-600)' }}>
                  {systemStats.avgResponseTime || 0}ms
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Avg Response Time</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--secondary-200)' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--success-600)' }}>
                  {systemStats.successRate || 0}%
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 