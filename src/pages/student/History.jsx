import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { examAPI, userAPI } from '../../services/api';
import { FiBarChart, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentHistory = () => {
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Fetch exam history
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['examHistory', currentPage, limit, filterStatus],
    queryFn: () => examAPI.getUserExamHistory({
      page: currentPage,
      limit,
      status: filterStatus === 'all' ? undefined : filterStatus
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user exam statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['userExamStats'],
    queryFn: () => userAPI.getUserExamStats(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch exam categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['examCategories'],
    queryFn: () => examAPI.getExamCategories(),
    staleTime: 30 * 60 * 1000,
  });

  // Handle errors
  useEffect(() => {
    if (historyError) {
      console.error('❌ History Error:', historyError);
      toast.error('Failed to load exam history');
    }
    if (statsError) {
      console.error('❌ Stats Error:', statsError);
      toast.error('Failed to load exam statistics');
    }
  }, [historyError, statsError]);

  // Extract data
  const attempts = historyData?.data?.data?.attempts || [];
  const pagination = historyData?.data?.data?.pagination || {};
  const stats = statsData?.data?.data?.stats || {};
  const categories = categoriesData?.data?.data || [];



  // Filter attempts
  const filteredAttempts = attempts.filter(attempt => {
    const matchesSubject = filterSubject === 'all' || 
      attempt.exam?.examCategory?.name === filterSubject;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'passed' ? attempt.isPassed : !attempt.isPassed);
    return matchesSubject && matchesStatus;
  });

  // Calculate statistics
  const totalAttempts = stats.totalAttempts || 0;
  const passedAttempts = stats.passedAttempts || 0;
  const averageScore = stats.averagePercentage || 0;
  const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (isPassed) => {
    return isPassed ? 'status-active' : 'status-inactive';
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Event handlers
  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const handleRetake = (examId) => window.location.href = `/exam/${examId}`;
  const handleViewDetails = (attemptId) => window.location.href = `/exam/results/${attemptId}`;

  if (historyLoading || statsLoading) {
    return (
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Test History & Analytics
          </h1>
          <p style={{ color: '#64748b' }}>
            View your past test results and performance analytics
          </p>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading your test analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
          Test History & Analytics
        </h1>
        <p style={{ color: '#64748b' }}>
          View your past test results and performance analytics
        </p>
      </div>

      {/* Enhanced Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Total Tests</div>
            <div className="card-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="card-value">{totalAttempts}</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Tests completed
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Average Score</div>
            <div className="card-icon green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="card-value">{averageScore.toFixed(1)}%</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Overall performance
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Pass Rate</div>
            <div className="card-icon purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="card-value">{passRate.toFixed(1)}%</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Success rate
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Certificates</div>
            <div className="card-icon orange">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="card-value">{stats.certificates || 0}</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Earned certificates
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="data-table" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <div className="table-title">Filters</div>
          <div className="table-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => refetchHistory()}
              style={{ marginRight: '0.5rem' }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Subject/Category</label>
            <select 
              className="form-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test History Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="table-title">
            Test Results ({filteredAttempts.length} of {pagination.total || 0})
          </div>
          <div className="table-actions">
            <button className="btn btn-secondary">Export Results</button>
          </div>
        </div>
        
        {filteredAttempts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              <FiBarChart size={48} style={{ color: 'var(--secondary-400)' }} />
            </div>
            <h3>No test results found</h3>
            <p>You haven't taken any tests yet or no results match your filters.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.href = '/student/tests'}
              style={{ marginTop: '1rem' }}
            >
              Browse Available Tests
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Questions</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((attempt) => {
                    const exam = attempt.exam;
                    const examScore = attempt.examScore;
                    const category = exam?.examCategory;
                    
                    return (
                      <tr key={attempt.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>
                            {exam?.title || 'Unknown Exam'}
                          </div>
                          {exam?.description && (
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {exam.description.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {category?.icon && <span>{category.icon}</span>}
                            <span>{category?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '700', 
                            color: getScoreColor(attempt.percentage || 0)
                          }}>
                            {attempt.percentage || 0}%
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            {examScore?.correctAnswers || 0}/{examScore?.totalQuestions || exam?.totalQuestions || 0}
                          </div>
                          {examScore?.grade && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#8b5cf6',
                              fontWeight: '600'
                            }}>
                              Grade: {examScore.grade}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{examScore?.totalQuestions || exam?.totalQuestions || 0}</div>
                          {examScore && (
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {examScore.unanswered || 0} unanswered
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{formatDate(attempt.completedAt || attempt.createdAt)}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            {attempt.status}
                          </div>
                        </td>
                        <td>
                          <div>{formatDuration(exam?.duration)}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Taken: {formatDuration(examScore?.totalTimeSpent || attempt.timeSpent)}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(attempt.isPassed)}`}>
                            {attempt.isPassed ? 'Passed' : 'Failed'}
                          </span>
                          {attempt.certificate && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                              <FiAward size={12} />
                              Certificate earned
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                              onClick={() => handleViewDetails(attempt.id)}
                            >
                              View Details
                            </button>
                            {exam?.allowRetakes && (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                onClick={() => handleRetake(exam.id)}
                              >
                                Retake
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <button 
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                
                <span style={{ color: '#64748b' }}>
                  Page {currentPage} of {pagination.pages}
                </span>
                
                <button 
                  className="btn btn-secondary"
                  disabled={currentPage === pagination.pages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentHistory; 