import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Car, Plus, Edit2, Trash2, Search, User, Calendar, AlertCircle, ChevronDown, ChevronRight, Wrench, DollarSign } from 'lucide-react';
import { Vehicle, Order } from '../types';
import { validateName, validateYear, validateRequired } from '../utils/validation';

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
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Client-side validation
    const makeError = validateName(formData.make, 'make');
    const modelError = validateName(formData.vehicleModel, 'vehicleModel');
    const colorError = validateName(formData.color, 'color');
    const vehicleNumberError = validateRequired(formData.vehicleNumber, 'vehicleNumber');
    const engineNumberError = validateRequired(formData.engineNumber, 'engineNumber');
    const chassisNumberError = validateRequired(formData.chassisNumber, 'chassisNumber');
    const yearError = validateYear(formData.year);
    const customerError = validateRequired(formData.customerId, 'customerId');
    
    const newValidationErrors: {[key: string]: string} = {};
    if (makeError) newValidationErrors[makeError.field] = makeError.message;
    if (modelError) newValidationErrors['vehicleModel'] = modelError.message;
    if (colorError) newValidationErrors[colorError.field] = colorError.message;
    if (vehicleNumberError) newValidationErrors['vehicleNumber'] = vehicleNumberError.message;
    if (engineNumberError) newValidationErrors['engineNumber'] = engineNumberError.message;
    if (chassisNumberError) newValidationErrors['chassisNumber'] = chassisNumberError.message;
    if (yearError) newValidationErrors[yearError.field] = yearError.message;
    if (customerError) newValidationErrors[customerError.field] = customerError.message;
    
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      return;
    }
    
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.vehicleNumber, formData);
      } else {
        await addVehicle(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
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
    setValidationErrors({});
    setEditingVehicle(null);
    setShowModal(false);
  };
  
  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
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

  const handleDelete = async () => {
    // Note: Delete functionality not implemented in backend API
    alert('Delete functionality is not yet implemented in the backend API.');
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
          const orders = await getOrdersByVehicle(vehicleId);
          setVehicleOrders(prev => ({
            ...prev,
            [vehicleId]: orders
          }));
        } catch (error) {
          console.error('Failed to load vehicle orders:', error);
        }
      }
    }
    
    setExpandedVehicles(newExpanded);
  };

  const getCustomerInfo = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId || c.id === customerId);
    return customer ? { name: customer.name, mobile: customer.mobile } : { name: 'Unknown Customer', mobile: 'N/A' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles Management</h1>
          <p className="text-gray-600 mt-1">Manage vehicles in your showroom</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search vehicles by make, model, license plate, VIN, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Loading State */}
      {loading.vehicles && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading vehicles...</p>
        </div>
      )}

      {/* Vehicles List */}
      {!loading.vehicles && (
        <div className="space-y-4">
        {filteredVehicles.map((vehicle) => {
          const customerInfo = getCustomerInfo(vehicle._id);
          const isExpanded = expandedVehicles.has(vehicle._id);
          const orders = vehicleOrders[vehicle._id] || [];
          
          return (
            <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Vehicle Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.vehicleModel}
                        </h3>
                        <span className="text-sm text-gray-500 font-mono">{vehicle.vehicleNumber}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{customerInfo.name}</span>
                        </div>
                        <div>
                          <span>Color: {vehicle.color || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit Vehicle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete()}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleVehicleExpansion(vehicle._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title={isExpanded ? 'Collapse Orders' : 'View Orders'}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
                
                {/* Vehicle Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Engine Number:</span>
                    <span className="ml-2 text-gray-900 font-mono">{vehicle.engineNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Chassis Number:</span>
                    <span className="ml-2 text-gray-900 font-mono">{vehicle.chassisNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Owner Contact:</span>
                    <span className="ml-2 text-gray-900">{customerInfo.mobile}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Orders Section */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Wrench className="h-5 w-5 text-purple-600 mr-2" />
                        Service History ({orders.length})
                      </h4>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div key={order._id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Wrench className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div className="text-sm text-gray-600">{order.services.length} service{order.services.length !== 1 ? 's' : ''}</div>
                                  <div className="font-semibold text-green-600 flex items-center">
                                    <DollarSign className="h-4 w-4" />
                                    {order.totalAmount.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Customer:</span>
                                <span className="ml-2 text-gray-900">{getCustomerInfo(order.customerId).name}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Services:</span>
                                <span className="ml-2 text-gray-900">
                                  {order.services.slice(0, 2).map(s => s.name).join(', ')}
                                  {order.services.length > 2 && ` +${order.services.length - 2} more`}
                                </span>
                              </div>
                            </div>
                            
                            {order.notes && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                <strong>Notes:</strong> {order.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No service history found for this vehicle</p>
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
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first vehicle'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => {
                      setFormData({...formData, make: e.target.value});
                      clearFieldError('make');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.make 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="e.g., Toyota"
                  />
                  {validationErrors.make && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.make}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleModel}
                    onChange={(e) => {
                      setFormData({...formData, vehicleModel: e.target.value});
                      clearFieldError('vehicleModel');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.vehicleModel 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="e.g., Camry"
                  />
                  {validationErrors.vehicleModel && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.vehicleModel}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => {
                      setFormData({...formData, year: parseInt(e.target.value) || new Date().getFullYear()});
                      clearFieldError('year');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.year 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {validationErrors.year && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.year}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => {
                      setFormData({...formData, color: e.target.value});
                      clearFieldError('color');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.color 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="e.g., Silver"
                  />
                  {validationErrors.color && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.color}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => {
                      setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()});
                      clearFieldError('vehicleNumber');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.vehicleNumber 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Vehicle registration number"
                    disabled={!!editingVehicle}
                  />
                  {validationErrors.vehicleNumber && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.vehicleNumber}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.engineNumber}
                    onChange={(e) => {
                      setFormData({...formData, engineNumber: e.target.value});
                      clearFieldError('engineNumber');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.engineNumber 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Engine number"
                  />
                  {validationErrors.engineNumber && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.engineNumber}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chassis Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.chassisNumber}
                    onChange={(e) => {
                      setFormData({...formData, chassisNumber: e.target.value});
                      clearFieldError('chassisNumber');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.chassisNumber 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Chassis number"
                  />
                  {validationErrors.chassisNumber && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.chassisNumber}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner *
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => {
                      setFormData({...formData, customerId: e.target.value});
                      clearFieldError('customerId');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      validationErrors.customerId 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select owner</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.customerId && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.customerId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingVehicle ? 'Update' : 'Add'} Vehicle
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

export default VehiclesManagement;