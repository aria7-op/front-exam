import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { examAPI, categoryAPI } from '../../services/api';
import { FiTarget, FiAlertTriangle, FiFileText, FiCalendar } from 'react-icons/fi';

const StudentTests = () => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Fetch available exams
  const {
    data: examsData,
    isLoading: examsLoading,
    error: examsError
  } = useQuery({
    queryKey: ['available-exams'],
    queryFn: () => {
      console.log('🔍 Fetching available exams...');
      return examAPI.getAvailableExams();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  console.log('StudentTests Component Debug:', {
    examsData,
    examsLoading,
    examsError,
    exams: examsData?.data?.exams || []
  });

  // Fetch categories for filter options
  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['exam-categories'],
    queryFn: () => {
      console.log('🔍 Fetching exam categories...');
      return categoryAPI.getAllCategories();
    },
  });

  console.log('Categories Debug:', {
    categoriesData,
    categoriesLoading,
    categories: categoriesData?.data?.data || []
  });

  // Extract data from API responses
  const tests = examsData?.data?.exams || [];
  const categories = categoriesData?.data?.data || [];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredTests = tests.filter(test =>
    (filterCategory === 'all' || test.examCategory?.name === filterCategory) &&
    (filterDifficulty === 'all' || getDifficulty(test.totalMarks) === filterDifficulty)
  );

  // Add difficulty based on totalMarks for display purposes
  const getDifficulty = (totalMarks) => {
    if (totalMarks <= 5) return 'Beginner';
    if (totalMarks <= 8) return 'Intermediate';
    return 'Advanced';
  };

  // Handle loading state
  if (examsLoading || categoriesLoading) {
    return (
      <div>
        <div className="data-table-container">
          <div className="data-table-header">
            <h2 className="data-table-title">Available Tests</h2>
          </div>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>Loading available tests...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (examsError) {
    return (
      <div>
        <div className="data-table-container">
          <div className="data-table-header">
            <h2 className="data-table-title">Available Tests</h2>
          </div>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>Error loading available tests. Please try again later.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Available Tests</h2>
          <div className="data-table-actions">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredTests.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>No tests are currently available for the selected filters.</p>
            <p>Check back later or try different filter options.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', padding: '24px' }}>
            {filteredTests.map((test) => (
              <div key={test.id} style={{
                background: 'white',
                border: '1px solid var(--secondary-200)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow)',
                transition: 'var(--transition-normal)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--secondary-900)', margin: 0 }}>
                    {test.title}
                  </h3>
                  <span className={`badge ${
                    getDifficulty(test.totalMarks) === 'Advanced' ? 'badge-danger' :
                    getDifficulty(test.totalMarks) === 'Intermediate' ? 'badge-warning' : 'badge-success'
                  }`}>
                    {getDifficulty(test.totalMarks)}
                  </span>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <span className="badge badge-secondary" style={{ marginRight: '8px' }}>
                    {test.examCategory?.name || 'Unknown'}
                  </span>
                  <span className="badge badge-info">
                    ${test.price || 0}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: 'var(--secondary-600)', marginBottom: '4px' }}>
                      Duration
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary-900)' }}>
                      {test.duration || 0} min
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: 'var(--secondary-600)', marginBottom: '4px' }}>
                      Questions
                    </div>
                                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary-900)' }}>
                    {test.totalMarks || 0}
                  </div>
                  </div>
                </div>

                {/* Attempts Information */}
                {test.attemptsInfo && (
                  <div style={{ 
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: test.attemptsInfo.canTakeExam ? 'var(--success-50)' : 'var(--danger-50)',
                    border: `1px solid ${test.attemptsInfo.canTakeExam ? 'var(--success-200)' : 'var(--danger-200)'}`
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500',
                        color: test.attemptsInfo.canTakeExam ? 'var(--success-700)' : 'var(--danger-700)'
                      }}>
                        🎯 Attempts: {test.attemptsInfo.attemptsUsed}/{test.attemptsInfo.attemptsAllowed}
                      </span>
                      {test.attemptsInfo.hasBooking && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--secondary-500)',
                          backgroundColor: 'var(--secondary-100)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          Booked
                        </span>
                      )}
                    </div>
                    {!test.attemptsInfo.canTakeExam && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--danger-600)',
                        fontStyle: 'italic'
                      }}>
                        ⚠️ No more attempts allowed
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  {test.attemptsInfo && !test.attemptsInfo.canTakeExam ? (
                    <button 
                      className="btn btn-danger" 
                      style={{ flex: 1 }}
                      disabled
                      title="No more attempts allowed"
                    >
                      ❌ Attempts Exceeded
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1 }}
                      onClick={() => window.location.href = `/exam/${test.id}`}
                    >
                      📝 Start Test
                    </button>
                  )}
                  <button className="btn btn-secondary">
                    📅 Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTests; 