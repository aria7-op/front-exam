import React, { useState } from 'react';

const Departments = () => {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: 'Engineering',
      description: 'Software development and technical operations',
      manager: 'John Doe',
      employeeCount: 12,
      status: 'active'
    },
    {
      id: 2,
      name: 'Marketing',
      description: 'Marketing and communications',
      manager: 'Jane Smith',
      employeeCount: 8,
      status: 'active'
    },
    {
      id: 3,
      name: 'Human Resources',
      description: 'HR and employee management',
      manager: 'Mike Johnson',
      employeeCount: 5,
      status: 'active'
    }
  ]);

  const [newDepartment, setNewDepartment] = useState({ name: '', description: '', manager: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDepartment.name.trim()) return;
    
    const department = {
      id: Date.now(),
      name: newDepartment.name,
      description: newDepartment.description,
      manager: newDepartment.manager,
      employeeCount: 0,
      status: 'active'
    };
    
    setDepartments([...departments, department]);
    setNewDepartment({ name: '', description: '', manager: '' });
    setShowAddForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Departments</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add Department'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddDepartment} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Department name"
              value={newDepartment.name}
              onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="text"
              placeholder="Manager name"
              value={newDepartment.manager}
              onChange={(e) => setNewDepartment({...newDepartment, manager: e.target.value})}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Description"
              value={newDepartment.description}
              onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 md:col-span-2"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Department
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
        {departments.map(department => (
          <div key={department.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{department.name}</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                {department.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{department.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Manager:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{department.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Employees:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{department.employeeCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments; 