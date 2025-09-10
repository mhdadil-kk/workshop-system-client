import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Car, 
  UserCheck, 
  Wrench, 
  FileText,
  Menu,
  X,
  LogOut,
  Settings,
  Bell
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['admin']
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <UserCheck size={20} />,
      roles: ['admin']
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: <Car size={20} />,
      roles: ['admin']
    },
    {
      id: 'orders',
      label: 'Orders',
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/60 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-sm"></div>
          <div className="flex items-center relative z-10">
            <div className="relative group">
              <div className="absolute -inset-2 bg-white/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white/10 p-2 rounded-xl border border-white/20">
                <Wrench className="h-7 w-7 text-white transform group-hover:rotate-12 transition-all duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-lg"></div>
            </div>
            <div className="ml-4">
              <span className="text-white text-xl font-bold tracking-tight">WorkShop Pro</span>
              <div className="text-blue-100 text-xs font-medium opacity-90">Management System</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden relative z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/50 border-b border-gray-200/60">
          <div className="flex items-center group">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-blue-100/50 group-hover:ring-blue-200/70 transition-all duration-300">
                <span className="text-white font-bold text-base">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{user?.name}</p>
              <div className="flex items-center mt-1">
                <div className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`group w-full flex items-center px-4 py-3.5 text-left rounded-xl transition-all duration-200 animate-slide-in ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 scale-[1.02]'
                  : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-md hover:scale-[1.01]'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm'
              }`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
              </div>
              <span className="ml-4 font-semibold text-sm tracking-wide">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-sm">
              <Settings size={18} />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-sm relative">
              <Bell size={18} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </button>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 hover:shadow-md group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors duration-200">
              <LogOut size={16} />
            </div>
            <span className="ml-3 font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">WorkShop Pro</h1>
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 relative">
              <Bell size={18} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gradient-to-br from-slate-50/50 via-blue-50/20 to-indigo-50/10">
          <div className="animate-fade-in">
            {React.cloneElement(children as React.ReactElement, { activeTab })}
          </div>
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-in border border-gray-200/60">
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-6 shadow-lg">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Sign Out Confirmation
              </h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                Are you sure you want to sign out? You'll need to enter your credentials again to access your account.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;