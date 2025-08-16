import React, { useState } from 'react';
import { useTask } from '../../contexts/tasks/TaskContext';

const Tasks = () => {
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    isLoading,
    error
  } = useTask();

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await createTask({ title: newTaskTitle });
    setNewTaskTitle('');
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Tasks</h1>
      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isLoading || !newTaskTitle.trim()}
        >
          Add
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">Task List</h2>
        {tasks.length === 0 ? (
          <div className="text-gray-500">No tasks found.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <li key={task.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{task.title}</span>
                  <span className="ml-2 text-xs text-gray-500">[{task.status}]</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => updateTask(task.id, { status: 'completed' })}
                    disabled={task.status === 'completed'}
                  >
                    Complete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Tasks;