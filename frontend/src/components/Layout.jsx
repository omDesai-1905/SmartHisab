import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ children, currentPage = '' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        currentPage={currentPage}
      />
      
      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
