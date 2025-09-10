import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Wrench, Search, DollarSign, User, Car, AlertCircle } from 'lucide-react';

const ServicesManagement: React.FC = () => {
  const { orders, vehicles, customers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extract all services from orders
  const allServices = orders.flatMap(order => 
    order.services.map(service => ({
      ...service,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      vehicleId: order.vehicleId,
      orderDate: order.createdAt
    }))
  );

  const filteredServices = allServices.filter(service => {
    const vehicle = vehicles.find(v => v._id === service.vehicleId);
    const customer = customers.find(c => c._id === service.customerId);
    
    return (
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">View all services from workshop orders</p>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Services are managed as part of orders. To add or edit services, use the Orders Management section.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle & Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service, index) => {
                const vehicle = vehicles.find(v => v._id === service.vehicleId);
                const customer = customers.find(c => c._id === service.customerId);
                
                return (
                  <tr key={`${service.orderNumber}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-gray-500">{service.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.vehicleModel}` : 'Unknown Vehicle'}
                            </div>
                            <div className="text-sm text-gray-500">{vehicle?.vehicleNumber}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-600">{customer?.name || 'Unknown Customer'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{service.orderNumber}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(service.orderDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          ${service.amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Services will appear here when orders are created'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesManagement;