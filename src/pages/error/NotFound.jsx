import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <div className="space-y-4">
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-500"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 