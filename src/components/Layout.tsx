import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3, 
  Car, 
  UserCheck, 
  Wrench, 
  FileText,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['super_admin', 'admin']
    },
    {
      id: 'showrooms',
      label: 'Showrooms',
      icon: <Building2 size={20} />,
      roles: ['super_admin']
    },
    {
      id: 'admin-users',
      label: 'Admin Users',
      icon: <Users size={20} />,
      roles: ['super_admin']
    },
    {
      id: 'global-reports',
      label: 'Global Reports',
      icon: <BarChart3 size={20} />,
      roles: ['super_admin']
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: <Car size={20} />,
      roles: ['admin']
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <UserCheck size={20} />,
      roles: ['admin']
    },
    {
      id: 'services',
      label: 'Services',
      icon: <Wrench size={20} />,
      roles: ['admin']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText size={20} />,
      roles: ['admin']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center">
            <div className="relative">
              <Wrench className="h-8 w-8 text-white transform hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <span className="ml-3 text-white text-lg font-bold tracking-wide">WorkShop Pro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-blue-600 capitalize font-medium">
                {user?.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center px-3 py-2 mb-1 text-left rounded-lg transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-4 border-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <span className={`transition-colors duration-200 ${activeTab === item.id ? 'text-blue-700' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              <span className="ml-3 font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-3">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 hover:shadow-sm"
          >
            <LogOut size={20} />
            <span className="ml-3 font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden backdrop-blur-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 tracking-wide">WorkShop Pro</h1>
            <div></div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-50">
          {React.cloneElement(children as React.ReactElement, { activeTab })}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;