import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionAPI, categoryAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiPackage, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';

const Questions = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [realTimeStats, setRealTimeStats] = useState({
    totalQuestions: 0,
    questionsAdded: 0,
    questionsUpdated: 0
  });

  // WebSocket event handlers for real-time question updates
  useEffect(() => {
    if (!currentUser) return;

    // Handle question creation events
    const handleQuestionCreated = (data) => {
      queryClient.invalidateQueries(['questions']);
      setRealTimeStats(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        questionsAdded: prev.questionsAdded + 1
      }));
    };

    // Handle question update events
    const handleQuestionUpdated = (data) => {
      queryClient.invalidateQueries(['questions']);
      setRealTimeStats(prev => ({
        ...prev,
        questionsUpdated: prev.questionsUpdated + 1
      }));
    };

    // Set up event listeners
    socketService.onExamAttemptStarted(handleQuestionCreated); // Reuse for question events
    socketService.onExamAttemptCompleted(handleQuestionUpdated); // Reuse for question events

    // Cleanup event listeners
    return () => {
      socketService.offExamAttemptStarted(handleQuestionCreated);
      socketService.offExamAttemptCompleted(handleQuestionUpdated);
    };
  }, [currentUser, queryClient]);

  const [formData, setFormData] = useState({
    question: '',
    categoryId: '',
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
    correctAnswer: '',
    options: ['', '', '', ''],
    explanation: '',
    points: 1,
    timeLimit: 60,
    images: []
  });

  const [isBulkInsert, setIsBulkInsert] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [bulkQuestionType, setBulkQuestionType] = useState('MULTIPLE_CHOICE');

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedType]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Fetch all questions
  const { data: questionsData, isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['questions', searchTerm, selectedCategory, selectedDifficulty, selectedType, currentPage, pageSize],
    queryFn: () => adminAPI.getAllQuestions({ 
      search: searchTerm, 
      examCategoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      isActive: true,
      page: currentPage,
      limit: pageSize
    }),
    refetchInterval: 30000
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAllCategories()
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (questionData) => adminAPI.createQuestion(questionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      toast.success('Question created successfully!');
      setShowAddModal(false);
      setFormData({
        question: '',
        categoryId: '',
        difficulty: 'EASY',
        type: 'MULTIPLE_CHOICE',
        correctAnswer: '',
        options: ['', '', '', ''],
        explanation: '',
        points: 1,
        timeLimit: 60,
        images: []
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create question');
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ questionId, questionData }) => adminAPI.updateQuestion(questionId, questionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      toast.success('Question updated successfully!');
      setShowAddModal(false);
      setEditingQuestion(null);
      setFormData({
        question: '',
        categoryId: '',
        difficulty: 'EASY',
        type: 'MULTIPLE_CHOICE',
        correctAnswer: '',
        options: ['', '', '', ''],
        explanation: '',
        points: 1,
        timeLimit: 60,
        images: []
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update question');
    }
  });

  // Bulk insert questions mutation
  const bulkInsertMutation = useMutation({
    mutationFn: (questionsData) => adminAPI.bulkCreateQuestions(questionsData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['questions']);
      toast.success(`Successfully created ${data.createdCount} questions!`);
      setShowAddModal(false);
      setIsBulkInsert(false);
      setBulkData('');
      setBulkQuestionType('MULTIPLE_CHOICE');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create questions');
    }
  });

  const handleAddQuestion = () => {
    if (formData.question && formData.categoryId && 
        (formData.type === 'FILL_IN_THE_BLANK' ? formData.options.length > 0 : formData.correctAnswer)) {
      const questionData = {
        text: formData.question,
        examCategoryId: formData.categoryId,
        difficulty: formData.difficulty,
        type: formData.type,
        marks: formData.points,
        timeLimit: formData.timeLimit,
        options: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'].includes(formData.type) ? 
          (formData.type === 'MULTIPLE_CHOICE' ? 
            formData.options.filter(opt => opt.trim()).map((option, index) => ({
              text: option,
              isCorrect: option === formData.correctAnswer
            })) : 
            formData.options.filter(opt => opt.text && opt.text.trim()) // For fill-in-the-blank, use the structured options
          ) : [],
        explanation: formData.explanation
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add question data as JSON
      formDataToSend.append('questionData', JSON.stringify(questionData));
      
      // Add images
      formData.images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
        }
      });

      createQuestionMutation.mutate(formDataToSend);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBulkInsert = () => {
    try {
      const questions = JSON.parse(bulkData);
      if (!Array.isArray(questions)) {
        toast.error('JSON data must be an array of questions');
        return;
      }
      
      // Validate each question
      const validatedQuestions = questions.map((q, index) => {
        if (!q.text || !q.examCategoryId || !q.type) {
          throw new Error(`Question ${index + 1} is missing required fields (text, examCategoryId, type)`);
        }
        
        // Ensure options are in correct format for multiple choice and fill-in-the-blank questions
        if (['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'].includes(q.type) && q.options) {
          q.options = q.options.map(option => ({
            text: option.text || option,
            isCorrect: option.isCorrect || false
          }));
        }
        
        return {
          text: q.text,
          examCategoryId: q.examCategoryId,
          difficulty: q.difficulty || 'EASY',
          type: q.type,
          marks: q.marks || 1,
          timeLimit: q.timeLimit || 60,
          options: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'].includes(q.type) ? (q.options || []) : []
        };
      });
      
      bulkInsertMutation.mutate(validatedQuestions);
    } catch (error) {
      toast.error(`Invalid JSON format: ${error.message}`);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.text,
      categoryId: question.examCategoryId,
      difficulty: question.difficulty,
      type: question.type,
      correctAnswer: question.correctAnswer,
      options: question.options?.map(opt => opt.text) || ['', '', '', ''],
      explanation: question.explanation || '',
      points: question.marks || 1,
      timeLimit: question.timeLimit || 60,
      images: question.images || []
    });
    setShowAddModal(true);
  };

  const handleUpdateQuestion = () => {
    if (formData.question && formData.categoryId && 
        (formData.type === 'FILL_IN_THE_BLANK' ? formData.options.length > 0 : formData.correctAnswer)) {
      const questionData = {
        text: formData.question,
        examCategoryId: formData.categoryId,
        difficulty: formData.difficulty,
        type: formData.type,
        marks: formData.points,
        timeLimit: formData.timeLimit,
        options: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'].includes(formData.type) ? 
          (formData.type === 'MULTIPLE_CHOICE' ? 
            formData.options.filter(opt => opt.trim()).map((option, index) => ({
              text: option,
              isCorrect: option === formData.correctAnswer
            })) : 
            formData.options.filter(opt => opt.text && opt.text.trim()) // For fill-in-the-blank, use the structured options
          ) : []
      };
      updateQuestionMutation.mutate({ questionId: editingQuestion.id, questionData });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  // Image upload handling
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length + formData.images.length > 5) {
      toast.error('Maximum 5 images allowed per question');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData({
      ...formData,
      images: [...formData.images, ...newImages]
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const filteredQuestions = questionsData?.data?.data?.questions || [];
  const categories = Array.isArray(categoriesData?.data?.data) ? categoriesData.data.data : [];
  const pagination = questionsData?.data?.data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };





  if (questionsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--secondary-600)' }}>Loading questions...</div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--danger-600)' }}>Error loading questions</div>
        <div style={{ fontSize: '16px', color: 'var(--secondary-600)', marginTop: '8px' }}>
          {questionsError.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Questions Management</h2>
          <div className="data-table-actions">
            <div style={{ position: 'relative', marginRight: '12px' }}>
              <FiSearch style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--secondary-400)',
                fontSize: '16px'
              }} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  border: '1px solid var(--secondary-300)',
                  borderRadius: '6px',
                  width: '200px'
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Types</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="ESSAY">Essay</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsBulkInsert(false);
                  setFormData({
                    question: '',
                    categoryId: '',
                    difficulty: 'EASY',
                    type: 'MULTIPLE_CHOICE',
                    correctAnswer: '',
                    options: ['', '', '', ''],
                    explanation: '',
                    points: 1,
                    timeLimit: 60,
                    images: []
                  });
                  setShowAddModal(true);
                }}
              >
                <FiPlus style={{ marginRight: '4px' }} /> Add Question
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsBulkInsert(true);
                  setBulkData('');
                  setShowAddModal(true);
                }}
              >
                <FiPackage style={{ marginRight: '4px' }} /> Bulk Insert
              </button>
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Type</th>
              <th>Points</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.id}>
                <td style={{ maxWidth: '300px' }}>
                  <div style={{ fontWeight: '500', color: 'var(--secondary-900)' }}>
                    {q.text}
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">
                    {q.exam_categories?.name || categories.find(c => c.id === q.examCategoryId)?.name || 'Unknown'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    q.difficulty === 'EASY' ? 'badge-success' :
                    q.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {q.difficulty}
                  </span>
                </td>
                <td>{q.type}</td>
                <td>{q.marks || 1}</td>
                <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="data-table-actions-cell">
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleEditQuestion(q)}
                    >
                      <FiEdit style={{ marginRight: '4px' }} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '20px 0',
            borderTop: '1px solid var(--secondary-200)',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--secondary-600)', fontSize: '14px' }}>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} questions
              </span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                style={{
                  padding: '4px 8px',
                  border: '1px solid var(--secondary-300)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--secondary-300)',
                  borderRadius: '6px',
                  backgroundColor: pagination.page <= 1 ? 'var(--secondary-100)' : 'white',
                  color: pagination.page <= 1 ? 'var(--secondary-400)' : 'var(--secondary-700)',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px',
                      backgroundColor: pageNum === pagination.page ? 'var(--primary-500)' : 'white',
                      color: pageNum === pagination.page ? 'white' : 'var(--secondary-700)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      minWidth: '40px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--secondary-300)',
                  borderRadius: '6px',
                  backgroundColor: pagination.page >= pagination.pages ? 'var(--secondary-100)' : 'white',
                  color: pagination.page >= pagination.pages ? 'var(--secondary-400)' : 'var(--secondary-700)',
                  cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredQuestions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-600)' }}>
            No questions found
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '800px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
              {editingQuestion ? 'Edit Question' : (isBulkInsert ? 'Bulk Insert Questions' : 'Add New Question')}
            </h3>
            
            {isBulkInsert ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Question Type for Sample *
                  </label>
                  <select
                    value={bulkQuestionType}
                    onChange={(e) => setBulkQuestionType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px',
                      marginBottom: '16px'
                    }}
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="SINGLE_CHOICE">Single Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="ESSAY">Essay</option>
                    <option value="MATCHING">Matching</option>
                    <option value="ORDERING">Ordering</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Questions JSON *
                  </label>
                  <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--secondary-600)' }}>
                    Enter an array of questions in JSON format. Each question should have: text, examCategoryId, type, difficulty (optional), marks (optional), timeLimit (optional), and options (for MULTIPLE_CHOICE, FILL_IN_THE_BLANK types).
                    <button
                      type="button"
                      onClick={() => {
                        let sampleData;
                        
                        if (bulkQuestionType === 'FILL_IN_THE_BLANK') {
                          sampleData = [
                            {
                              "text": "When planning the upcoming conference ( ) how should we handle the keynote speaker's schedule ( ) to ensure that all attendees ( ) have the best possible experience?",
                              "examCategoryId": categories[0]?.id || "cat_001",
                              "type": "FILL_IN_THE_BLANK",
                              "difficulty": "MEDIUM",
                              "marks": 3,
                              "options": [
                                {"text": "carefully", "isCorrect": true},
                                {"text": "efficiently", "isCorrect": true},
                                {"text": "thoroughly", "isCorrect": true}
                              ]
                            },
                            {
                              "text": "The ( ) of the project depends on how well we ( ) the requirements and ( ) the timeline.",
                              "examCategoryId": categories[0]?.id || "cat_001",
                              "type": "FILL_IN_THE_BLANK",
                              "difficulty": "EASY",
                              "marks": 3,
                              "options": [
                                {"text": "success", "isCorrect": true},
                                {"text": "understand", "isCorrect": true},
                                {"text": "manage", "isCorrect": true}
                              ]
                            }
                          ];
                        } else if (bulkQuestionType === 'MULTIPLE_CHOICE') {
                          sampleData = [
                            {
                              "text": "What is the derivative of x²?",
                              "examCategoryId": categories[0]?.id || "cat_001",
                              "type": "MULTIPLE_CHOICE",
                              "difficulty": "MEDIUM",
                              "marks": 3,
                              "options": [
                                {"text": "x", "isCorrect": false},
                                {"text": "2x", "isCorrect": true},
                                {"text": "x²", "isCorrect": false},
                                {"text": "2x²", "isCorrect": false}
                              ]
                            },
                            {
                              "text": "Solve for x: 3x - 7 = 8",
                              "examCategoryId": categories[0]?.id || "cat_001",
                              "type": "MULTIPLE_CHOICE",
                              "difficulty": "EASY",
                              "marks": 2,
                              "options": [
                                {"text": "x = 3", "isCorrect": false},
                                {"text": "x = 5", "isCorrect": true},
                                {"text": "x = 7", "isCorrect": false},
                                {"text": "x = 9", "isCorrect": false}
                              ]
                            }
                          ];
                        } else if (bulkQuestionType === 'ESSAY') {
                          sampleData = [
                            {
                              "text": "Explain the importance of effective communication in project management.",
                              "examCategoryId": categories[0]?.id || "cat_001",
                              "type": "ESSAY",
                              "difficulty": "HARD",
                              "marks": 10,
                              "options": [
                                {"text": "Effective communication ensures all team members understand project goals, reduces misunderstandings, improves collaboration, and helps identify and resolve issues early."}
                              ]
                            }
                          ];
                        } else {
                          sampleData = [
                            {
                              "text": "Sample question for " + bulkQuestionType,
                              "examCategoryId": categories[0]?.id || "cat_001",
                              "type": bulkQuestionType,
                              "difficulty": "MEDIUM",
                              "marks": 2
                            }
                          ];
                        }
                        
                        setBulkData(JSON.stringify(sampleData, null, 2));
                      }}
                      style={{
                        marginLeft: '8px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid var(--primary-500)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary-600)',
                        cursor: 'pointer'
                      }}
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    rows={15}
                    placeholder={bulkQuestionType === 'FILL_IN_THE_BLANK' ? 
                      `[
  {
    "text": "When planning the upcoming conference ( ) how should we handle the keynote speaker's schedule ( ) to ensure that all attendees ( ) have the best possible experience?",
    "examCategoryId": "cat_001",
    "type": "FILL_IN_THE_BLANK",
    "difficulty": "MEDIUM",
    "marks": 3,
    "options": [
      {"text": "carefully", "isCorrect": true},
      {"text": "efficiently", "isCorrect": true},
      {"text": "thoroughly", "isCorrect": true}
    ]
  }
]` : 
                      `[
  {
    "text": "What is the derivative of x²?",
    "examCategoryId": "cat_001",
    "type": "${bulkQuestionType}",
    "difficulty": "MEDIUM",
    "marks": 3,
    "options": [
      {"text": "x", "isCorrect": false},
      {"text": "2x", "isCorrect": true},
      {"text": "x²", "isCorrect": false},
      {"text": "2x²", "isCorrect": false}
    ]
  }
]`
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px',
                      resize: 'vertical',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Question *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="SINGLE_CHOICE">Single Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="ESSAY">Essay</option>
                    <option value="MATCHING">Matching</option>
                    <option value="ORDERING">Ordering</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    min="30"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 60 })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>

              {formData.type === 'MULTIPLE_CHOICE' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Options *
                  </label>
                  {formData.options.map((option, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid var(--secondary-300)',
                          borderRadius: '6px'
                        }}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: 'var(--danger-500)',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {formData.type === 'FILL_IN_THE_BLANK' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Question Text with Blanks *
                  </label>
                  <div style={{ 
                    background: 'var(--secondary-50)', 
                    padding: '12px', 
                    borderRadius: '6px',
                    marginBottom: '12px',
                    border: '1px solid var(--secondary-200)'
                  }}>
                    <p style={{ fontSize: '12px', color: 'var(--secondary-600)', marginBottom: '8px' }}>
                      💡 <strong>Tip:</strong> Use parentheses () to mark blanks. Each set of parentheses will become a fill-in option.
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>
                      <strong>Example:</strong> "When planning the upcoming conference ( ) how should we handle the keynote speaker's schedule ( ) to ensure that all attendees ( ) have the best possible experience?"
                    </p>
                  </div>
                  <textarea
                    value={formData.question}
                    onChange={(e) => {
                      const text = e.target.value;
                      setFormData({ ...formData, question: text });
                      
                      // Auto-generate options from parentheses
                      const matches = text.match(/\([^)]*\)/g);
                      if (matches) {
                        const newOptions = matches.map((match, index) => ({
                          text: match.slice(1, -1), // Remove parentheses
                          isCorrect: false
                        }));
                        setFormData(prev => ({ ...prev, options: newOptions }));
                      }
                    }}
                    rows={4}
                    placeholder="Enter your question text with blanks marked by parentheses ()"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px',
                      resize: 'vertical'
                    }}
                  />
                  
                  {formData.options.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Fill-in Options (Generated from parentheses)
                      </label>
                      {formData.options.map((option, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          marginBottom: '8px',
                          alignItems: 'center'
                        }}>
                          <span style={{ 
                            fontSize: '12px', 
                            color: 'var(--secondary-600)',
                            minWidth: '60px'
                          }}>
                            Blank {index + 1}:
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index].text = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            placeholder={`Answer for blank ${index + 1}`}
                            style={{
                              flex: '1',
                              padding: '8px',
                              border: '1px solid var(--secondary-300)',
                              borderRadius: '4px'
                            }}
                          />
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => {
                                const newOptions = [...formData.options];
                                newOptions[index].isCorrect = e.target.checked;
                                setFormData({ ...formData, options: newOptions });
                              }}
                            />
                            <span style={{ fontSize: '12px' }}>Correct</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formData.type !== 'FILL_IN_THE_BLANK' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Correct Answer *
                  </label>
                  {formData.type === 'MULTIPLE_CHOICE' ? (
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--secondary-300)',
                        borderRadius: '6px'
                      }}
                    >
                      <option value="">Select Correct Answer</option>
                      {formData.options.map((option, index) => (
                        <option key={index} value={option}>{option || `Option ${index + 1}`}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--secondary-300)',
                        borderRadius: '6px'
                      }}
                    />
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Explanation
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={3}
                  placeholder="Optional explanation for the correct answer..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Question Images (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '6px',
                    backgroundColor: 'white'
                  }}
                />
                <div style={{ fontSize: '12px', color: 'var(--secondary-500)', marginTop: '4px' }}>
                  Maximum 5 images, 5MB each. Supported formats: JPEG, PNG, GIF, WebP
                </div>
                
                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Selected Images ({formData.images.length}/5):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {formData.images.map((image, index) => (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            border: '1px solid var(--secondary-300)',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            width: '100px',
                            height: '100px'
                          }}
                        >
                          <img
                            src={image.preview || image.imageUrl}
                            alt={image.name || `Image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setIsBulkInsert(false);
                  setBulkData('');
                }}
                disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending || bulkInsertMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={editingQuestion ? handleUpdateQuestion : (isBulkInsert ? handleBulkInsert : handleAddQuestion)}
                disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending || bulkInsertMutation.isPending}
              >
                {createQuestionMutation.isPending || updateQuestionMutation.isPending || bulkInsertMutation.isPending ? 'Saving...' : (editingQuestion ? 'Update Question' : (isBulkInsert ? 'Create Questions' : 'Add Question'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions; 