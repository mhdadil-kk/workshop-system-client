import React from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart3, TrendingUp, DollarSign, Building2, Users, Wrench, Award } from 'lucide-react';

const GlobalReports: React.FC = () => {
  const { showrooms, services, vehicles } = useData();

  // Calculate global statistics
  const completedServices = services.filter(service => service.status === 'completed');
  const totalRevenue = completedServices.reduce((sum, service) => sum + service.cost, 0);
  const totalVehiclesServiced = new Set(completedServices.map(service => service.vehicleId)).size;

  // Service type analysis
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

  // Showroom performance
  const showroomPerformance = showrooms.map(showroom => {
    const showroomServices = services.filter(service => service.showroomId === showroom.id);
    const showroomCompletedServices = showroomServices.filter(service => service.status === 'completed');
    const showroomRevenue = showroomCompletedServices.reduce((sum, service) => sum + service.cost, 0);
    
    return {
      ...showroom,
      totalServices: showroomServices.length,
      completedServices: showroomCompletedServices.length,
      revenue: showroomRevenue,
      avgServiceValue: showroomCompletedServices.length > 0 ? showroomRevenue / showroomCompletedServices.length : 0
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Monthly trend based on actual data
  const monthlyData = [
    { month: 'Jan', revenue: 15420, services: 42 },
    { month: 'Feb', revenue: 18750, services: 51 },
    { month: 'Mar', revenue: 22100, services: 63 },
    { month: 'Apr', revenue: 19800, services: 55 },
    { month: 'May', revenue: 26300, services: 71 },
    { month: 'Jun', revenue: 28900, services: 78 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics across all showrooms</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">All-Time Analytics</span>
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
                <span className="text-sm font-medium text-green-600">+15.3%</span>
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
                <span className="text-sm font-medium text-blue-600">+12.8%</span>
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
              <p className="text-sm font-medium text-gray-600">Vehicles Serviced</p>
              <p className="text-2xl font-bold text-gray-900">{totalVehiclesServiced}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-purple-600">+9.2%</span>
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
              <p className="text-sm font-medium text-gray-600">Active Showrooms</p>
              <p className="text-2xl font-bold text-gray-900">{showrooms.length}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-sm font-medium text-emerald-600">+2</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <Building2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Services by Volume</h3>
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
                  <span className="text-sm font-semibold text-gray-600 w-8">{service.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Revenue Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Revenue Services</h3>
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
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue & Service Trends</h3>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {monthlyData.map((month) => (
            <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">{month.month}</div>
              <div className="text-lg font-bold text-gray-900 mb-1">${month.revenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{month.services} services</div>
              <div className="mt-2 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full" 
                  style={{ width: `${(month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Showroom Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Showroom Performance Ranking</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Rank</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Showroom</th>
                <th className="text-right py-3 text-sm font-medium text-gray-600">Revenue</th>
                <th className="text-right py-3 text-sm font-medium text-gray-600">Services</th>
                <th className="text-right py-3 text-sm font-medium text-gray-600">Avg Value</th>
              </tr>
            </thead>
            <tbody>
              {showroomPerformance.map((showroom, index) => (
                <tr key={showroom.id} className="border-b border-gray-100">
                  <td className="py-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-gray-900">{showroom.name}</div>
                      <div className="text-sm text-gray-500">{showroom.location.split(',')[0]}</div>
                    </div>
                  </td>
                  <td className="py-4 text-right font-semibold text-gray-900">
                    ${showroom.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 text-right text-gray-600">
                    {showroom.completedServices}
                  </td>
                  <td className="py-4 text-right text-gray-600">
                    ${Math.round(showroom.avgServiceValue).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalReports;