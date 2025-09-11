import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Car, Plus, Edit2, Search, User, Calendar, AlertCircle, ChevronDown, ChevronRight, Wrench, DollarSign } from 'lucide-react';
import { Vehicle, Order } from '../types';

const VehiclesManagement: React.FC = () => {
  const { vehicles, customers, loading, loadVehicles, loadCustomers, loadOrders, addVehicle, updateVehicle, getOrdersByVehicle } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    make: '',
    vehicleModel: '',
    year: new Date().getFullYear(),
    color: '',
    engineNumber: '',
    chassisNumber: '',
    customerId: ''
  });
  const [error, setError] = useState<string>('');
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [vehicleOrders, setVehicleOrders] = useState<{[key: string]: Order[]}>({});

  // Load data when component mounts
  useEffect(() => {
    loadVehicles();
    loadCustomers();
    loadOrders();
  }, [loadVehicles, loadCustomers, loadOrders]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const customer = customers.find(c => c._id === vehicle._id || c.uniqueCode === vehicle._id);
    return (
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.engineNumber && vehicle.engineNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.chassisNumber && vehicle.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.vehicleNumber, formData);
      } else {
        await addVehicle(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to save vehicle:', error);
      
      // Handle backend validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors: {[key: string]: string} = {};
        error.response.data.errors.forEach((err: {field: string, message: string}) => {
          backendErrors[err.field] = err.message;
        });
        setFieldErrors(backendErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to save vehicle. Please try again.';
        setError(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      make: '',
      vehicleModel: '',
      year: new Date().getFullYear(),
      color: '',
      engineNumber: '',
      chassisNumber: '',
      customerId: ''
    });
    setError('');
    setFieldErrors({});
    setEditingVehicle(null);
    setShowModal(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      make: vehicle.make,
      vehicleModel: vehicle.vehicleModel,
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || '',
      engineNumber: vehicle.engineNumber || '',
      chassisNumber: vehicle.chassisNumber || '',
      customerId: vehicle._id || ''
    });
    setShowModal(true);
  };

  const toggleVehicleExpansion = async (vehicleId: string) => {
    const newExpanded = new Set(expandedVehicles);
    
    if (expandedVehicles.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
      // Load orders for this vehicle if not already loaded
      if (!vehicleOrders[vehicleId]) {
        try {
          const vehicleOrdersList = await getOrdersByVehicle(vehicleId);
          setVehicleOrders(prev => ({
            ...prev,
            [vehicleId]: vehicleOrdersList
          }));
        } catch (error) {
          console.error('Failed to load vehicle orders:', error);
        }
      }
    }
    
    setExpandedVehicles(newExpanded);
  };

  const getCustomerInfo = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId || c.uniqueCode === customerId);
    return customer ? `${customer.name} (${customer.mobile})` : 'Unknown Customer';
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header - Compact */}
      <div className="card p-4 bg-white border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Car className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Vehicles</h1>
              <p className="text-xs text-gray-500">Total: {vehicles.length}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary px-3 py-2 text-sm"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search - Compact */}
      <div className="card p-3 bg-white border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 pr-3 py-2 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-400"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading.vehicles && (
        <div className="card p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading vehicles...</p>
        </div>
      )}

      {/* Vehicles List */}
      {!loading.vehicles && (
        <div className="space-y-2">
        {filteredVehicles.map((vehicle) => {
          const isExpanded = expandedVehicles.has(vehicle._id);
          const orders = vehicleOrders[vehicle._id] || [];
          
          return (
            <div key={vehicle._id} className="card overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200">
              {/* Vehicle Header - Ultra Compact */}
              <div className="p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                      <Car className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{vehicle.make} {vehicle.vehicleModel}</h3>
                        <span className="badge badge-primary text-xs font-mono px-1 py-0.5">{vehicle.vehicleNumber}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>{vehicle.year || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-2.5 w-2.5" />
                          <span className="truncate">{getCustomerInfo(vehicle._id)}</span>
                        </div>
                        {vehicle.color && (
                          <div className="flex items-center space-x-1">
                            <div className="h-2.5 w-2.5 rounded-full bg-gray-400"></div>
                            <span>{vehicle.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => toggleVehicleExpansion(vehicle._id)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                  </div>
                </div>
                
                {(vehicle.engineNumber || vehicle.chassisNumber) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vehicle.engineNumber && (
                        <div>
                          <span className="text-gray-500">Engine:</span>
                          <span className="ml-1 font-mono text-gray-700">{vehicle.engineNumber}</span>
                        </div>
                      )}
                      {vehicle.chassisNumber && (
                        <div>
                          <span className="text-gray-500">Chassis:</span>
                          <span className="ml-1 font-mono text-gray-700">{vehicle.chassisNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Orders Section */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Wrench className="h-4 w-4 text-purple-600" />
                      <h4 className="text-sm font-semibold text-gray-900">
                        Service History ({orders.length})
                      </h4>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="space-y-2">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order._id} className="card p-3 bg-white border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                                  <Wrench className="h-3 w-3 text-purple-600" />
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-gray-900">#{order.orderNumber}</div>
                                  <div className="text-xs text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-600">{order.services.length} service{order.services.length !== 1 ? 's' : ''}</div>
                                <div className="text-xs font-semibold text-green-600">
                                  ${order.totalAmount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {orders.length > 3 && (
                          <div className="text-center">
                            <span className="text-xs text-gray-500">+{orders.length - 3} more orders</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No service history</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {!loading.vehicles && filteredVehicles.length === 0 && (
        <div className="card p-8 text-center">
          <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500 text-sm mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Add your first vehicle to get started.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowModal(true)}
              className="btn btn-primary px-4 py-2 text-sm"
            >
              <Plus size={16} />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                  </h2>
                  <p className="text-sm text-gray-600">Enter vehicle information</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                    className="input py-2 text-sm"
                    placeholder="ABC-1234"
                  />
                  {fieldErrors.vehicleNumber && (
                    <div className="mt-1 flex items-center text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>{fieldErrors.vehicleNumber}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="input py-2 text-sm"
                    placeholder="Toyota, Honda..."
                  />
                  {fieldErrors.make && (
                    <div className="mt-1 flex items-center text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>{fieldErrors.make}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    className="input py-2 text-sm"
                    placeholder="Camry, Civic..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="input py-2 text-sm"
                    placeholder="2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="input py-2 text-sm"
                  placeholder="Red, Blue, White..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    value={formData.engineNumber}
                    onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                    className="input py-2 text-sm font-mono"
                    placeholder="Engine ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    value={formData.chassisNumber}
                    onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                    className="input py-2 text-sm font-mono"
                    placeholder="Chassis ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer {!editingVehicle && <span className="text-red-500">*</span>}
                </label>
                <select
                  required={!editingVehicle}
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  className="input py-2 text-sm"
                >
                  <option value="">Select customer...</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.mobile}
                    </option>
                  ))}
                </select>
                {fieldErrors.customerId && (
                  <div className="mt-1 flex items-center text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>{fieldErrors.customerId}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1 py-2 text-sm"
                >
                  {editingVehicle ? 'Update' : 'Add'} Vehicle
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary flex-1 py-2 text-sm"
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

export default VehiclesManagement;
