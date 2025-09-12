import React from 'react';
import AdminDashboard from './AdminDashboard';
import VehiclesManagement from './VehiclesManagement';
import CustomersManagement from './CustomersManagement';
import OrdersManagement from './OrdersManagement';
import Reports from './Reports';

interface MainContentProps {
  activeTab: string;
  navigate?: (tabId: string, params?: any) => void;
  routeParams?: any;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab, navigate, routeParams }) => {
  // Lazy import to avoid circular deps in edits
  const OrderDetails = React.useMemo(() => React.lazy(() => import('./OrderDetails')), []);
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard navigate={navigate} />;
      case 'customers':
        return <CustomersManagement navigate={navigate} />;
      case 'vehicles':
        return <VehiclesManagement navigate={navigate} />;
      case 'orders':
        return <OrdersManagement navigate={navigate} />;
      case 'orderDetails':
        return (
          <React.Suspense fallback={<div className="p-6">Loading...</div>}>
            <OrderDetails navigate={navigate} params={routeParams} />
          </React.Suspense>
        );
      case 'reports':
        return <Reports />;
      default:
        return <AdminDashboard />;
    }
  };

  return <>{renderContent()}</>;
};

export default MainContent;