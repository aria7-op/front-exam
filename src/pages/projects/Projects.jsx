import React, { useState } from 'react';

const Projects = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Smart Attendance System',
      description: 'AI-powered attendance and task tracking system',
      status: 'in-progress',
      progress: 75,
      startDate: '2024-01-01',
      endDate: '2024-03-01'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application',
      status: 'planning',
      progress: 25,
      startDate: '2024-02-01',
      endDate: '2024-05-01'
    }
  ]);

  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    
    const project = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      status: 'planning',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    };
    
    setProjects([...projects, project]);
    setNewProject({ name: '', description: '' });
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Projects</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProject} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Project
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div>Start: {project.startDate}</div>
              {project.endDate && <div>End: {project.endDate}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects; 