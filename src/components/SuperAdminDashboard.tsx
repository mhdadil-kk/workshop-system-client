import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Car, DollarSign, TrendingUp, Calendar, Wrench, Building2 } from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const { customers, vehicles, orders, loading, loadOrders, loadCustomers, loadVehicles } = useData();

  // Load data when component mounts
  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadVehicles();
  }, [loadOrders, loadCustomers, loadVehicles]);

  // Calculate statistics from actual backend data
  const totalCustomers = customers.length;
  const totalVehicles = vehicles.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalServices = orders.reduce((sum, order) => sum + (order.services?.length || 0), 0);

  // Mock showrooms count since not implemented in backend
  const totalShowrooms = 1; // Default to 1 for now

  const stats = [
    {
      title: 'Total Showrooms',
      value: totalShowrooms,
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50',
      change: '+0%',
      changeColor: 'text-gray-600'
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: <Users className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50',
      change: '+8%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      icon: <Car className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50',
      change: '+15%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-8 w-8 text-yellow-600" />,
      color: 'bg-yellow-50',
      change: '+22%',
      changeColor: 'text-green-600'
    }
  ];

  // Helper functions
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId || c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v._id === vehicleId || v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.vehicleModel}` : 'Unknown Vehicle';
  };

  // Get recent services from orders
  const recentServices = orders
    .flatMap(order => 
      order.services?.map(service => ({
        orderNumber: order.orderNumber,
        customerName: getCustomerName(order.customerId),
        vehicleInfo: getVehicleInfo(order.vehicleId),
        createdAt: order.createdAt || new Date().toISOString(),
        ...service
      })) || []
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading.customers || loading.vehicles || loading.orders) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              {stat.icon}
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className={`text-sm font-medium ${stat.changeColor}`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Services */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Services</h2>
          </div>
          <div className="p-6">
            {recentServices.length > 0 ? (
              <div className="space-y-4">
                {recentServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.customerName} - {service.vehicleInfo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${service.amount}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent services</p>
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="text-sm font-medium text-gray-900">{totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Vehicles</span>
                <span className="text-sm font-medium text-gray-900">{totalVehicles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Orders</span>
                <span className="text-sm font-medium text-gray-900">{totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Services</span>
                <span className="text-sm font-medium text-gray-900">{totalServices}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                <span className="text-sm font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;