import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content area - responsive padding */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
};
