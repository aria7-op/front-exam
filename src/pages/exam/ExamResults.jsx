import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ExamResults = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resultId) {
      fetchResults();
    }
  }, [resultId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await attemptAPI.getAttemptById(resultId);
      console.log('🔍 Exam results:', response);
      setResults(response.data?.data?.attempt);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setError(error);
      toast.error('Failed to load exam results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading results...</h2>
          <p>Please wait while we fetch your exam results.</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No results found</h2>
          <p>Unable to load exam results. Please try again later.</p>
          <button className="btn btn-primary" onClick={() => navigate('/student')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'var(--success-600)';
    if (percentage >= 60) return 'var(--warning-600)';
    return 'var(--danger-600)';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep it up!';
    if (percentage >= 60) return 'Not bad! Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  // Extract data from API response
  const attempt = results || {};
  const certificate = attempt.certificate;
  const examScore = attempt.examScore; // New detailed score record
  
  const score = attempt.percentage || 0;
  const correctAnswers = attempt.obtainedMarks || 0;
  const totalQuestions = attempt.totalMarks || 0;
  const timeSpent = attempt.timeSpent || 0;

  // Extract detailed analytics from examScore
  const detailedAnalytics = examScore ? {
    wrongAnswers: examScore.wrongAnswers || 0,
    unanswered: examScore.unanswered || 0,
    totalTimeSpent: examScore.totalTimeSpent || 0,
    averageTimePerQuestion: examScore.averageTimePerQuestion || 0,
    timeEfficiency: examScore.timeEfficiency || 0,
    accuracy: examScore.accuracy || 0,
    speedScore: examScore.speedScore || 0,
    consistencyScore: examScore.consistencyScore || 0,
    difficultyScore: examScore.difficultyScore || 0,
    grade: examScore.grade || 'N/A',
    easyCorrect: examScore.easyCorrect || 0,
    easyTotal: examScore.easyTotal || 0,
    mediumCorrect: examScore.mediumCorrect || 0,
    mediumTotal: examScore.mediumTotal || 0,
    hardCorrect: examScore.hardCorrect || 0,
    hardTotal: examScore.hardTotal || 0
  } : null;

  console.log('🔍 ExamResults Debug:', {
    results,
    attempt,
    certificate,
    examScore,
    detailedAnalytics,
    score,
    correctAnswers,
    totalQuestions,
    timeSpent
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow)',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--secondary-900)', margin: '0 0 16px' }}>
            Exam Results
          </h1>
          <h2 style={{ fontSize: '24px', fontWeight: '500', color: 'var(--secondary-700)', margin: '0 0 24px' }}>
            {attempt.exam?.title || 'Basic Mathematics Test'}
          </h2>

          {/* Score Display */}
          <div style={{
            display: 'inline-block',
            padding: '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getScoreColor(score)}20, ${getScoreColor(score)}10)`,
            border: `4px solid ${getScoreColor(score)}`,
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: getScoreColor(score),
              marginBottom: '8px'
            }}>
              {score}%
            </div>
            <div style={{ fontSize: '16px', color: 'var(--secondary-600)' }}>
              Score
            </div>
          </div>

          <p style={{ fontSize: '18px', color: 'var(--secondary-700)', margin: '0 0 24px' }}>
            {getScoreMessage(score)}
          </p>

          {/* Certificate Display */}
          {certificate && (
            <div style={{
              background: 'linear-gradient(135deg, var(--success-50), var(--success-100))',
              border: '2px solid var(--success-300)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--success-700)', margin: '0 0 8px' }}>
                Congratulations! You've earned a certificate!
              </h3>
              <p style={{ fontSize: '16px', color: 'var(--success-600)', margin: '0 0 16px' }}>
                Certificate Number: {certificate.certificateNumber}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={() => window.print()}>
                  📄 Print Certificate
                </button>
                <button className="btn btn-primary" onClick={() => window.open(`/api/v1/certificates/${certificate.id}/download`, '_blank')}>
                  📥 Download PDF
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              background: 'var(--primary-50)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--primary-200)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>
                {correctAnswers}/{totalQuestions}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                Correct Answers
              </div>
            </div>

            <div style={{
              background: 'var(--success-50)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--success-200)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>
                {detailedAnalytics ? Math.round(detailedAnalytics.accuracy) : Math.round((correctAnswers / totalQuestions) * 100)}%
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                Accuracy
              </div>
            </div>

            <div style={{
              background: 'var(--warning-50)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--warning-200)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>
                {formatTime(detailedAnalytics ? detailedAnalytics.totalTimeSpent : timeSpent)}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                Time Spent
              </div>
            </div>

            <div style={{
              background: 'var(--info-50)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--info-200)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--info-600)', marginBottom: '4px' }}>
                {detailedAnalytics ? detailedAnalytics.grade : 'N/A'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                Grade
              </div>
            </div>

            <div style={{
              background: 'var(--secondary-50)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--secondary-200)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--secondary-600)', marginBottom: '4px' }}>
                {attempt.exam?.duration || 60} min
              </div>
              <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                Time Limit
              </div>
            </div>

            {detailedAnalytics && (
              <div style={{
                background: 'var(--purple-50)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--purple-200)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--purple-600)', marginBottom: '4px' }}>
                  {Math.round(detailedAnalytics.timeEfficiency)}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                  Efficiency
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/student/history')}>
              📊 View All Results
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/student/tests')}>
              📝 Take Another Test
            </button>
            <button className="btn btn-success" onClick={() => navigate('/student')}>
              🏠 Go to Dashboard
            </button>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '24px' }}>
            Exam Summary
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{
              padding: '20px',
              border: '1px solid var(--secondary-200)',
              borderRadius: '8px',
              backgroundColor: 'var(--secondary-50)'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary-900)', margin: '0 0 8px' }}>
                Attempt Details
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--secondary-600)', margin: '0 0 4px' }}>
                <strong>Started:</strong> {new Date(attempt.startedAt).toLocaleString()}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--secondary-600)', margin: '0 0 4px' }}>
                <strong>Completed:</strong> {new Date(attempt.completedAt).toLocaleString()}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--secondary-600)', margin: '0 0 4px' }}>
                <strong>Status:</strong> {attempt.status}
              </p>
            </div>

            {detailedAnalytics && (
              <div style={{
                padding: '20px',
                border: '1px solid var(--info-200)',
                borderRadius: '8px',
                backgroundColor: 'var(--info-50)'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--info-900)', margin: '0 0 8px' }}>
                  Performance Analytics
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--info-600)', margin: '0 0 4px' }}>
                  <strong>Wrong Answers:</strong> {detailedAnalytics.wrongAnswers}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--info-600)', margin: '0 0 4px' }}>
                  <strong>Unanswered:</strong> {detailedAnalytics.unanswered}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--info-600)', margin: '0 0 4px' }}>
                  <strong>Avg Time/Question:</strong> {Math.round(detailedAnalytics.averageTimePerQuestion)}s
                </p>
                <p style={{ fontSize: '14px', color: 'var(--info-600)', margin: '0 0 4px' }}>
                  <strong>Speed Score:</strong> {Math.round(detailedAnalytics.speedScore)}
                </p>
              </div>
            )}

            {detailedAnalytics && (
              <div style={{
                padding: '20px',
                border: '1px solid var(--purple-200)',
                borderRadius: '8px',
                backgroundColor: 'var(--purple-50)'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--purple-900)', margin: '0 0 8px' }}>
                  Difficulty Breakdown
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--purple-600)', margin: '0 0 4px' }}>
                  <strong>Easy:</strong> {detailedAnalytics.easyCorrect}/{detailedAnalytics.easyTotal} ({detailedAnalytics.easyTotal > 0 ? Math.round((detailedAnalytics.easyCorrect / detailedAnalytics.easyTotal) * 100) : 0}%)
                </p>
                <p style={{ fontSize: '14px', color: 'var(--purple-600)', margin: '0 0 4px' }}>
                  <strong>Medium:</strong> {detailedAnalytics.mediumCorrect}/{detailedAnalytics.mediumTotal} ({detailedAnalytics.mediumTotal > 0 ? Math.round((detailedAnalytics.mediumCorrect / detailedAnalytics.mediumTotal) * 100) : 0}%)
                </p>
                <p style={{ fontSize: '14px', color: 'var(--purple-600)', margin: '0 0 4px' }}>
                  <strong>Hard:</strong> {detailedAnalytics.hardCorrect}/{detailedAnalytics.hardTotal} ({detailedAnalytics.hardTotal > 0 ? Math.round((detailedAnalytics.hardCorrect / detailedAnalytics.hardTotal) * 100) : 0}%)
                </p>
                <p style={{ fontSize: '14px', color: 'var(--purple-600)', margin: '0 0 4px' }}>
                  <strong>Difficulty Score:</strong> {Math.round(detailedAnalytics.difficultyScore)}
                </p>
              </div>
            )}

            {certificate && (
              <div style={{
                padding: '20px',
                border: '1px solid var(--success-200)',
                borderRadius: '8px',
                backgroundColor: 'var(--success-50)'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--success-900)', margin: '0 0 8px' }}>
                  Certificate Details
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--success-600)', margin: '0 0 4px' }}>
                  <strong>Number:</strong> {certificate.certificateNumber}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--success-600)', margin: '0 0 4px' }}>
                  <strong>Issued:</strong> {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--success-600)', margin: '0 0 4px' }}>
                  <strong>Expires:</strong> {new Date(certificate.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResults; 