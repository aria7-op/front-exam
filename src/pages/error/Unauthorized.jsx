import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-yellow-600 mb-4">401</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Unauthorized Access
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to access this page. Please log in to continue.
        </p>
      </div>

      <div className="space-y-4">
        <Link
          to="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-4"
        >
          Sign In
        </Link>
        <Link
          to="/"
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized; 