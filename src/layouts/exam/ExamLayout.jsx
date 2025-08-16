import React from 'react';
import { Outlet } from 'react-router-dom';

const ExamLayout = () => {
  return (
    <div className="exam-layout">
      <Outlet />
    </div>
  );
};

export default ExamLayout; 