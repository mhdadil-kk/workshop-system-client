import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Wrench, Plus, Edit2, Trash2, Search, Calendar, DollarSign, User, Car } from 'lucide-react';
import { Service } from '../types';

const ServicesManagement: React.FC = () => {
  const { user } = useAuth();
  const { services, vehicles, customers, addService, updateService, deleteService } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    customerId: '',
    serviceType: '',
    description: '',
    cost: 0,
    status: 'pending' as Service['status'],
    scheduledDate: '',
    completedDate: '',
    technician: ''
  });

  // Filter services for current admin's showroom
  const showroomServices = services.filter(s => s.showroomId === user?.showroomId);
  const showroomVehicles = vehicles.filter(v => v.showroomId === user?.showroomId);
  const showroomCustomers = customers.filter(c => c.showroomId === user?.showroomId);
  
  const filteredServices = showroomServices.filter(service => {
    const vehicle = vehicles.find(v => v.id === service.vehicleId);
    const customer = customers.find(c => c.id === service.customerId);
    
    const matchesSearch = (
      service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      ...formData,
      showroomId: user?.showroomId || '',
      cost: Number(formData.cost)
    };
    
    if (editingService) {
      updateService(editingService.id, serviceData);
    } else {
      addService(serviceData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      customerId: '',
      serviceType: '',
      description: '',
      cost: 0,
      status: 'pending',
      scheduledDate: '',
      completedDate: '',
      technician: ''
    });
    setEditingService(null);
    setShowModal(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      vehicleId: service.vehicleId,
      customerId: service.customerId,
      serviceType: service.serviceType,
      description: service.description,
      cost: service.cost,
      status: service.status,
      scheduledDate: service.scheduledDate.split('T')[0],
      completedDate: service.completedDate ? service.completedDate.split('T')[0] : '',
      technician: service.technician
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      deleteService(id);
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setFormData({
      ...formData,
      vehicleId,
      customerId: vehicle?.customerId || ''
    });
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const serviceTypes = [
    'Oil Change',
    'Brake Service',
    'Tire Rotation',
    'Transmission Service',
    'Engine Diagnostic',
    'AC Service',
    'Battery Replacement',
    'Alignment',
    'Annual Inspection',
    'General Maintenance'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">Manage service appointments and records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Add Service</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => {
                const vehicle = vehicles.find(v => v.id === service.vehicleId);
                const customer = customers.find(c => c.id === service.customerId);
                
                return (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.serviceType}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center mb-1">
                        <Car className="h-4 w-4 text-gray-400 mr-2" />
                        {vehicle?.year} {vehicle?.make} {vehicle?.model}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        {customer?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center mb-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(service.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Technician: {service.technician}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.replace('_', ' ')}
                      </span>
                      {service.completedDate && (
                        <div className="text-xs text-green-600 mt-1">
                          Completed: {new Date(service.completedDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        {service.cost.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
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
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first service'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle *
                  </label>
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select vehicle</option>
                    {showroomVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.customerId ? showroomCustomers.find(c => c.id === formData.customerId)?.name || '' : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    placeholder="Auto-filled when vehicle is selected"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type *
                  </label>
                  <select
                    required
                    value={formData.serviceType}
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select service type</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Service['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technician *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.technician}
                    onChange={(e) => setFormData({...formData, technician: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter technician name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {formData.status === 'completed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completed Date
                    </label>
                    <input
                      type="date"
                      value={formData.completedDate}
                      onChange={(e) => setFormData({...formData, completedDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingService ? 'Update' : 'Add'} Service
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;