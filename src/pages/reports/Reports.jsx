import React, { useState } from 'react';
import { useReports } from '../../contexts/reports/ReportsContext';

const Reports = () => {
  const { reports, generateReport, exportReport, isLoading, error } = useReports();

  const [selectedReportType, setSelectedReportType] = useState('attendance');
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    await generateReport(selectedReportType);
    setShowGenerateForm(false);
  };

  const handleExportReport = async (reportId) => {
    await exportReport(reportId, 'pdf');
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'attendance': return '📊';
      case 'task': return '📋';
      case 'user': return '👥';
      case 'performance': return '📈';
      case 'analytics': return '📊';
      default: return '📄';
    }
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'attendance': return 'bg-blue-100 text-blue-800';
      case 'task': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'performance': return 'bg-yellow-100 text-yellow-800';
      case 'analytics': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Reports</h1>
        <button
          onClick={() => setShowGenerateForm(!showGenerateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showGenerateForm ? 'Cancel' : 'Generate Report'}
        </button>
      </div>

      {showGenerateForm && (
        <form onSubmit={handleGenerateReport} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="attendance">Attendance Report</option>
              <option value="task">Task Report</option>
              <option value="user">User Report</option>
              <option value="performance">Performance Report</option>
              <option value="analytics">Analytics Report</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={isLoading}
            >
              Generate Report
            </button>
            <button
              type="button"
              onClick={() => setShowGenerateForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Generated Reports</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {reports.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No reports generated yet. Click "Generate Report" to create your first report.
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getReportTypeIcon(report.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{report.title}</h3>
                    <p className="text-sm text-gray-500">
                      Generated on {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getReportTypeColor(report.type)}`}>
                    {report.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  <button
                    onClick={() => handleExportReport(report.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports; 