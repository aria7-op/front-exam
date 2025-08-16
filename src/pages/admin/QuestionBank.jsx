import React, { useState } from 'react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "What is the derivative of x²?",
      subject: "Mathematics",
      topic: "Calculus",
      difficulty: "Intermediate",
      type: "MULTIPLE_CHOICE",
      options: ["2x", "x", "2x²", "x²"],
      correctAnswer: "2x",
      explanation: "The derivative of x² is 2x using the power rule."
    },
    {
      id: 2,
      question: "Which of the following is Newton's first law?",
      subject: "Physics",
      topic: "Mechanics",
      difficulty: "Beginner",
      type: "MULTIPLE_CHOICE",
      options: [
        "F = ma",
        "An object in motion stays in motion unless acted upon by an external force",
        "For every action there is an equal and opposite reaction",
        "Energy cannot be created or destroyed"
      ],
      correctAnswer: "An object in motion stays in motion unless acted upon by an external force",
      explanation: "Newton's first law states that an object will remain at rest or in uniform motion unless acted upon by an external force."
    }
  ]);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Question Bank
          </h1>
          <p style={{ color: '#64748b' }}>
            Manage and organize test questions
          </p>
        </div>
        <button className="btn btn-primary">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Question
        </button>
      </div>

      <div className="data-table">
        <div className="table-header">
          <div className="table-title">Questions ({questions.length})</div>
          <div className="table-actions">
            <button className="btn btn-secondary">Import</button>
            <button className="btn btn-secondary">Export</button>
          </div>
        </div>
        
        <div style={{ padding: '1rem' }}>
          {questions.map((q) => (
            <div key={q.id} style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e2e8f0',
              borderLeft: `4px solid ${
                q.difficulty === 'Advanced' ? '#ef4444' :
                q.difficulty === 'Intermediate' ? '#f59e0b' : '#10b981'
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                    {q.question}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <span className={`status-badge ${q.subject === 'Mathematics' ? 'status-active' : 'status-pending'}`}>
                      {q.subject}
                    </span>
                    <span className="status-badge status-inactive">{q.topic}</span>
                    <span className={`status-badge ${
                      q.difficulty === 'Advanced' ? 'status-active' :
                      q.difficulty === 'Intermediate' ? 'status-pending' : 'status-inactive'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Correct Answer:</strong> {q.correctAnswer}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank; 