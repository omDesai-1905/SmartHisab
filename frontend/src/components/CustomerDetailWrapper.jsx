import React, { useState } from 'react';
import Navbar from './Navbar';
import CustomerDetail from './CustomerDetail';

function CustomerDetailWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <>
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <CustomerDetail sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </>
  );
}

export default CustomerDetailWrapper;
