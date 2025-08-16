import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsAPI, adminAPI, categoryAPI, userAPI, examAPI, questionAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';
import { 
  FiBook, 
  FiFileText, 
  FiUsers, 
  FiHelpCircle, 
  FiCalendar, 
  FiBarChart2,
  FiUser,
  FiCheck,
  FiTrendingUp,
  FiDollarSign,
  FiLogIn,
  FiLogOut,
  FiPlay,
  FiFlag,
  FiClock,
  FiEdit,
  FiEye,
  FiActivity
} from 'react-icons/fi';

// Modern reusable modal component
function ModernModal({ open, onClose, title, icon, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', transition: 'background 0.3s' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
        borderRadius: '1.5rem',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        border: '1.5px solid #e5e7eb',
        width: '100%',
        maxWidth: 420,
        padding: 36,
        position: 'relative',
        margin: '0 16px',
        animation: 'fadeInModal 0.3s',
        transition: 'box-shadow 0.2s, border 0.2s',
        // Responsive maxWidth for desktop
        ...(window.innerWidth >= 1024 ? { maxWidth: 600 } : {})
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            color: '#64748b',
            background: 'rgba(243,244,246,0.7)',
            border: 'none',
            fontSize: 28,
            cursor: 'pointer',
            lineHeight: 1,
            borderRadius: '50%',
            width: 38,
            height: 38,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#e0e7ef'; e.currentTarget.style.color = '#1e293b'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(243,244,246,0.7)'; e.currentTarget.style.color = '#64748b'; }}
          aria-label="Close"
        >
          &times;
        </button>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {icon}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>{title}</h2>
          </div>
        )}
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [realTimeActivities, setRealTimeActivities] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view' | 'edit' | 'insert'
  const [selectedTest, setSelectedTest] = useState(null);
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);

  // WebSocket event handlers for real-time updates
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Handle exam attempts
    const handleExamAttemptStarted = (data) => {
      queryClient.invalidateQueries(['dashboard-stats']);
      setRealTimeActivities(prev => [{
        id: Date.now(),
        type: 'exam_attempt_started',
        message: `Exam attempt started by ${data.userName}`,
        time: 'Just now',
        user: data.userName
      }, ...prev.slice(0, 9)]);
    };

    const handleExamAttemptCompleted = (data) => {
      queryClient.invalidateQueries(['dashboard-stats']);
      setRealTimeActivities(prev => [{
        id: Date.now(),
        type: 'exam_attempt_completed',
        message: `Exam completed by ${data.userName}`,
        time: 'Just now',
        user: data.userName
      }, ...prev.slice(0, 9)]);
    };

    // Handle bookings
    const handleBookingCreated = (data) => {
      queryClient.invalidateQueries(['dashboard-stats']);
      setRealTimeActivities(prev => [{
        id: Date.now(),
        type: 'booking_created',
        message: `New booking created by ${data.userName}`,
        time: 'Just now',
        user: data.userName
      }, ...prev.slice(0, 9)]);
    };

    // Handle payments
    const handlePaymentProcessed = (data) => {
      queryClient.invalidateQueries(['dashboard-stats']);
      setRealTimeActivities(prev => [{
        id: Date.now(),
        type: 'payment_processed',
        message: `Payment processed: $${data.amount}`,
        time: 'Just now',
        user: data.userName
      }, ...prev.slice(0, 9)]);
    };

    // Handle user activity
    const handleUserLogin = (data) => {
      setRealTimeActivities(prev => [{
        id: Date.now(),
        type: 'user_login',
        message: `${data.userName} logged in`,
        time: 'Just now',
        user: data.userName
      }, ...prev.slice(0, 9)]);
    };

    const handleUserLogout = (data) => {
      setRealTimeActivities(prev => [{
        id: Date.now(),
        type: 'user_logout',
        message: `${data.userName} logged out`,
        time: 'Just now',
        user: data.userName
      }, ...prev.slice(0, 9)]);
    };

    // Set up event listeners
    socketService.onExamAttemptStarted(handleExamAttemptStarted);
    socketService.onExamAttemptCompleted(handleExamAttemptCompleted);
    socketService.onBookingCreated(handleBookingCreated);
    socketService.onPaymentProcessed(handlePaymentProcessed);
    socketService.onUserLogin(handleUserLogin);
    socketService.onUserLogout(handleUserLogout);

    // Cleanup event listeners
    return () => {
      socketService.offExamAttemptStarted(handleExamAttemptStarted);
      socketService.offExamAttemptCompleted(handleExamAttemptCompleted);
      socketService.offBookingCreated(handleBookingCreated);
      socketService.offPaymentProcessed(handlePaymentProcessed);
      socketService.offUserLogin(handleUserLogin);
      socketService.offUserLogout(handleUserLogout);
    };
  }, [isAuthenticated, user, queryClient]);

  // Fetch data from APIs
  const { data: categoriesData, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminAPI.getAllCategories(),
  });

  const { data: usersData, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => adminAPI.getAllUsers(),
  });

  const { data: examsData, error: examsError } = useQuery({
    queryKey: ['exams'],
    queryFn: () => adminAPI.getAllExams(),
  });

  const { data: questionsData, error: questionsError } = useQuery({
    queryKey: ['questions'],
    queryFn: () => adminAPI.getAllQuestions(),
  });

  // Fetch only active exams to get an accurate total via pagination
  const { data: activeExamsData } = useQuery({
    queryKey: ['exams', 'active-count'],
    queryFn: () => adminAPI.getAllExams({ isActive: true, page: 1, limit: 1 }),
    staleTime: 60 * 1000,
  });

  // Fetch upcoming exams for the Upcoming Tests section
  const { data: upcomingExamsData, isLoading: upcomingExamsLoading, error: upcomingExamsError } = useQuery({
    queryKey: ['upcoming-exams'],
    queryFn: () => adminAPI.getAllExams(),
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Debug upcoming exams data
  console.log('Upcoming Exams Data:', upcomingExamsData);
  console.log('Upcoming Exams Loading:', upcomingExamsLoading);
  console.log('Upcoming Exams Error:', upcomingExamsError);

  // Calculate stats from fetched data
  console.log('Categories Data:', categoriesData);
  console.log('Users Data:', usersData);
  console.log('Exams Data:', examsData);
  console.log('Questions Data:', questionsData);
  
  // Log any errors
  if (categoriesError) console.error('Categories Error:', categoriesError);
  if (usersError) console.error('Users Error:', usersError);
  if (examsError) console.error('Exams Error:', examsError);
  if (questionsError) console.error('Questions Error:', questionsError);
  
  // Use pagination total if provided; otherwise, support both array-in-data and categories[] shapes
  const totalCategories =
    categoriesData?.data?.data?.pagination?.total ??
    (Array.isArray(categoriesData?.data?.data?.categories)
      ? categoriesData.data.data.categories.length
      : Array.isArray(categoriesData?.data?.data)
        ? categoriesData.data.data.length
        : 0);
  const totalStudents = usersData?.data?.data?.users?.filter(user => user.role === 'STUDENT')?.length || 0;
  const activeTests = activeExamsData?.data?.data?.pagination?.total
    ?? examsData?.data?.data?.exams?.filter(exam => exam.isActive)?.length
    ?? 0;
  // Use pagination total to reflect the full Questions Bank count, not just the first page size
  const totalQuestions = questionsData?.data?.data?.pagination?.total
    ?? questionsData?.data?.data?.questions?.length
    ?? 0;

  console.log('Calculated Stats:', {
    totalCategories,
    totalStudents,
    activeTests,
    totalQuestions
  });

  // Stats array with real data
  const stats = [
    { id: 1, title: 'Total Categories', value: totalCategories.toString(), change: '+2', icon: FiBook, color: 'primary' },
    { id: 2, title: 'Active Tests', value: activeTests.toString(), change: '+8', icon: FiFileText, color: 'success' },
    { id: 3, title: 'Total Students', value: totalStudents.toString(), change: '+12', icon: FiUsers, color: 'warning' },
    { id: 4, title: 'Questions Bank', value: totalQuestions.toString(), change: '+45', icon: FiHelpCircle, color: 'danger' }
  ];

  // Combine real-time activities with static activities
  const recentActivities = [
    ...realTimeActivities,
    { id: 1, type: 'test_created', message: 'New JavaScript Test created', time: '2 hours ago', user: 'Admin' },
    { id: 2, type: 'student_registered', message: 'New student registered: John Doe', time: '4 hours ago', user: 'System' },
    { id: 3, type: 'test_completed', message: 'Mathematics Test completed by 15 students', time: '6 hours ago', user: 'System' },
    { id: 4, type: 'category_added', message: 'New category "Web Development" added', time: '1 day ago', user: 'Admin' },
    { id: 5, type: 'question_added', message: '50 new questions added to Programming category', time: '2 days ago', user: 'Admin' }
  ];

  // Transform upcoming exams data for the UI
  console.log('Raw upcomingExamsData:', upcomingExamsData);
  console.log('Data path check:', upcomingExamsData?.data?.data?.exams);
  
  // Transform upcoming exams data for the UI
  console.log('Raw upcomingExamsData:', upcomingExamsData);
  console.log('Data path check:', upcomingExamsData?.data?.data?.exams);
  
  const allExams = upcomingExamsData?.data?.data?.exams || [];
  
  // Filter exams to show only those waiting to start (scheduledStart in the future)
  const upcomingTests = allExams
    .filter(exam => {
      if (!exam.scheduledStart) return false;
      const startDate = new Date(exam.scheduledStart);
      const now = new Date();
      return startDate > now; // Only show exams that haven't started yet
    })
    .map(exam => ({
      id: exam.id,
      title: exam.title,
      category: exam.category?.name || 'Uncategorized',
      date: exam.scheduledStart ? new Date(exam.scheduledStart).toLocaleDateString() : 
           exam.scheduledEnd ? new Date(exam.scheduledEnd).toLocaleDateString() : 'TBD',
      time: exam.scheduledStart ? new Date(exam.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
            exam.scheduledEnd ? new Date(exam.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
      students: exam.totalAttempts || exam.attemptsCount || 0,
      status: exam.status,
      description: exam.description,
      duration: exam.duration,
      passingScore: exam.passingScore,
      maxAttempts: exam.maxAttempts,
      isPublic: exam.isPublic,
      price: exam.price,
      currency: exam.currency,
      scheduledStart: exam.scheduledStart // Keep original for sorting
    }))
    .sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart)) // Sort by start date
    .slice(0, 5); // Limit to 5 upcoming tests
  

  
  console.log('Total exams:', allExams.length);
  console.log('Exams waiting to start:', upcomingTests.length);
  console.log('Transformed upcomingTests:', upcomingTests);

  const quickActions = [
    { id: 1, title: 'Create New Test', description: 'Set up a new mock test', icon: FiFileText, action: () => navigate('/admin/tests'), color: 'primary' },
    { id: 2, title: 'Add Questions', description: 'Add questions to question bank', icon: FiHelpCircle, action: () => navigate('/admin/questions'), color: 'success' },
    { id: 3, title: 'Manage Categories', description: 'Create or edit test categories', icon: FiBook, action: () => navigate('/admin/categories'), color: 'warning' },
    { id: 4, title: 'Book Test', description: 'Schedule test for students', icon: FiCalendar, action: () => navigate('/admin/bookings'), color: 'danger' }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      test_created: FiFileText,
      student_registered: FiUser,
      test_completed: FiCheck,
      category_added: FiBook,
      question_added: FiHelpCircle,
      exam_attempt_started: FiPlay,
      exam_attempt_completed: FiFlag,
      booking_created: FiCalendar,
      payment_processed: FiDollarSign,
      user_login: FiLogIn,
      user_logout: FiLogOut
    };
    return icons[type] || FiBarChart2;
  };

  const getActivityColor = (type) => {
    const colors = {
      test_created: 'var(--primary-500)',
      student_registered: 'var(--success-500)',
      test_completed: 'var(--warning-500)',
      category_added: 'var(--danger-500)',
      question_added: 'var(--secondary-500)',
      exam_attempt_started: 'var(--info-500)',
      exam_attempt_completed: 'var(--success-500)',
      booking_created: 'var(--warning-500)',
      payment_processed: 'var(--success-500)',
      user_login: 'var(--primary-500)',
      user_logout: 'var(--secondary-500)'
    };
    return colors[type] || 'var(--secondary-500)';
  };

  // Don't render until authenticated
  if (!isAuthenticated || !user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Welcome back, {user?.firstName || 'Administrator'}! <span style={{fontSize: '32px'}}>👋</span>
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
            Here's what's happening with your mock test platform today
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="all">All Activities</option>
              <option value="tests">Tests Only</option>
              <option value="students">Students Only</option>
              <option value="categories">Categories Only</option>
            </select>
            
            <button 
              onClick={() => navigate('/admin/reports')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              <FiBarChart2 size={16} style={{ marginRight: '8px' }} />
              View Analytics
            </button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 1
        }}></div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="dashboard-card" style={{
            background: 'linear-gradient(135deg, white 0%, var(--secondary-50) 100%)',
            border: '2px solid var(--secondary-200)'
          }}>
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">{stat.title}</h3>
              <div className={`dashboard-card-icon ${stat.color}`} style={{
                fontSize: '32px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {React.createElement(stat.icon, { size: 32 })}
              </div>
            </div>
            <div className="dashboard-card-value" style={{ fontSize: '48px' }}>{stat.value}</div>
            <p className="dashboard-card-description" style={{ fontSize: '16px' }}>
              <span style={{ color: 'var(--success-600)', fontWeight: '600' }}>
                {stat.change}
              </span> from last month
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div
        className="grid gap-10 mb-10 sm:grid-cols-1 lg:grid-cols-[2fr_1fr]"
        style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '2fr 1fr', gap: '40px', marginBottom: '40px' }}
      >
        {/* Recent Activities */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          border: '2px solid var(--secondary-200)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--secondary-900)', margin: 0 }}>
              Recent Activities
            </h3>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 8, padding: '8px 16px', fontWeight: 600, fontSize: 15, borderRadius: 8, background: 'linear-gradient(90deg, #2563eb, #3b82f6)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 1px 4px #dbeafe' }}
              onClick={() => setActivitiesModalOpen(true)}
            >
              <FiEye style={{ marginRight: 6 }} /> View All
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivities.map((activity) => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'var(--secondary-50)',
                border: '1px solid var(--secondary-200)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: getActivityColor(activity.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white'
                }}>
                  {React.createElement(getActivityIcon(activity.type), { size: 20 })}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--secondary-900)', marginBottom: '4px' }}>
                    {activity.message}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--secondary-600)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiUser size={12} /> {activity.user}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock size={12} /> {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          border: '2px solid var(--secondary-200)'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '24px' }}>
            Quick Actions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  border: '2px solid var(--secondary-200)',
                  borderRadius: '16px',
                  backgroundColor: 'var(--secondary-50)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = 'var(--shadow-xl)';
                  e.target.style.borderColor = 'var(--primary-500)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--secondary-200)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `var(--${action.color}-500)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white'
                }}>
                  {React.createElement(action.icon, { size: 20 })}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '4px' }}>
                    {action.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--secondary-600)', margin: 0 }}>
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Tests */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)',
        border: '2px solid var(--secondary-200)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--secondary-900)', margin: 0 }}>
            Upcoming Tests
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {upcomingExamsLoading ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--secondary-600)',
              fontSize: '16px'
            }}>
              Loading upcoming tests...
            </div>
          ) : upcomingExamsError ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--danger-500)',
              fontSize: '16px'
            }}>
              Error loading upcoming tests. Please try again.
            </div>
          ) : upcomingTests.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--secondary-600)',
              fontSize: '16px'
            }}>
              No upcoming tests found.
            </div>
          ) : (
            upcomingTests.map((test) => (
            <div key={test.id} style={{
              padding: '24px',
              border: '2px solid var(--secondary-200)',
              borderRadius: '16px',
              backgroundColor: 'var(--secondary-50)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--primary-500), var(--primary-600))'
              }}></div>
              
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--secondary-900)', margin: 0, flex: 1 }}>
                {test.title}
              </h4>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    backgroundColor: test.status === 'PUBLISHED' ? 'var(--success-100)' : 
                                   test.status === 'DRAFT' ? 'var(--warning-100)' : 
                                   test.status === 'SCHEDULED' ? 'var(--info-100)' : 'var(--secondary-100)',
                    color: test.status === 'PUBLISHED' ? 'var(--success-700)' : 
                          test.status === 'DRAFT' ? 'var(--warning-700)' : 
                          test.status === 'SCHEDULED' ? 'var(--info-700)' : 'var(--secondary-700)',
                    border: `1px solid ${test.status === 'PUBLISHED' ? 'var(--success-200)' : 
                                       test.status === 'DRAFT' ? 'var(--warning-200)' : 
                                       test.status === 'SCHEDULED' ? 'var(--info-200)' : 'var(--secondary-200)'}`
                  }}>
                    {test.status || 'Unknown'}
                  </span>
                </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Category:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--primary-600)' }}>{test.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Date:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--secondary-900)' }}>{test.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Time:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--secondary-900)' }}>{test.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Students:</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--success-600)' }}>{test.students}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => { setSelectedTest(test); setModalType('view'); setModalOpen(true); }}
                  >
                    <FiEye size={14} />
                  View Details
                </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => { setSelectedTest(test); setModalType('edit'); setModalOpen(true); }}
                  >
                    <FiEdit size={14} />
                  Edit
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      <ModernModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'view' ? 'Test Details' : 'Edit Test'}
        icon={modalType === 'view' ? <FiEye className="text-blue-500" size={22} /> : <FiEdit className="text-yellow-500" size={22} />}
      >
        {modalType === 'view' && selectedTest && (
          <div style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e0e7ef 100%)',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: 24,
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            border: '1.5px solid #e5e7eb',
            alignItems: 'flex-start',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <FiFileText size={24} style={{ color: '#2563eb' }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.5px' }}>{selectedTest.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiBook size={18} style={{ color: '#a21caf' }} />
              <span style={{ fontWeight: 500, color: '#6d28d9', fontSize: 16 }}>Category:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.category}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCalendar size={18} style={{ color: '#059669' }} />
              <span style={{ fontWeight: 500, color: '#059669', fontSize: 16 }}>Date:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiClock size={18} style={{ color: '#f59e42' }} />
              <span style={{ fontWeight: 500, color: '#f59e42', fontSize: 16 }}>Time:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiUsers size={18} style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 500, color: '#2563eb', fontSize: 16 }}>Students:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.students}</span>
            </div>
            {selectedTest.description && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <FiFileText size={18} style={{ color: '#059669', marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500, color: '#059669', fontSize: 16 }}>Description:</span>
                  <p style={{ color: '#334155', fontSize: 14, margin: '4px 0 0 0', lineHeight: 1.5 }}>{selectedTest.description}</p>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiClock size={18} style={{ color: '#f59e42' }} />
              <span style={{ fontWeight: 500, color: '#f59e42', fontSize: 16 }}>Duration:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.duration} minutes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiTrendingUp size={18} style={{ color: '#dc2626' }} />
              <span style={{ fontWeight: 500, color: '#dc2626', fontSize: 16 }}>Passing Score:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.passingScore}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiPlay size={18} style={{ color: '#7c3aed' }} />
              <span style={{ fontWeight: 500, color: '#7c3aed', fontSize: 16 }}>Max Attempts:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.maxAttempts}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiDollarSign size={18} style={{ color: '#059669' }} />
              <span style={{ fontWeight: 500, color: '#059669', fontSize: 16 }}>Price:</span>
              <span style={{ color: '#334155', fontWeight: 500, fontSize: 16 }}>{selectedTest.price} {selectedTest.currency}</span>
            </div>
          </div>
        )}
        {modalType === 'edit' && selectedTest && (
          <form>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Title</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <FiFileText style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', fontSize: 16, outline: 'none', transition: 'border 0.2s', marginBottom: 0 }} onFocus={e => e.target.style.border = '1.5px solid #2563eb'} onBlur={e => e.target.style.border = '1.5px solid #d1d5db'} defaultValue={selectedTest.title} />
            </div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Category</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <FiBook style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', fontSize: 16, outline: 'none', transition: 'border 0.2s', marginBottom: 0 }} onFocus={e => e.target.style.border = '1.5px solid #2563eb'} onBlur={e => e.target.style.border = '1.5px solid #d1d5db'} defaultValue={selectedTest.category} />
            </div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Date</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <FiCalendar style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input type="date" style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', fontSize: 16, outline: 'none', transition: 'border 0.2s', marginBottom: 0 }} onFocus={e => e.target.style.border = '1.5px solid #2563eb'} onBlur={e => e.target.style.border = '1.5px solid #d1d5db'} defaultValue={selectedTest.date} />
            </div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Duration (minutes)</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <FiClock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input type="number" min="1" style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', fontSize: 16, outline: 'none', transition: 'border 0.2s', marginBottom: 0 }} onFocus={e => e.target.style.border = '1.5px solid #2563eb'} onBlur={e => e.target.style.border = '1.5px solid #d1d5db'} defaultValue={selectedTest.duration} />
            </div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Passing Score (%)</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <FiTrendingUp style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input type="number" min="0" max="100" style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', fontSize: 16, outline: 'none', transition: 'border 0.2s', marginBottom: 0 }} onFocus={e => e.target.style.border = '1.5px solid #2563eb'} onBlur={e => e.target.style.border = '1.5px solid #d1d5db'} defaultValue={selectedTest.passingScore} />
            </div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Max Attempts</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <FiPlay style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input type="number" min="1" style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', fontSize: 16, outline: 'none', transition: 'border 0.2s', marginBottom: 0 }} onFocus={e => e.target.style.border = '1.5px solid #2563eb'} onBlur={e => e.target.style.border = '1.5px solid #d1d5db'} defaultValue={selectedTest.maxAttempts} />
            </div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Price</label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <FiDollarSign style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input type="number" min="0" step="0.01" style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#f1f5f9', fontSize: 16, outline: 'none', transition: 'border 0.2s', marginBottom: 0 }} onFocus={e => e.target.style.border = '1.5px solid #2563eb'} onBlur={e => e.target.style.border = '1.5px solid #d1d5db'} defaultValue={selectedTest.price} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button type="submit" style={{ flex: 1, background: 'linear-gradient(90deg, #2563eb, #3b82f6)', color: 'white', padding: '12px 0', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #dbeafe' }}>Save</button>
              <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, background: '#f3f4f6', color: '#334155', padding: '12px 0', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #e5e7eb' }}>Cancel</button>
            </div>
          </form>
        )}

      </ModernModal>

      {/* Activities Modal */}
      <ModernModal
        open={activitiesModalOpen}
        onClose={() => setActivitiesModalOpen(false)}
        title="All Recent Activities"
        icon={<FiActivity className="text-blue-500" size={22} />}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto', width: '100%', paddingRight: 4 }}>
          {recentActivities.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', fontSize: 16, padding: 32 }}>No recent activities found.</div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 0',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {React.createElement(getActivityIcon(activity.type), { size: 18 })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 16, marginBottom: 2 }}>{activity.message}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 14, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUser size={12} /> {activity.user}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {activity.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ModernModal>
    </div>
  );
};

export default AdminDashboard; 