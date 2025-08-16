import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Loading Mock Test System...</h2>
        <p>Please wait while we prepare your dashboard</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 