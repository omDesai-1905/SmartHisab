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
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        currentPage={currentPage}
      />
      
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
