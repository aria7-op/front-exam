import React from 'react';
import { Link } from 'react-router-dom';

const ServerError = () => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Internal Server Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Something went wrong on our end. Please try again later.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-4"
        >
          Try Again
        </button>
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

export default ServerError; 