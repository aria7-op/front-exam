import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit } from 'react-icons/fi';

const Categories = () => {
  console.log('🚀 Categories component is loading...');
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    color: '#3B82F6',
    icon: '📚'
  });

  // Fetch all categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['admin-categories', searchTerm],
    queryFn: () => {
      console.log('🔍 Fetching admin categories...');
      return adminAPI.getAllCategories();
    },
    refetchInterval: 30000,
    staleTime: 0,
    cacheTime: 0
  });

  console.log('📊 Categories Component Debug:', {
    categoriesData,
    categoriesLoading,
    categoriesError,
    categories: categoriesData?.data?.data?.categories || []
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => adminAPI.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      toast.success('Category created successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        status: 'ACTIVE',
        color: '#3B82F6',
        icon: '📚'
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, categoryData }) => adminAPI.updateCategory(categoryId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      toast.success('Category updated successfully!');
      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        status: 'ACTIVE',
        color: '#3B82F6',
        icon: '📚'
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  });

  const handleAddCategory = () => {
    if (formData.name.trim()) {
      createCategoryMutation.mutate(formData);
    } else {
      toast.error('Please enter a category name');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      status: category.status || 'ACTIVE',
      color: category.color || '#3B82F6',
      icon: category.icon || '📚'
    });
    setShowAddModal(true);
  };

  const handleUpdateCategory = () => {
    if (formData.name.trim() && editingCategory) {
      updateCategoryMutation.mutate({ categoryId: editingCategory.id, categoryData: formData });
    } else {
      toast.error('Please enter a category name');
    }
  };

  const categories = categoriesData?.data?.data?.categories || [];
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('🔍 Filtering Debug:', {
    searchTerm,
    totalCategories: categories.length,
    filteredCategories: filteredCategories.length,
    categories: categories.map(c => c.name)
  });

  const iconOptions = [
    '📚', '💻', '🧮', '🔬', '📝', '🎨', '🌍', '🏥', '⚖️', '💰', 
    '🚗', '🏠', '🍽️', '👕', '📱', '🎮', '🎵', '🎬', '📺', '📰',
    '🎓', '📖', '✏️', '📊', '🔍', '⚗️', '🧪', '🔬', '📐', '🧮',
    '🌐', '🗺️', '📈', '📉', '🎯', '🏆', '🥇', '🥈', '🥉', '📋',
    '🔬', '🧬', '⚡', '💡', '🔋', '🔌', '💻', '🖥️', '⌨️', '🖱️',
    '📱', '📞', '📧', '🌐', '🔗', '📎', '📌', '📍', '🎪', '🎭'
  ];

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  if (categoriesLoading) {
    console.log('⏳ Categories are loading...');
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--secondary-600)' }}>Loading categories...</div>
      </div>
    );
  }

  if (categoriesError) {
    console.log('❌ Categories error:', categoriesError);
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--danger-600)' }}>Error loading categories</div>
        <div style={{ fontSize: '16px', color: 'var(--secondary-600)', marginTop: '8px' }}>
          {categoriesError.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Categories Management</h2>
          <div className="data-table-actions">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            />
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
                setEditingCategory(null);
                setFormData({
                  name: '',
                  description: '',
                  status: 'ACTIVE',
                  color: '#3B82F6',
                  icon: '📚'
                });
                setShowAddModal(true);
              }}
              title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
            >
                             <FiPlus style={{ marginRight: '4px' }} /> Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {console.log('🎨 Rendering categories:', filteredCategories.length, filteredCategories.map(c => c.name))}
          {filteredCategories.map((category) => (
            <div key={category.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '2px solid var(--secondary-200)',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}>
              {/* Category Header */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  fontSize: '32px',
                  marginRight: '12px',
                  color: category.color || '#3B82F6'
                }}>
                  {category.icon || '📚'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    margin: 0,
                    color: 'var(--secondary-900)'
                  }}>
                    {category.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      color: 'var(--secondary-500)', 
                      fontFamily: 'monospace',
                      backgroundColor: 'var(--secondary-100)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      ID: {category.id}
                    </span>
                    <span className={`badge ${
                      category.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'
                    }`} style={{ fontSize: '12px' }}>
                      {category.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Description */}
              <p style={{ 
                color: 'var(--secondary-600)', 
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                {category.description || 'No description provided'}
              </p>

              {/* Category Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary-600)' }}>
                    {category.examsCount || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>Tests</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--success-600)' }}>
                    {category.questionsCount || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--secondary-600)' }}>Questions</div>
                </div>
              </div>

              {/* Category Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    fontSize: '12px',
                    opacity: currentUser?.role === 'MODERATOR' ? 0.5 : 1,
                    cursor: currentUser?.role === 'MODERATOR' ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    if (currentUser?.role === 'MODERATOR') {
                      toast.error('Access restricted for your role');
                      return;
                    }
                    handleEditCategory(category);
                  }}
                  title={currentUser?.role === 'MODERATOR' ? 'Access restricted for your role' : ''}
                >
                                     <FiEdit style={{ marginRight: '4px' }} /> Edit
                </button>
              </div>

              {/* Created Date */}
              <div style={{ 
                fontSize: '11px', 
                color: 'var(--secondary-500)', 
                marginTop: '12px',
                textAlign: 'center'
              }}>
                Created: {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-600)' }}>
            No categories found
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
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
            width: '600px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: formData.color === color ? '3px solid var(--secondary-900)' : '2px solid var(--secondary-300)',
                          backgroundColor: color,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Icon
                  </label>
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--secondary-300)', 
                    borderRadius: '8px', 
                    padding: '12px',
                    backgroundColor: 'var(--background-50)'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          style={{
                            fontSize: '24px',
                            padding: '8px',
                            borderRadius: '8px',
                            border: formData.icon === icon ? '2px solid var(--primary-500)' : '1px solid var(--secondary-300)',
                            backgroundColor: formData.icon === icon ? 'var(--primary-50)' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 