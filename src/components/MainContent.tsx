import React from 'react';
import AdminDashboard from './AdminDashboard';
import VehiclesManagement from './VehiclesManagement';
import CustomersManagement from './CustomersManagement';
import OrdersManagement from './OrdersManagement';
import Reports from './Reports';

interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'customers':
        return <CustomersManagement />;
      case 'vehicles':
        return <VehiclesManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'reports':
        return <Reports />;
      default:
        return <AdminDashboard />;
    }
  };

  return <>{renderContent()}</>;
};

export default MainContent;