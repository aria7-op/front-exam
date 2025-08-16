import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-red-50 dark:bg-gray-900 rounded-lg shadow-md border border-red-200 dark:border-red-700 animate-fade-in">
      <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
      </svg>
      <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">An unexpected error occurred. Please try again or contact support if the problem persists.</p>
      {error && (
        <details className="mb-4 w-full max-w-md text-xs bg-red-100 dark:bg-gray-800 p-2 rounded">
          <summary className="cursor-pointer text-red-500">Error details</summary>
          <pre className="whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200">{error.message}</pre>
        </details>
      )}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={resetErrorBoundary}
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorFallback;