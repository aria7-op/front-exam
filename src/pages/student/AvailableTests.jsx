import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { examAPI, categoryAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import BillModal from '../../components/BillModal';
import { FiTarget, FiBarChart } from 'react-icons/fi';

const AvailableTests = () => {
  console.log('AvailableTests Component - RENDERING');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log('AvailableTests Component - User:', user);
  console.log('AvailableTests Component - User role:', user?.role);
  console.log('AvailableTests Component - User ID:', user?.id);
  console.log('AvailableTests Component - User enabled condition:', !!user);
  const queryClient = useQueryClient();
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showBill, setShowBill] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

  // Fetch user's booked tests
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError
  } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: () => {
      console.log('🔍 Fetching user bookings...');
      console.log('🔍 Current user:', user);
      console.log('🔍 Auth token exists:', !!localStorage.getItem('token'));
      const result = bookingAPI.getMyBookings();
      console.log('🔍 API call result:', result);
      return result;
    },
    enabled: !!user, // Only run query if user is authenticated
    refetchInterval: 60000, // Refetch every minute
  });

  console.log('AvailableTests Component Debug:', {
    bookingsData,
    bookingsLoading,
    bookingsError,
    bookings: bookingsData?.data?.data?.bookings || []
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

  console.log('Bookings Debug:', {
    bookingsData,
    bookingsLoading,
    bookingsError,
    bookings: bookingsData?.data?.data?.bookings || []
  });
  
  console.log('🔍 Full bookingsData object:', bookingsData);
  console.log('🔍 bookingsData.data:', bookingsData?.data);
  console.log('🔍 bookingsData.data?.bookings:', bookingsData?.data?.bookings);

  // Extract data from API responses
  const bookings = bookingsData?.data?.data?.bookings || [];
  
  console.log('🔍 Extracted bookings:', bookings);
  console.log('🔍 Bookings length:', bookings.length);
  console.log('🔍 First booking:', bookings[0]);
  const categories = categoriesData?.data?.data || [];

  // Debug logging
  console.log('AvailableTests state:', {
    bookingsCount: bookings.length
  });

  // Handle bill display
  const handleShowBill = (bill) => {
    setCurrentBill(bill);
    setShowBill(true);
  };

  const handleCloseBill = () => {
    setShowBill(false);
    setCurrentBill(null);
  };

  // Filter tests based on selected criteria
  const filteredTests = bookings.filter(booking => {
    const test = booking.exam;
    if (!test) return false;
    
    const subjectMatch = filterSubject === 'all' || test.examCategory?.name === filterSubject;
    const difficultyMatch = filterDifficulty === 'all' || test.difficulty === filterDifficulty;
    
    return subjectMatch && difficultyMatch;
  });

  // Get unique subjects for filter
  const uniqueSubjects = [...new Set(bookings.map(booking => booking.exam?.examCategory?.name).filter(Boolean))];
  const uniqueDifficulties = [...new Set(bookings.map(booking => booking.exam?.difficulty).filter(Boolean))];

  if (bookingsLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '1rem' }}>Loading your tests...</div>
        <div style={{ color: '#94a3b8' }}>Please wait while we fetch your scheduled exams.</div>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem' }}>Error loading tests</div>
        <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>Failed to load your scheduled exams.</div>
        <button 
          onClick={() => queryClient.invalidateQueries(['user-bookings'])}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
          My Available Tests
        </h1>
        <p style={{ color: '#64748b' }}>
          View and manage your scheduled exam bookings
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
            Subject
          </label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
            Difficulty
          </label>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="all">All Difficulties</option>
            {uniqueDifficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {filteredTests.length} of {bookings.length} tests
          </span>
        </div>
      </div>

      {/* No tests message */}
      {filteredTests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No tests available
          </h3>
          <p style={{ color: '#64748b' }}>
            Contact your administrator to schedule a test for you.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {filteredTests.map((booking) => {
            const test = booking.exam;
            return (
              <div key={booking.id} className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                      {test.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                      {test.description || 'No description available'}
                    </p>
                  </div>
                  <span className={`status-badge ${
                    test.difficulty === 'Advanced' ? 'status-active' :
                    test.difficulty === 'Intermediate' ? 'status-pending' : 'status-inactive'
                  }`}>
                    {test.difficulty || 'Not specified'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Subject</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{test.examCategory?.name || 'Unknown'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Duration</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{test.duration || 0} min</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Questions</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{test.questionCount || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Status</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: booking.status === 'COMPLETED' ? '#dcfce7' :
                                      booking.status === 'CONFIRMED' ? '#dbeafe' :
                                      booking.status === 'PENDING' ? '#fef3c7' :
                                      booking.status === 'CANCELLED' ? '#fee2e2' : '#f3f4f6',
                        color: booking.status === 'COMPLETED' ? '#166534' :
                             booking.status === 'CONFIRMED' ? '#1e40af' :
                             booking.status === 'PENDING' ? '#92400e' :
                             booking.status === 'CANCELLED' ? '#991b1b' : '#374151',
                        border: `1px solid ${
                          booking.status === 'COMPLETED' ? '#bbf7d0' :
                          booking.status === 'CONFIRMED' ? '#bfdbfe' :
                          booking.status === 'PENDING' ? '#fde68a' :
                          booking.status === 'CANCELLED' ? '#fecaca' : '#d1d5db'
                        }`
                      }}>
                        {booking.status === 'COMPLETED' ? '✅ COMPLETED' :
                         booking.status === 'CONFIRMED' ? '✅ CONFIRMED' :
                         booking.status === 'PENDING' ? '⏳ PENDING' :
                         booking.status === 'CANCELLED' ? '❌ CANCELLED' : booking.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Scheduled</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString() : 'Not scheduled'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Price</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {test.currency} {test.price}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  {/* Scheduling Status Badge */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '8px' 
                  }}>
                    {(() => {
                      if (!booking.scheduledAt) {
                        return (
                          <span style={{
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            border: '1px solid #d1d5db'
                          }}>
                            ⏳ Not Scheduled
                          </span>
                        );
                      }
                      
                      const now = new Date();
                      const scheduledTime = new Date(booking.scheduledAt);
                      const timeDiff = scheduledTime.getTime() - now.getTime();
                      const minutesDiff = timeDiff / (1000 * 60);
                      
                      if (minutesDiff > 5) {
                        return (
                          <span style={{
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            border: '1px solid #fbbf24'
                          }}>
                            ⏰ Scheduled for {scheduledTime.toLocaleString()}
                          </span>
                        );
                      } else if (minutesDiff < -120) {
                        return (
                          <span style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            border: '1px solid #f87171'
                          }}>
                            ❌ Expired
                          </span>
                        );
                      } else {
                        return (
                          <span style={{
                            backgroundColor: '#d1fae5',
                            color: '#059669',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            border: '1px solid #34d399'
                          }}>
                            ✅ Ready to Start
                          </span>
                        );
                      }
                    })()}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        console.log('Button clicked for test:', test.title);
                        console.log('Starting exam for booking:', booking.id);
                        console.log('Exam ID:', test.id);
                        
                        // Check if exam is scheduled and validate timing
                        if (!booking.scheduledAt) {
                          toast.error('This exam is not scheduled yet. Please wait for scheduling.');
                          return;
                        }
                        
                        const now = new Date();
                        const scheduledTime = new Date(booking.scheduledAt);
                        const timeDiff = scheduledTime.getTime() - now.getTime();
                        const minutesDiff = timeDiff / (1000 * 60);
                        
                        // Only allow starting 5 minutes before scheduled time
                        if (minutesDiff > 5) {
                          const remainingTime = Math.ceil(minutesDiff);
                          if (remainingTime > 60) {
                            const hours = Math.floor(remainingTime / 60);
                            const minutes = remainingTime % 60;
                            toast.error(`This exam is scheduled for ${scheduledTime.toLocaleString()}. Please wait ${hours}h ${minutes}m until the scheduled time.`);
                          } else {
                            toast.error(`This exam is scheduled for ${scheduledTime.toLocaleString()}. Please wait ${remainingTime} minutes until the scheduled time.`);
                          }
                          return;
                        }
                        
                        // Check if exam is too old (more than 2 hours after scheduled time)
                        if (minutesDiff < -120) {
                          toast.error('This exam was scheduled more than 2 hours ago. Please contact your administrator.');
                          return;
                        }
                        
                        // Navigate to exam interface
                        navigate(`/exam/${test.id}`);
                      }}
                      style={{
                        opacity: (() => {
                          if (!booking.scheduledAt) return 0.5;
                          const now = new Date();
                          const scheduledTime = new Date(booking.scheduledAt);
                          const timeDiff = scheduledTime.getTime() - now.getTime();
                          const minutesDiff = timeDiff / (1000 * 60);
                          return (minutesDiff > 5 || minutesDiff < -120) ? 0.5 : 1;
                        })(),
                        cursor: (() => {
                          if (!booking.scheduledAt) return 'not-allowed';
                          const now = new Date();
                          const scheduledTime = new Date(booking.scheduledAt);
                          const timeDiff = scheduledTime.getTime() - now.getTime();
                          const minutesDiff = timeDiff / (1000 * 60);
                          return (minutesDiff > 5 || minutesDiff < -120) ? 'not-allowed' : 'pointer';
                        })()
                      }}
                    >
                      {(() => {
                        if (!booking.scheduledAt) return 'Not Scheduled';
                        const now = new Date();
                        const scheduledTime = new Date(booking.scheduledAt);
                        const timeDiff = scheduledTime.getTime() - now.getTime();
                        const minutesDiff = timeDiff / (1000 * 60);
                        
                        if (minutesDiff > 5) {
                          if (minutesDiff > 60) {
                            const hours = Math.floor(minutesDiff / 60);
                            const minutes = minutesDiff % 60;
                            return `Wait ${hours}h ${minutes}m`;
                          } else {
                            return `Wait ${Math.ceil(minutesDiff)}m`;
                          }
                        } else if (minutesDiff < -120) {
                          return 'Expired';
                        } else {
                          return 'Start Test';
                        }
                      })()}
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        // Generate bill for this booking
                        const bill = {
                          billNumber: `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          billDate: new Date(),
                          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                          booking: {
                            id: booking.id,
                            scheduledAt: booking.scheduledAt,
                            status: booking.status
                          },
                          exam: {
                            id: test.id,
                            title: test.title,
                            description: test.description,
                            category: test.examCategory?.name || 'Unknown',
                            duration: test.duration,
                            totalMarks: test.totalMarks
                          },
                          customer: {
                            id: user.id,
                            name: `${user.firstName} ${user.lastName}`,
                            email: user.email
                          },
                          amount: {
                            subtotal: test.price || 0,
                            tax: 0,
                            total: test.price || 0,
                            currency: test.currency || 'USD'
                          },
                          payment: null,
                          status: 'PENDING'
                        };
                        handleShowBill(bill);
                      }}
                    >
                      📄 View Bill
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bill Modal */}
      {showBill && (
        <BillModal
          bill={currentBill}
          onClose={handleCloseBill}
          onPrint={() => {
            toast.success('Bill printed successfully!');
          }}
        />
      )}
    </div>
  );
};

export default AvailableTests; 