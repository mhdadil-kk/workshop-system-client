import React from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart3, TrendingUp, DollarSign, Building2, Wrench, Award } from 'lucide-react';

const GlobalReports: React.FC = () => {
  const { orders } = useData();

  // Calculate statistics from actual backend data
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalVehiclesServiced = new Set(orders.map(order => order.vehicleId)).size;
  const totalServices = orders.reduce((sum, order) => sum + (order.services?.length || 0), 0);

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
              <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
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
              <p className="text-2xl font-bold text-gray-900">1</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-sm font-medium text-emerald-600">+0</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <Building2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future charts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
        <p className="text-gray-500">Detailed analytics and charts will be displayed here based on actual order data.</p>
      </div>
    </div>
  );
};

export default GlobalReports;