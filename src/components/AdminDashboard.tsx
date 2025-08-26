import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Car, Users, Wrench, DollarSign, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { vehicles, customers, services, showrooms } = useData();

  // Filter data for current admin's showroom
  const userShowroom = showrooms.find(s => s.id === user?.showroomId);
  const showroomVehicles = vehicles.filter(v => v.showroomId === user?.showroomId);
  const showroomCustomers = customers.filter(c => c.showroomId === user?.showroomId);
  const showroomServices = services.filter(s => s.showroomId === user?.showroomId);

  // Calculate statistics
  const completedServices = showroomServices.filter(s => s.status === 'completed');
  const pendingServices = showroomServices.filter(s => s.status === 'pending');
  const inProgressServices = showroomServices.filter(s => s.status === 'in_progress');
  const totalRevenue = completedServices.reduce((sum, service) => sum + service.cost, 0);

  const stats = [
    {
      title: 'Total Vehicles',
      value: showroomVehicles.length,
      icon: <Car className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50',
      change: '+5',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Customers',
      value: showroomCustomers.length,
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      color: 'bg-emerald-50',
      change: '+3',
      changeColor: 'text-green-600'
    },
    {
      title: 'Services This Month',
      value: showroomServices.length,
      icon: <Wrench className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50',
      change: '+12',
      changeColor: 'text-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-8 w-8 text-yellow-600" />,
      color: 'bg-yellow-50',
      change: '+$850',
      changeColor: 'text-green-600'
    }
  ];

  // Upcoming services (next 7 days)
  const upcomingServices = showroomServices
    .filter(service => {
      const serviceDate = new Date(service.scheduledDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return serviceDate >= today && serviceDate <= nextWeek && service.status === 'pending';
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  // Recent completed services
  const recentCompletedServices = completedServices
    .sort((a, b) => new Date(b.completedDate || b.createdAt).getTime() - new Date(a.completedDate || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Managing {userShowroom?.name}
          </p>
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
                  <span className={`text-sm font-medium ${stat.changeColor}`}>{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">this month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Pending Services</h3>
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">{pendingServices.length}</div>
          <p className="text-sm text-gray-600">Services awaiting start</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">In Progress</h3>
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{inProgressServices.length}</div>
          <p className="text-sm text-gray-600">Services currently active</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Completed</h3>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{completedServices.length}</div>
          <p className="text-sm text-gray-600">Services finished this month</p>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Services</h3>
          {upcomingServices.length > 0 ? (
            <div className="space-y-4">
              {upcomingServices.map((service) => {
                const vehicle = vehicles.find(v => v.id === service.vehicleId);
                const customer = customers.find(c => c.id === service.customerId);
                const serviceDate = new Date(service.scheduledDate);
                
                return (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <h4 className="font-medium text-gray-900">{service.serviceType}</h4>
                      <p className="text-sm text-gray-600">
                        {vehicle?.make} {vehicle?.model} - {customer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {serviceDate.toLocaleDateString()} at {serviceDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${service.cost}</p>
                      <p className="text-sm text-gray-600">{service.technician}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming services scheduled</p>
            </div>
          )}
        </div>

        {/* Recent Completed Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Completed Services</h3>
          {recentCompletedServices.length > 0 ? (
            <div className="space-y-4">
              {recentCompletedServices.map((service) => {
                const vehicle = vehicles.find(v => v.id === service.vehicleId);
                const customer = customers.find(c => c.id === service.customerId);
                
                return (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
                    <div>
                      <h4 className="font-medium text-gray-900">{service.serviceType}</h4>
                      <p className="text-sm text-gray-600">
                        {vehicle?.make} {vehicle?.model} - {customer?.name}
                      </p>
                      <p className="text-xs text-green-700">
                        Completed: {new Date(service.completedDate || service.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">${service.cost}</p>
                      <p className="text-sm text-gray-600">{service.technician}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No completed services yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;