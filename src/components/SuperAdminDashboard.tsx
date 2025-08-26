import React from 'react';
import { useData } from '../contexts/DataContext';
import { Building2, Users, Car, DollarSign, TrendingUp, Calendar, Wrench } from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const { showrooms, users, vehicles, services } = useData();

  const adminUsers = users.filter(user => user.role === 'admin');
  const completedServices = services.filter(service => service.status === 'completed');
  const totalRevenue = completedServices.reduce((sum, service) => sum + service.cost, 0);
  const pendingServices = services.filter(service => service.status === 'pending').length;

  const stats = [
    {
      title: 'Total Showrooms',
      value: showrooms.length,
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Admin Users',
      value: adminUsers.length,
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      color: 'bg-emerald-50',
      change: '+8%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Vehicles',
      value: vehicles.length,
      icon: <Car className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50',
      change: '+23%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-8 w-8 text-yellow-600" />,
      color: 'bg-yellow-50',
      change: '+15%',
      changeColor: 'text-green-600'
    }
  ];

  // Recent services across all showrooms
  const recentServices = services
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get showroom performance
  const showroomPerformance = showrooms.map(showroom => {
    const showroomServices = services.filter(service => service.showroomId === showroom.id);
    const showroomRevenue = showroomServices
      .filter(service => service.status === 'completed')
      .reduce((sum, service) => sum + service.cost, 0);
    
    return {
      ...showroom,
      servicesCount: showroomServices.length,
      revenue: showroomRevenue,
      completedServices: showroomServices.filter(service => service.status === 'completed').length
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening across all showrooms.</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className={`text-sm font-medium ${stat.changeColor}`}>{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Showroom Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Showroom Performance</h3>
          <div className="space-y-4">
            {showroomPerformance.map((showroom) => (
              <div key={showroom.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <h4 className="font-medium text-gray-900">{showroom.name}</h4>
                  <p className="text-sm text-gray-600">{showroom.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${showroom.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{showroom.completedServices} completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Services</h3>
          <div className="space-y-4">
            {recentServices.map((service) => {
              const showroom = showrooms.find(s => s.id === service.showroomId);
              const vehicle = vehicles.find(v => v.id === service.vehicleId);
              
              return (
                <div key={service.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{service.serviceType}</h4>
                    <p className="text-sm text-gray-600">
                      {vehicle?.make} {vehicle?.model} at {showroom?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${service.cost}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      service.status === 'completed' ? 'bg-green-100 text-green-800' :
                      service.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      service.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {service.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{pendingServices}</div>
            <div className="text-sm text-blue-700 font-medium">Pending Services</div>
            <div className="text-xs text-gray-600 mt-1">Across all showrooms</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{completedServices.length}</div>
            <div className="text-sm text-emerald-700 font-medium">Completed Services</div>
            <div className="text-xs text-gray-600 mt-1">This month</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {completedServices.length > 0 ? Math.round(totalRevenue / completedServices.length) : 0}
            </div>
            <div className="text-sm text-purple-700 font-medium">Avg Service Value</div>
            <div className="text-xs text-gray-600 mt-1">Per completed service</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;