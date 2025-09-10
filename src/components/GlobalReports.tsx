import React from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart3, TrendingUp, DollarSign, Building2, Wrench, Award, Activity, Calendar, Target } from 'lucide-react';

const GlobalReports: React.FC = () => {
  const { orders } = useData();

  // Calculate statistics from actual backend data
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalVehiclesServiced = new Set(orders.map(order => order.vehicleId)).size;
  const totalServices = orders.reduce((sum, order) => sum + (order.services?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card border-0 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl flex items-center justify-center shadow-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Global Reports
                </h1>
                <p className="text-lg text-gray-600 mt-2">Comprehensive analytics across all showrooms</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 rounded-2xl shadow-lg">
              <Activity className="h-5 w-5 text-white" />
              <span className="text-base font-bold text-white">Live Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-2xl transition-all duration-300 animate-slide-in border-l-4 border-l-green-500 group">
          <div className="p-6 bg-gradient-to-br from-white to-green-50/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Revenue</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-black text-gray-900 mb-3">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center">
                  <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-bold text-green-700">+15.3%</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-2xl transition-all duration-300 animate-slide-in border-l-4 border-l-blue-500 group" style={{animationDelay: '100ms'}}>
          <div className="p-6 bg-gradient-to-br from-white to-blue-50/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Services Completed</p>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-black text-gray-900 mb-3">{totalServices.toLocaleString()}</p>
                <div className="flex items-center">
                  <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-bold text-blue-700">+12.8%</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wrench className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-2xl transition-all duration-300 animate-slide-in border-l-4 border-l-purple-500 group" style={{animationDelay: '200ms'}}>
          <div className="p-6 bg-gradient-to-br from-white to-purple-50/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Vehicles Serviced</p>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-black text-gray-900 mb-3">{totalVehiclesServiced.toLocaleString()}</p>
                <div className="flex items-center">
                  <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm font-bold text-purple-700">+9.2%</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-2xl transition-all duration-300 animate-slide-in border-l-4 border-l-emerald-500 group" style={{animationDelay: '300ms'}}>
          <div className="p-6 bg-gradient-to-br from-white to-emerald-50/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Active Showrooms</p>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-black text-gray-900 mb-3">1</p>
                <div className="flex items-center">
                  <div className="flex items-center bg-emerald-100 px-3 py-1 rounded-full">
                    <Building2 className="h-4 w-4 text-emerald-600 mr-1" />
                    <span className="text-sm font-bold text-emerald-700">Active</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">operational</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card hover:shadow-xl transition-all duration-300 animate-slide-in">
          <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <p className="text-gray-600">Latest orders and services</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {orders.slice(0, 3).map((order, index) => (
                <div key={order._id} className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.services?.length || 0} services</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card hover:shadow-xl transition-all duration-300 animate-slide-in" style={{animationDelay: '100ms'}}>
          <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Performance Goals</h3>
                <p className="text-gray-600">Monthly targets and progress</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Revenue Target</span>
                  <span className="text-sm font-bold text-gray-900">${totalRevenue.toLocaleString()} / $50,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" 
                    style={{width: `${Math.min((totalRevenue / 50000) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round((totalRevenue / 50000) * 100)}% completed</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Services Target</span>
                  <span className="text-sm font-bold text-gray-900">{totalServices} / 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{width: `${Math.min((totalServices / 100) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round((totalServices / 100) * 100)}% completed</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Vehicles Target</span>
                  <span className="text-sm font-bold text-gray-900">{totalVehiclesServiced} / 50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                    style={{width: `${Math.min((totalVehiclesServiced / 50) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round((totalVehiclesServiced / 50) * 100)}% completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalReports;