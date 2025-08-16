import React, { useState } from 'react';

const TestManagement = () => {
  const [tests, setTests] = useState([
    {
      id: 1,
      name: 'Mathematics Final',
      subject: 'Mathematics',
      duration: 120,
      questions: 50,
      difficulty: 'Advanced',
      status: 'scheduled',
      scheduledDate: '2024-01-15',
      scheduledTime: '10:00 AM',
      studentsBooked: 45,
      maxStudents: 50,
      passingScore: 70
    },
    {
      id: 2,
      name: 'Physics Midterm',
      subject: 'Physics',
      duration: 90,
      questions: 40,
      difficulty: 'Intermediate',
      status: 'scheduled',
      scheduledDate: '2024-01-16',
      scheduledTime: '2:00 PM',
      studentsBooked: 32,
      maxStudents: 40,
      passingScore: 65
    },
    {
      id: 3,
      name: 'Chemistry Quiz',
      subject: 'Chemistry',
      duration: 60,
      questions: 25,
      difficulty: 'Beginner',
      status: 'draft',
      scheduledDate: null,
      scheduledTime: null,
      studentsBooked: 0,
      maxStudents: 30,
      passingScore: 60
    },
    {
      id: 4,
      name: 'Biology Advanced',
      subject: 'Biology',
      duration: 150,
      questions: 60,
      difficulty: 'Advanced',
      status: 'active',
      scheduledDate: '2024-01-12',
      scheduledTime: '9:00 AM',
      studentsBooked: 28,
      maxStudents: 35,
      passingScore: 75
    }
  ]);

  const [showCreateTest, setShowCreateTest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newTest, setNewTest] = useState({
    name: '',
    subject: '',
    duration: 60,
    questions: 25,
    difficulty: 'Beginner',
    maxStudents: 30,
    passingScore: 60
  });

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || test.subject === filterSubject;
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleCreateTest = (e) => {
    e.preventDefault();
    const test = {
      id: tests.length + 1,
      ...newTest,
      status: 'draft',
      scheduledDate: null,
      scheduledTime: null,
      studentsBooked: 0
    };
    setTests([...tests, test]);
    setNewTest({
      name: '',
      subject: '',
      duration: 60,
      questions: 25,
      difficulty: 'Beginner',
      maxStudents: 30,
      passingScore: 60
    });
    setShowCreateTest(false);
  };

  const handleScheduleTest = (testId) => {
    const date = prompt('Enter test date (YYYY-MM-DD):');
    const time = prompt('Enter test time (HH:MM AM/PM):');
    
    if (date && time) {
      setTests(tests.map(test => 
        test.id === testId 
          ? { ...test, status: 'scheduled', scheduledDate: date, scheduledTime: time }
          : test
      ));
    }
  };

  return (
    <div className="fade-in">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Test Management
          </h1>
          <p style={{ color: '#64748b' }}>
            Create, schedule, and manage mock tests
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateTest(true)}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Test
        </button>
      </div>

      {/* Filters */}
      <div className="data-table" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <div className="table-title">Filters</div>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by test name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select 
              className="form-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="table-title">
            Tests ({filteredTests.length})
          </div>
          <div className="table-actions">
            <button className="btn btn-secondary">Export</button>
            <button className="btn btn-secondary">Bulk Actions</button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Subject</th>
                <th>Duration</th>
                <th>Questions</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {test.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Passing: {test.passingScore}%
                    </div>
                  </td>
                  <td>{test.subject}</td>
                  <td>{test.duration} min</td>
                  <td>{test.questions}</td>
                  <td>
                    <span className={`status-badge ${
                      test.difficulty === 'Advanced' ? 'status-active' :
                      test.difficulty === 'Intermediate' ? 'status-pending' : 'status-inactive'
                    }`}>
                      {test.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      test.status === 'active' ? 'status-active' :
                      test.status === 'scheduled' ? 'status-pending' : 'status-inactive'
                    }`}>
                      {test.status}
                    </span>
                  </td>
                  <td>
                    {test.scheduledDate ? (
                      <div>
                        <div>{new Date(test.scheduledDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {test.scheduledTime}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Not scheduled</span>
                    )}
                  </td>
                  <td>
                    <div>{test.studentsBooked}/{test.maxStudents}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {Math.round((test.studentsBooked / test.maxStudents) * 100)}% full
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {test.status === 'draft' && (
                        <button 
                          className="btn btn-success"
                          style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                          onClick={() => handleScheduleTest(test.id)}
                        >
                          Schedule
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Test Modal */}
      {showCreateTest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="form-container" style={{ maxWidth: '600px', margin: '2rem' }}>
            <div className="form-title">Create New Test</div>
            <form onSubmit={handleCreateTest}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Test Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTest.name}
                    onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select 
                    className="form-select"
                    value={newTest.subject}
                    onChange={(e) => setNewTest({...newTest, subject: e.target.value})}
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({...newTest, duration: parseInt(e.target.value)})}
                    min="15"
                    max="300"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Questions</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newTest.questions}
                    onChange={(e) => setNewTest({...newTest, questions: parseInt(e.target.value)})}
                    min="5"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select 
                    className="form-select"
                    value={newTest.difficulty}
                    onChange={(e) => setNewTest({...newTest, difficulty: e.target.value})}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Students</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newTest.maxStudents}
                    onChange={(e) => setNewTest({...newTest, maxStudents: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Score (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newTest.passingScore}
                    onChange={(e) => setNewTest({...newTest, passingScore: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary">
                  Create Test
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateTest(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManagement; 