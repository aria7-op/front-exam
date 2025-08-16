import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examAPI, categoryAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiUpload, FiDownload, FiCheck, FiAlertTriangle, FiSearch, FiGrid, FiList } from 'react-icons/fi';

const Tests = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examCategoryId: '',
    duration: 60,
    totalQuestions: 100,
    totalMarks: 100,
    passingMarks: 70,
    difficulty: 'EASY',
    status: 'DRAFT',
    instructions: '',
    allowRetakes: false,
    maxRetakes: 0,
    isPublic: false,
    scheduledStart: '',
    scheduledEnd: '',
    price: 0,
    currency: 'USD',
    showResults: true,
    showAnswers: false,
    randomizeQuestions: true,
    randomizeOptions: true,
    questionOverlapPercentage: 10.0,
    // Question type distribution
    essayQuestionsCount: 0,
    multipleChoiceQuestionsCount: 0,
    shortAnswerQuestionsCount: 0,
    fillInTheBlankQuestionsCount: 0,
    trueFalseQuestionsCount: 0,
    matchingQuestionsCount: 0,
    orderingQuestionsCount: 0
  });

  // Fetch all exams
  const { data: examsData, isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ['exams', searchTerm, selectedCategory, selectedStatus, selectedDifficulty],
    queryFn: () => adminAPI.getAllExams({ 
      search: searchTerm, 
      categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
    }),
    refetchInterval: 30000
  });

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAllCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: (examData) => {
      return adminAPI.createExam(examData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      toast.success('Exam created successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        examCategoryId: '',
        duration: 60,
        totalQuestions: 100,
        totalMarks: 100,
        passingMarks: 70,
        difficulty: 'EASY',
        status: 'DRAFT',
        instructions: '',
        allowRetakes: false,
        maxRetakes: 0,
        isPublic: false,
        scheduledStart: '',
        scheduledEnd: '',
        price: 0,
        currency: 'USD',
        showResults: true,
        showAnswers: false,
        randomizeQuestions: true,
        randomizeOptions: true,
        questionOverlapPercentage: 10.0,
        // Question type distribution
        essayQuestionsCount: 0,
        multipleChoiceQuestionsCount: 0,
        shortAnswerQuestionsCount: 0,
        fillInTheBlankQuestionsCount: 0,
        trueFalseQuestionsCount: 0,
        matchingQuestionsCount: 0,
        orderingQuestionsCount: 0
      });
    },
    onError: (error) => {
      console.error('❌ CREATE EXAM ERROR:', error.response?.data);
      console.error('❌ ERROR DETAILS:', error.response?.data?.details);
      console.error('❌ FULL ERROR OBJECT:', error);
      console.error('❌ ERROR MESSAGE:', error.response?.data?.error?.message);
      console.error('❌ ERROR DETAILS ARRAY:', error.response?.data?.error?.details);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create exam');
    }
  });

  // Update exam mutation
  const updateExamMutation = useMutation({
    mutationFn: ({ examId, examData }) => adminAPI.updateExam(examId, examData),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      toast.success('Exam updated successfully!');
      setShowAddModal(false);
      setEditingTest(null);
      setFormData({
        title: '',
        description: '',
        examCategoryId: '',
        duration: 60,
        totalQuestions: 100,
        totalMarks: 100,
        passingMarks: 70,
        difficulty: 'EASY',
        status: 'DRAFT',
        instructions: '',
        allowRetakes: false,
        maxRetakes: 0,
        isPublic: false,
        scheduledStart: '',
        scheduledEnd: '',
        price: 0,
        currency: 'USD',
        showResults: true,
        showAnswers: false,
        randomizeQuestions: true,
        randomizeOptions: true,
        questionOverlapPercentage: 10.0,
        // Question type distribution
        essayQuestionsCount: 0,
        multipleChoiceQuestionsCount: 0,
        shortAnswerQuestionsCount: 0,
        fillInTheBlankQuestionsCount: 0,
        trueFalseQuestionsCount: 0,
        matchingQuestionsCount: 0,
        orderingQuestionsCount: 0
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update exam');
    }
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: (examId) => adminAPI.deleteExam(examId),
    onSuccess: () => {
      toast.success('Exam deleted successfully!');
      examsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    }
  });

  // Publish/Unpublish exam mutation
  const publishExamMutation = useMutation({
    mutationFn: ({ examId, action }) => action === 'publish' ? adminAPI.publishExam(examId) : adminAPI.unpublishExam(examId),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries(['exams']);
      toast.success(`Exam ${action === 'publish' ? 'published' : 'unpublished'} successfully!`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update exam status');
    }
  });

        const handleAddExam = () => {
        if (formData.title && formData.examCategoryId) {
          // Use correct field names based on existing exam structure
          // Calculate passing marks (absolute) and ensure bounds
          const computedTotalMarks = Number(formData.totalMarks || 0);
          const computedPassingMarks = Math.min(
            computedTotalMarks,
            Math.max(0, Number(formData.passingMarks || 0))
          );

          // Normalize dates to ISO strings if provided (start of day)
          const toISODateOrNull = (dateTimeLocal) =>
            dateTimeLocal ? new Date(dateTimeLocal).toISOString() : null;

          const minimalExamData = {
            title: formData.title,
            description: formData.description || undefined,
            examCategoryId: formData.examCategoryId,
            duration: Number(formData.duration) || 60,
            totalMarks: computedTotalMarks || 100,
            passingMarks: computedPassingMarks,
            maxRetakes: Number(formData.maxRetakes) || 0,
            allowRetakes: formData.allowRetakes || false,
            showResults: formData.showResults !== undefined ? formData.showResults : true,
            showAnswers: formData.showAnswers || false,
            randomizeQuestions: formData.randomizeQuestions !== undefined ? formData.randomizeQuestions : true,
            randomizeOptions: formData.randomizeOptions !== undefined ? formData.randomizeOptions : true,
            questionOverlapPercentage: Number(formData.questionOverlapPercentage) || 10.0,
            price: parseFloat(formData.price) || 0,
            createdBy: currentUser?.id,
            // total questions + per-type distribution
            totalQuestions: Number(formData.questionsCount) || 0,
            essayQuestionsCount: Number(formData.essayQuestionsCount) || 0,
            multipleChoiceQuestionsCount: Number(formData.multipleChoiceQuestionsCount) || 0,
            shortAnswerQuestionsCount: Number(formData.shortAnswerQuestionsCount) || 0,
            fillInTheBlankQuestionsCount: Number(formData.fillInTheBlankQuestionsCount) || 0,
            trueFalseQuestionsCount: Number(formData.trueFalseQuestionsCount) || 0,
            matchingQuestionsCount: Number(formData.matchingQuestionsCount) || 0,
            orderingQuestionsCount: Number(formData.orderingQuestionsCount) || 0,
            scheduledStart: formData.scheduledStart
              ? toISODateOrNull(formData.scheduledStart)
              : null,
            scheduledEnd: formData.scheduledEnd
              ? toISODateOrNull(formData.scheduledEnd)
              : null,
            startDate: formData.scheduledStart
              ? toISODateOrNull(formData.scheduledStart)
              : null,
            endDate: formData.scheduledEnd
              ? toISODateOrNull(formData.scheduledEnd)
              : null,
          };
          console.log('FULL DATA BEING SENT:', JSON.stringify(minimalExamData, null, 2));
          createExamMutation.mutate(minimalExamData);
        } else {
          toast.error('Please fill in all required fields');
        }
      };

  const handleEditExam = (exam) => {
    setEditingTest(exam);
    const formatDateTimeLocal = (isoString) => {
      try {
        const d = new Date(isoString);
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
      } catch (_) {
        return '';
      }
    };
    setFormData({
      title: exam.title,
      description: exam.description || '',
      examCategoryId: exam.examCategoryId || exam.categoryId || '',
      duration: exam.duration || 60,
      questionsCount: exam.questionsCount || exam.totalQuestions || 20,
      totalMarks: exam.totalMarks || 100,
      passingMarks: exam.passingMarks ?? 70,
      difficulty: exam.difficulty || 'EASY',
      status: exam.status || 'DRAFT',
      instructions: exam.instructions || '',
      allowRetakes: exam.allowRetakes || false,
      maxRetakes: exam.maxRetakes || 0,
      isPublic: exam.isPublic || false,
      scheduledStart: exam.scheduledStart ? formatDateTimeLocal(exam.scheduledStart) : '',
      scheduledEnd: exam.scheduledEnd ? formatDateTimeLocal(exam.scheduledEnd) : '',
      price: exam.price || 0,
      currency: exam.currency || 'USD',
      showResults: exam.showResults !== undefined ? exam.showResults : true,
      showAnswers: exam.showAnswers || false,
      randomizeQuestions: exam.randomizeQuestions !== undefined ? exam.randomizeQuestions : true,
      randomizeOptions: exam.randomizeOptions !== undefined ? exam.randomizeOptions : true,
      questionOverlapPercentage: exam.questionOverlapPercentage || 10.0,
      // Question type distribution
      essayQuestionsCount: exam.essayQuestionsCount || 0,
      multipleChoiceQuestionsCount: exam.multipleChoiceQuestionsCount || 0,
      shortAnswerQuestionsCount: exam.shortAnswerQuestionsCount || 0,
      fillInTheBlankQuestionsCount: exam.fillInTheBlankQuestionsCount || 0,
      trueFalseQuestionsCount: exam.trueFalseQuestionsCount || 0,
      matchingQuestionsCount: exam.matchingQuestionsCount || 0,
      orderingQuestionsCount: exam.orderingQuestionsCount || 0
    });
    setShowAddModal(true);
  };

  const handleUpdateExam = () => {
    if (formData.title && formData.examCategoryId) {
      console.log('Update validation passed, cleaning data...');
      
      // Use correct field names based on existing exam structure
      const computedTotalMarks = Number(formData.totalMarks || 0);
      const computedPassingMarks = Math.min(
        computedTotalMarks,
        Math.max(0, Number(formData.passingMarks || 0))
      );

      const toISODateOrNull = (dateTimeLocal) =>
        dateTimeLocal ? new Date(dateTimeLocal).toISOString() : null;

                const minimalExamData = {
            title: formData.title,
            description: formData.description || undefined,
            examCategoryId: formData.examCategoryId,
            duration: Number(formData.duration) || 60,
            totalMarks: computedTotalMarks || 100,
            passingMarks: computedPassingMarks,
            maxRetakes: Number(formData.maxRetakes) || 0,
            allowRetakes: formData.allowRetakes || false,
            showResults: formData.showResults !== undefined ? formData.showResults : true,
            showAnswers: formData.showAnswers || false,
            randomizeQuestions: formData.randomizeQuestions !== undefined ? formData.randomizeQuestions : true,
            randomizeOptions: formData.randomizeOptions !== undefined ? formData.randomizeOptions : true,
            questionOverlapPercentage: Number(formData.questionOverlapPercentage) || 10.0,
            price: parseFloat(formData.price) || 0,
            createdBy: currentUser?.id,
            // total questions + per-type distribution
            totalQuestions: Number(formData.questionsCount) || 0,
            essayQuestionsCount: Number(formData.essayQuestionsCount) || 0,
            multipleChoiceQuestionsCount: Number(formData.multipleChoiceQuestionsCount) || 0,
            shortAnswerQuestionsCount: Number(formData.shortAnswerQuestionsCount) || 0,
            fillInTheBlankQuestionsCount: Number(formData.fillInTheBlankQuestionsCount) || 0,
            trueFalseQuestionsCount: Number(formData.trueFalseQuestionsCount) || 0,
            matchingQuestionsCount: Number(formData.matchingQuestionsCount) || 0,
            orderingQuestionsCount: Number(formData.orderingQuestionsCount) || 0,
            scheduledStart: formData.scheduledStart
              ? toISODateOrNull(formData.scheduledStart)
              : null,
            scheduledEnd: formData.scheduledEnd
              ? toISODateOrNull(formData.scheduledEnd)
              : null,
            startDate: formData.scheduledStart
              ? toISODateOrNull(formData.scheduledStart)
              : null,
            endDate: formData.scheduledEnd
              ? toISODateOrNull(formData.scheduledEnd)
              : null,
          };
      console.log('Clean update data being sent to backend:', minimalExamData);
      updateExamMutation.mutate({ examId: editingTest.id, examData: minimalExamData });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePublishExam = (examId, action) => {
    publishExamMutation.mutate({ examId, action });
  };

  const allExams = examsData?.data?.data?.exams || examsData?.data?.exams || [];
  const categories = Array.isArray(categoriesData?.data?.data) ? categoriesData.data.data : [];
  
  // Debug: Log first exam structure to see available fields
  if (allExams.length > 0) {
    console.log('First exam structure:', allExams[0]);
  }
  
  // Client-side filtering as fallback
  const filteredExams = allExams.filter(exam => {
    // Search filter
    const matchesSearch = !searchTerm || 
      exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      exam.examCategoryId === selectedCategory;
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || 
      exam.status === selectedStatus;
    
    // Difficulty filter
    const matchesDifficulty = selectedDifficulty === 'all' || 
      exam.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
  });
  
  console.log('Filtering debug:', {
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedDifficulty,
    totalExams: allExams.length,
    filteredExams: filteredExams.length
  });

  if (examsLoading || categoriesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--secondary-600)' }}>
          {examsLoading ? 'Loading exams...' : 'Loading categories...'}
        </div>
      </div>
    );
  }

  if (examsError || categoriesError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--danger-600)' }}>
          {examsError ? 'Error loading exams' : 'Error loading categories'}
        </div>
        <div style={{ fontSize: '16px', color: 'var(--secondary-600)', marginTop: '8px' }}>
          {examsError?.message || categoriesError?.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">
            Exams Management
            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedDifficulty !== 'all') && (
              <span style={{ fontSize: '14px', color: 'var(--secondary-600)', fontWeight: 'normal', marginLeft: '8px' }}>
                ({filteredExams.length} of {allExams.length} exams)
              </span>
            )}
          </h2>
          <div className="data-table-actions">
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            />
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
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
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
            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedDifficulty !== 'all') && (
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedDifficulty('all');
                }}
                style={{ marginRight: '8px' }}
              >
                Clear Filters
              </button>
            )}
            <button 
              className="group relative flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 active:scale-95 transform transition-all duration-300 ease-out"
              style={{ 
                padding: '12px', 
                marginRight: '12px',
                background: viewMode === 'table' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                boxShadow: '0 4px 15px 0 rgba(31, 38, 135, 0.37)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.18)'
              }}
              onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
              title={viewMode === 'table' ? 'Switch to Card View' : 'Switch to Table View'}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
              {viewMode === 'table' ? (
                <FiGrid className="w-5 h-5 relative z-10 transform group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <FiList className="w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
            <button 
              className="btn btn-primary"
              style={{
                opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
              }}
              onClick={() => {
                if (currentUser?.role === 'MODERATOR') {
                  toast.error('Access restricted for your role');
                  return;
                }
                setEditingTest(null);
                setFormData({
                  title: '',
                  description: '',
                  examCategoryId: '',
                  duration: 60,
                  questionsCount: 100,
                  totalMarks: 100,
                  passingMarks: 70,
                  difficulty: 'EASY',
                  status: 'DRAFT',
                  instructions: '',
                  maxRetakes: 0,
                  isPublic: false,
                  scheduledStart: '',
                  scheduledEnd: '',
                  price: 0,
                  currency: 'USD',
                  // Question type distribution
                  essayQuestionsCount: 0,
                  multipleChoiceQuestionsCount: 0,
                  shortAnswerQuestionsCount: 0,
                  fillInTheBlankQuestionsCount: 0,
                  trueFalseQuestionsCount: 0,
                  matchingQuestionsCount: 0,
                  orderingQuestionsCount: 0
                });
                setShowAddModal(true);
              }}
              title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
            >
              <FiPlus style={{ marginRight: '4px' }} /> Add Exam
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="data-table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Difficulty</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--secondary-900)' }}>
                        {exam.title}
                      </div>
                      {exam.description && (
                        <div style={{ fontSize: '12px', color: 'var(--secondary-600)', marginTop: '4px' }}>
                          {exam.description.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {categories.find(c => c.id === exam.examCategoryId)?.name || exam.examCategory?.name || 'Unknown'}
                      </span>
                    </td>
                    <td>{exam.duration} min</td>
                    <td>{exam.totalMarks || exam.questionsCount || exam.totalQuestions || 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        exam.difficulty === 'EASY' ? 'badge-success' :
                        exam.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {exam.difficulty || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: exam.price > 0 ? 'var(--success-600)' : 'var(--secondary-600)' }}>
                        {exam.currency || 'USD'} {exam.price || 0}
                      </div>
                      {exam.price > 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--secondary-500)' }}>
                          Paid Exam
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        exam.status === 'PUBLISHED' ? 'badge-success' :
                        exam.status === 'DRAFT' ? 'badge-warning' : 'badge-secondary'
                      }`}>
                        {exam.status || 'N/A'}
                      </span>
                    </td>
                    <td>{exam.attemptsCount || 0}</td>
                    <td>{new Date(exam.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="data-table-actions-cell">
                        <button 
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '12px',
                            opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                            cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => {
                            if (currentUser?.role === 'MODERATOR') {
                              toast.error('Access restricted for your role');
                              return;
                            }
                            handleEditExam(exam);
                          }}
                          title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
                        >
                          <FiEdit style={{ marginRight: '4px' }} /> Edit
                        </button>
                        {exam.status === 'DRAFT' ? (
                          <button 
                            className="btn btn-success" 
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '12px',
                              opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                              cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => {
                              if (currentUser?.role === 'MODERATOR') {
                                toast.error('Access restricted for your role');
                                return;
                              }
                              handlePublishExam(exam.id, 'publish');
                            }}
                            title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
                          >
                            <FiUpload style={{ marginRight: '4px' }} /> Publish
                          </button>
                        ) : exam.status === 'PUBLISHED' ? (
                          <button 
                            className="btn btn-warning" 
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '12px',
                              opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                              cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => {
                              if (currentUser?.role === 'MODERATOR') {
                                toast.error('Access restricted for your role');
                                return;
                              }
                              handlePublishExam(exam.id, 'unpublish');
                            }}
                            title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
                          >
                            <FiDownload style={{ marginRight: '4px' }} /> Unpublish
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: '24px', padding: '24px' }}
          >
            {filteredExams.map((exam) => (
              <div 
                key={exam.id} 
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out overflow-hidden border border-gray-100"
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Gradient Overlay */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                {/* Card Content */}
                <div style={{ padding: '24px' }}>
                  {/* Header Section */}
                  <div className="flex justify-between items-start" style={{ marginBottom: '16px' }}>
                    <div className="flex-1" style={{ marginRight: '12px' }}>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200" style={{ marginBottom: '8px' }}>
                        {exam.title}
                      </h3>
                      {exam.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {exam.description.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div 
                      className={`inline-flex items-center rounded-full text-xs font-semibold ${
                        exam.difficulty === 'EASY' 
                          ? 'bg-green-100 text-green-800 border border-green-200' :
                        exam.difficulty === 'MEDIUM' 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                      style={{ padding: '4px 12px' }}
                    >
                      {exam.difficulty || 'N/A'}
                    </div>
                  </div>

                  {/* Badges Section */}
                  <div className="flex flex-wrap" style={{ gap: '8px', marginBottom: '16px' }}>
                    <span 
                      className="inline-flex items-center rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      style={{ padding: '4px 12px' }}
                    >
                      {categories.find(c => c.id === exam.examCategoryId)?.name || exam.examCategory?.name || 'Unknown'}
                    </span>
                    <span 
                      className={`inline-flex items-center rounded-full text-xs font-medium border ${
                        exam.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800 border-green-200' :
                        exam.status === 'DRAFT' 
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                      style={{ padding: '4px 12px' }}
                    >
                      {exam.status || 'N/A'}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2" style={{ gap: '12px', marginBottom: '16px' }}>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-100" style={{ padding: '12px' }}>
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide" style={{ marginBottom: '4px' }}>Duration</div>
                      <div className="text-lg font-bold text-blue-900">{exam.duration} min</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-100" style={{ padding: '12px' }}>
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide" style={{ marginBottom: '4px' }}>Questions</div>
                      <div className="text-lg font-bold text-purple-900">{exam.totalMarks || exam.questionsCount || exam.totalQuestions || 'N/A'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-100" style={{ padding: '12px' }}>
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide" style={{ marginBottom: '4px' }}>Attempts</div>
                      <div className="text-lg font-bold text-green-900">{exam.attemptsCount || 0}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-xl border border-orange-100" style={{ padding: '12px' }}>
                      <div className="text-xs font-medium text-orange-600 uppercase tracking-wide" style={{ marginBottom: '4px' }}>Price</div>
                      <div className="text-lg font-bold text-orange-900">
                        {exam.currency || 'USD'} {exam.price || 0}
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="border-t border-gray-100" style={{ paddingTop: '16px' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                      <span className="text-xs text-gray-500">
                        Created {new Date(exam.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex" style={{ gap: '8px' }}>
                      <button 
                        className="flex-1 inline-flex items-center justify-center text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                        style={{
                          padding: '8px 12px',
                          opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                          cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => {
                          if (currentUser?.role === 'MODERATOR') {
                            toast.error('Access restricted for your role');
                            return;
                          }
                          handleEditExam(exam);
                        }}
                        title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
                      >
                        <FiEdit className="w-4 h-4" style={{ marginRight: '4px' }} />
                        Edit
                      </button>
                      {exam.status === 'DRAFT' ? (
                        <button 
                          className="flex-1 inline-flex items-center justify-center text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          style={{
                            padding: '8px 12px',
                            opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                            cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => {
                            if (currentUser?.role === 'MODERATOR') {
                              toast.error('Access restricted for your role');
                              return;
                            }
                            handlePublishExam(exam.id, 'publish');
                          }}
                          title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
                        >
                          <FiUpload className="w-4 h-4" style={{ marginRight: '4px' }} />
                          Publish
                        </button>
                      ) : exam.status === 'PUBLISHED' ? (
                        <button 
                          className="flex-1 inline-flex items-center justify-center text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg hover:from-orange-600 hover:to-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          style={{
                            padding: '8px 12px',
                            opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                            cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => {
                            if (currentUser?.role === 'MODERATOR') {
                              toast.error('Access restricted for your role');
                              return;
                            }
                            handlePublishExam(exam.id, 'unpublish');
                          }}
                          title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
                        >
                          <FiDownload className="w-4 h-4" style={{ marginRight: '4px' }} />
                          Unpublish
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredExams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-600)' }}>
            No exams found
          </div>
        )}
      </div>

      {/* Add/Edit Exam Modal */}
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
              {editingTest ? 'Edit Exam' : 'Add New Exam'}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Exam Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Category *
                  </label>
                  <select
                    value={formData.examCategoryId}
                    onChange={(e) => setFormData({ ...formData, examCategoryId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">Select Category</option>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No categories available</option>
                    )}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
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
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.questionsCount}
                    onChange={(e) => setFormData({ ...formData, questionsCount: parseInt(e.target.value) || 20 })}
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
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 100 })}
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
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) || 70 })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Allow Retakes
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="allowRetakes"
                      checked={formData.allowRetakes}
                      onChange={(e) => setFormData({ ...formData, allowRetakes: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label htmlFor="allowRetakes" style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                      Enable retakes for this exam
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Max Retakes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.maxRetakes}
                    onChange={(e) => setFormData({ ...formData, maxRetakes: Math.min(parseInt(e.target.value) || 0, 10) })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                  <small style={{ fontSize: '12px', color: 'var(--secondary-500)', marginTop: '4px', display: 'block' }}>
                    Maximum allowed: 10 retakes (0 = unlimited)
                  </small>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Exam Settings */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--primary-600)' }}>
                  Exam Settings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Show Results
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="showResults"
                        checked={formData.showResults}
                        onChange={(e) => setFormData({ ...formData, showResults: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <label htmlFor="showResults" style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                        Show results after completion
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Show Answers
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="showAnswers"
                        checked={formData.showAnswers}
                        onChange={(e) => setFormData({ ...formData, showAnswers: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <label htmlFor="showAnswers" style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                        Show correct answers
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Randomize Questions
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="randomizeQuestions"
                        checked={formData.randomizeQuestions}
                        onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <label htmlFor="randomizeQuestions" style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                        Randomize question order
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Randomize Options
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="randomizeOptions"
                        checked={formData.randomizeOptions}
                        onChange={(e) => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <label htmlFor="randomizeOptions" style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                        Randomize option order
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Question Overlap %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.questionOverlapPercentage}
                      onChange={(e) => setFormData({ ...formData, questionOverlapPercentage: parseFloat(e.target.value) || 10.0 })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--secondary-300)',
                        borderRadius: '6px'
                      }}
                    />
                    <small style={{ fontSize: '12px', color: 'var(--secondary-500)', marginTop: '4px', display: 'block' }}>
                      Percentage of questions that can overlap between attempts
                    </small>
                  </div>
                </div>
              </div>

              {/* Question Type Distribution */}
              <div>
                <h4 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--primary-600)' }}>
                  Question Type Distribution
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Essay Questions
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.essayQuestionsCount}
                      onChange={(e) => setFormData({ ...formData, essayQuestionsCount: parseInt(e.target.value) || 0 })}
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
                      Multiple Choice
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.multipleChoiceQuestionsCount}
                      onChange={(e) => setFormData({ ...formData, multipleChoiceQuestionsCount: parseInt(e.target.value) || 0 })}
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
                      Short Answer
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.shortAnswerQuestionsCount}
                      onChange={(e) => setFormData({ ...formData, shortAnswerQuestionsCount: parseInt(e.target.value) || 0 })}
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
                      Fill in the Blank
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.fillInTheBlankQuestionsCount}
                      onChange={(e) => setFormData({ ...formData, fillInTheBlankQuestionsCount: parseInt(e.target.value) || 0 })}
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
                      True/False
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.trueFalseQuestionsCount}
                      onChange={(e) => setFormData({ ...formData, trueFalseQuestionsCount: parseInt(e.target.value) || 0 })}
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
                      Matching
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.matchingQuestionsCount}
                      onChange={(e) => setFormData({ ...formData, matchingQuestionsCount: parseInt(e.target.value) || 0 })}
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
                      Ordering
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.orderingQuestionsCount}
                      onChange={(e) => setFormData({ ...formData, orderingQuestionsCount: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--secondary-300)',
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                </div>
                
                {/* Total validation */}
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  backgroundColor: (() => {
                    const total = formData.essayQuestionsCount + formData.multipleChoiceQuestionsCount + 
                                 formData.shortAnswerQuestionsCount + formData.fillInTheBlankQuestionsCount + 
                                 formData.trueFalseQuestionsCount + formData.matchingQuestionsCount + 
                                 formData.orderingQuestionsCount;
                    if (total === formData.questionsCount) {
                      return 'var(--success-100)';
                    } else if (total > formData.questionsCount) {
                      return 'var(--error-100)';
                    } else {
                      return 'var(--warning-100)';
                    }
                  })(),
                  color: (() => {
                    const total = formData.essayQuestionsCount + formData.multipleChoiceQuestionsCount + 
                                 formData.shortAnswerQuestionsCount + formData.fillInTheBlankQuestionsCount + 
                                 formData.trueFalseQuestionsCount + formData.matchingQuestionsCount + 
                                 formData.orderingQuestionsCount;
                    if (total === formData.questionsCount) {
                      return 'var(--success-600)';
                    } else if (total > formData.questionsCount) {
                      return 'var(--error-600)';
                    } else {
                      return 'var(--warning-600)';
                    }
                  })(),
                  border: '1px solid',
                  borderColor: (() => {
                    const total = formData.essayQuestionsCount + formData.multipleChoiceQuestionsCount + 
                                 formData.shortAnswerQuestionsCount + formData.fillInTheBlankQuestionsCount + 
                                 formData.trueFalseQuestionsCount + formData.matchingQuestionsCount + 
                                 formData.orderingQuestionsCount;
                    if (total === formData.totalQuestions) {
                      return 'var(--success-300)';
                    } else if (total > formData.totalQuestions) {
                      return 'var(--error-300)';
                    } else {
                      return 'var(--warning-300)';
                    }
                  })()
                }}>
                  <strong>Total:</strong> {formData.essayQuestionsCount + formData.multipleChoiceQuestionsCount + 
                                          formData.shortAnswerQuestionsCount + formData.fillInTheBlankQuestionsCount + 
                                          formData.trueFalseQuestionsCount + formData.matchingQuestionsCount + 
                                          formData.orderingQuestionsCount} / {formData.questionsCount} questions
                  {(() => {
                    const total = formData.essayQuestionsCount + formData.multipleChoiceQuestionsCount + 
                                 formData.shortAnswerQuestionsCount + formData.fillInTheBlankQuestionsCount + 
                                 formData.trueFalseQuestionsCount + formData.matchingQuestionsCount + 
                                 formData.orderingQuestionsCount;
                    if (total === formData.questionsCount) {
                      return ' Perfect match!';
                    } else if (total > formData.questionsCount) {
                                              return ' Too many questions specified';
                    } else {
                                              return ' Some questions will be randomly selected';
                    }
                  })()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledStart}
                    onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
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
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledEnd}
                    onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor="isPublic" style={{ fontWeight: '500' }}>
                    Public Exam
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  placeholder="Instructions for students taking this exam..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={createExamMutation.isPending || updateExamMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={editingTest ? handleUpdateExam : handleAddExam}
                disabled={createExamMutation.isPending || updateExamMutation.isPending}
              >
                {createExamMutation.isPending || updateExamMutation.isPending ? 'Saving...' : (editingTest ? 'Update Exam' : 'Add Exam')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests; 