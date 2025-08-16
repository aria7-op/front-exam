import React from 'react';

const DarkModeDemo = () => {
  return (
    <div className="dark-mode-demo p-6 rounded-lg border-2 border-dashed">
      <h2 className="text-2xl font-bold mb-4">Dark Mode Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Sample Card 1</h3>
            <div className="dashboard-card-icon primary">📊</div>
          </div>
          <div className="dashboard-card-value">1,234</div>
          <p className="dashboard-card-description">
            This card demonstrates how dark mode affects dashboard components.
          </p>
        </div>

        {/* Card 2 */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Sample Card 2</h3>
            <div className="dashboard-card-icon success">✅</div>
          </div>
          <div className="dashboard-card-value">567</div>
          <p className="dashboard-card-description">
            Notice how colors automatically adapt to the current theme.
          </p>
        </div>

        {/* Card 3 */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Sample Card 3</h3>
            <div className="dashboard-card-icon warning">⚠️</div>
          </div>
          <div className="dashboard-card-value">89</div>
          <p className="dashboard-card-description">
            All components use CSS variables for consistent theming.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Form Elements Demo</h3>
        <div className="form-container max-w-2xl">
          <div className="form-group">
            <label className="form-label">Sample Input</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="This input adapts to dark mode"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sample Select</label>
            <select className="form-select">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sample Textarea</label>
            <textarea 
              className="form-textarea" 
              placeholder="This textarea also adapts to dark mode"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Badges Demo</h3>
        <div className="flex flex-wrap gap-4">
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-danger">Danger</span>
          <span className="badge badge-secondary">Secondary</span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Table Demo</h3>
        <div className="data-table-container">
          <div className="data-table-header">
            <h3 className="data-table-title">Sample Data Table</h3>
            <div className="data-table-actions">
              <button className="btn btn-primary btn-sm">Add New</button>
            </div>
          </div>
          <div className="data-table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td><span className="badge badge-success">Active</span></td>
                  <td>2024-01-15</td>
                  <td className="data-table-actions-cell">
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td><span className="badge badge-warning">Pending</span></td>
                  <td>2024-01-14</td>
                  <td className="data-table-actions-cell">
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          🎉 Dark Mode is Working!
        </h3>
        <p className="text-blue-700 dark:text-blue-300">
          Toggle the dark mode switch in the settings sidebar to see all components 
          automatically adapt to the new theme. The dark mode state is persisted 
          in localStorage and will be remembered across browser sessions.
        </p>
      </div>
    </div>
  );
};

export default DarkModeDemo;
