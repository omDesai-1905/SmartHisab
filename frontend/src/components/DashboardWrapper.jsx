import React, { useState } from 'react';
import Navbar from './Navbar';
import Dashboard from './Dashboard';

function DashboardWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <>
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <Dashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </>
  );
}

export default DashboardWrapper;
