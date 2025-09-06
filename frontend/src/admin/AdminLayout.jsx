import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/users', label: 'All Users' },
    { path: '/admin/messages', label: 'User Messages' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-[1000] h-[60px]">
        <div className="w-full h-full flex justify-between items-center px-[20px] md:px-[15px] sm:px-[10px">
          <div className="flex items-center gap-[15px]">
            <button 
              className="lg:hidden bg-none border-none text-[18px] cursor-pointer p-2 rounded hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="text-blue-800 font-bold text-[20px] md:text-[18px] sm:text-[16px] m-0" style={{ marginLeft: '20px' }}>SmartHisab Admin</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm hidden lg:block">smarthisab@admin.com</span>
            <button onClick={handleLogout} className="h-[40px] w-[80px] bg-red-500 text-white rounded-[10px] cursor-pointer transition-colors duration-200 px-4 py-2 text-sm md:px-3 md:py-1.5 md:text-xs sm:px-2 sm:py-1 sm:text-[11px] hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative mt-[60px] min-h-[calc(100vh-60px)]" style={{ position: 'relative', marginTop: '60px', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <aside className={`fixed top-[60px] h-[calc(100vh-60px)] bg-white border-r border-gray-200
              overflow-y-auto transition-left duration-300 ease-in-out z-[999]
              ${sidebarOpen ? "left-0" : "-left-[250px]"}
              w-[250px] lg:left-0 lg:w-[250px] md:w-[280px] sm:w-full`}>
          <div className="p-5 border-b border-gray-200 flex justify-between items-center hidden">
            <h2 className="text-gray-800 text-[18px] font-semibold m-0">Navigation</h2>
            <button 
              className="bg-none border-none text-[24px] text-gray-400 cursor-pointer p-0 w-[30px] h-[30px] flex items-center justify-center hover:text-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`h-[50px] w-full px-5 py-3 text-left text-[16px] text-gray-600 border-none bg-none 
               border-l-4 border-transparent cursor-pointer transition-all duration-200 
               hover:bg-gray-100 hover:text-gray-800 ${isActive(item.path) ? 'bg-blue-100 text-blue-500 border-blue-500 font-medium ' : 'text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-800'}`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed top-[60px] left-0 right-0 bottom-0 bg-black/50 z-[998] hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="admin-main">
          {children}
        </main>
      </div>

      <style jsx>{`
        .admin-main {
          padding: 30px;
          min-height: calc(100vh - 60px);
          margin-left: 0;
          transition: margin-left 0.3s ease;
          background-color: #f7fafc;
        }

        @media (min-width: 1024px) {


          .admin-main {
            margin-left: 250px;
            padding: 30px;
          }
        }
        @media (max-width: 768px) {

          .admin-main {
            padding: 15px;
          }
        }
        @media (max-width: 480px) {

          .admin-main {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
