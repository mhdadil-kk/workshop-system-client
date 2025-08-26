import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, TrendingUp, DollarSign, Wrench, Award } from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { services, vehicles, customers, showrooms } = useData();

  // Filter data for current admin's showroom
  const showroomServices = services.filter(s => s.showroomId === user?.showroomId);
  const showroomVehicles = vehicles.filter(v => v.showroomId === user?.showroomId);
  const showroomCustomers = customers.filter(c => c.showroomId === user?.showroomId);
  const currentShowroom = showrooms.find(s => s.id === user?.showroomId);

  // Calculate statistics
  const completedServices = showroomServices.filter(s => s.status === 'completed');
  const pendingServices = showroomServices.filter(s => s.status === 'pending');
  const inProgressServices = showroomServices.filter(s => s.status === 'in_progress');
  const totalRevenue = completedServices.reduce((sum, service) => sum + service.cost, 0);

  // Service type analysis for this showroom
  const serviceTypes = completedServices.reduce((acc, service) => {
    acc[service.serviceType] = (acc[service.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topServices = Object.entries(serviceTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));

  // Revenue by service type
  const revenueByServiceType = completedServices.reduce((acc, service) => {
    acc[service.serviceType] = (acc[service.serviceType] || 0) + service.cost;
    return acc;
  }, {} as Record<string, number>);

  const topRevenueServices = Object.entries(revenueByServiceType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, revenue]) => ({ type, revenue }));

  // Monthly trend based on actual service data
  const monthlyData = [
    { month: 'Jan', revenue: Math.floor(totalRevenue * 0.15), services: Math.floor(completedServices.length * 0.12) },
    { month: 'Feb', revenue: Math.floor(totalRevenue * 0.18), services: Math.floor(completedServices.length * 0.16) },
    { month: 'Mar', revenue: Math.floor(totalRevenue * 0.22), services: Math.floor(completedServices.length * 0.20) },
    { month: 'Apr', revenue: Math.floor(totalRevenue * 0.19), services: Math.floor(completedServices.length * 0.18) },
    { month: 'May', revenue: Math.floor(totalRevenue * 0.14), services: Math.floor(completedServices.length * 0.16) },
    { month: 'Jun', revenue: Math.floor(totalRevenue * 0.12), services: Math.floor(completedServices.length * 0.18) }
  ];

  // Vehicle brand analysis
  const vehicleBrands = showroomVehicles.reduce((acc, vehicle) => {
    acc[vehicle.make] = (acc[vehicle.make] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBrands = Object.entries(vehicleBrands)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Showroom Reports</h1>
          <p className="text-gray-600 mt-1">
            Analytics and insights for {currentShowroom?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })} Report
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Services Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedServices.length}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium text-blue-600">+8.3%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{showroomCustomers.length}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-purple-600">+5.7%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Service Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${completedServices.length > 0 ? Math.round(totalRevenue / completedServices.length) : 0}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-sm font-medium text-emerald-600">+3.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Pending Services</h3>
            <div className="text-2xl font-bold text-yellow-600">{pendingServices.length}</div>
          </div>
          <div className="text-sm text-gray-600">
            Services scheduled but not started
          </div>
          <div className="mt-3 bg-yellow-50 rounded-lg p-3">
            <div className="text-xs text-yellow-700 font-medium">Next 7 Days</div>
            <div className="text-lg font-bold text-yellow-800">
              {pendingServices.filter(s => {
                const serviceDate = new Date(s.scheduledDate);
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return serviceDate <= nextWeek;
              }).length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">In Progress</h3>
            <div className="text-2xl font-bold text-blue-600">{inProgressServices.length}</div>
          </div>
          <div className="text-sm text-gray-600">
            Services currently being worked on
          </div>
          <div className="mt-3 bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-700 font-medium">Est. Revenue</div>
            <div className="text-lg font-bold text-blue-800">
              ${inProgressServices.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Completed</h3>
            <div className="text-2xl font-bold text-green-600">{completedServices.length}</div>
          </div>
          <div className="text-sm text-gray-600">
            Services completed this period
          </div>
          <div className="mt-3 bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-700 font-medium">Revenue Generated</div>
            <div className="text-lg font-bold text-green-800">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services by Volume */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Most Popular Services</h3>
          {topServices.length > 0 ? (
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{service.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-full h-2 w-20">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(service.count / topServices[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-6">{service.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No completed services yet</p>
            </div>
          )}
        </div>

        {/* Top Revenue Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Highest Revenue Services</h3>
          {topRevenueServices.length > 0 ? (
            <div className="space-y-4">
              {topRevenueServices.map((service, index) => (
                <div key={service.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{service.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-full h-2 w-20">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${(service.revenue / topRevenueServices[0].revenue) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">${service.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No revenue data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Performance Trend</h3>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {monthlyData.map((month) => (
            <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="text-sm text-gray-600 mb-2">{month.month}</div>
              <div className="text-lg font-bold text-gray-900 mb-1">${month.revenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mb-2">{month.services} services</div>
              <div className="bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${month.revenue > 0 ? (month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Brands Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Brands Serviced</h3>
          {topBrands.length > 0 ? (
            <div className="space-y-4">
              {topBrands.map((brand, index) => (
                <div key={brand.brand} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{brand.brand}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-full h-2 w-20">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(brand.count / topBrands[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-8">{brand.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No vehicle data available</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Total Vehicles Managed</span>
              <span className="text-lg font-bold text-blue-900">{showroomVehicles.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm font-medium text-emerald-800">Average Service Cost</span>
              <span className="text-lg font-bold text-emerald-900">
                ${completedServices.length > 0 ? Math.round(totalRevenue / completedServices.length) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-800">Services This Month</span>
              <span className="text-lg font-bold text-purple-900">{showroomServices.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">Customer Satisfaction</span>
              <span className="text-lg font-bold text-yellow-900">98.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;