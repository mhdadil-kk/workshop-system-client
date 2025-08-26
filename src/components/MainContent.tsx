import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import ShowroomsManagement from './ShowroomsManagement';
import AdminUsersManagement from './AdminUsersManagement';
import GlobalReports from './GlobalReports';
import VehiclesManagement from './VehiclesManagement';
import CustomersManagement from './CustomersManagement';
import ServicesManagement from './ServicesManagement';
import Reports from './Reports';

interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user?.role === 'super_admin' ? <SuperAdminDashboard /> : <AdminDashboard />;
      case 'showrooms':
        return user?.role === 'super_admin' ? <ShowroomsManagement /> : null;
      case 'admin-users':
        return user?.role === 'super_admin' ? <AdminUsersManagement /> : null;
      case 'global-reports':
        return user?.role === 'super_admin' ? <GlobalReports /> : null;
      case 'vehicles':
        return user?.role === 'admin' ? <VehiclesManagement /> : null;
      case 'customers':
        return user?.role === 'admin' ? <CustomersManagement /> : null;
      case 'services':
        return user?.role === 'admin' ? <ServicesManagement /> : null;
      case 'reports':
        return user?.role === 'admin' ? <Reports /> : null;
      default:
        return user?.role === 'super_admin' ? <SuperAdminDashboard /> : <AdminDashboard />;
    }
  };

  return <>{renderContent()}</>;
};

export default MainContent;