import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { UserCheck, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin, Car, AlertCircle, ChevronDown, ChevronRight, Calendar, DollarSign, Wrench } from 'lucide-react';
import { Customer, Order } from '../types';
import { validateName, validateEmail, validatePhone, validateAddress } from '../utils/validation';

const CustomersManagement: React.FC = () => {
  const { customers, vehicles, loading, loadCustomers, loadVehicles, loadOrders, addCustomer, updateCustomer, getOrdersByCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    uniqueCode: '',
    name: '',
    email: '',
    mobile: '',
    address: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [customerOrders, setCustomerOrders] = useState<{[key: string]: Order[]}>({});

  // Load data when component mounts
  useEffect(() => {
    loadCustomers();
    loadVehicles();
    loadOrders();
  }, [loadCustomers, loadVehicles, loadOrders]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.mobile.includes(searchTerm) ||
    customer.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Client-side validation
    const nameError = validateName(formData.name, 'name');
    const emailError = formData.email ? validateEmail(formData.email) : null;
    const phoneError = validatePhone(formData.mobile);
    const addressError = formData.address ? validateAddress(formData.address) : null;
    
    const newValidationErrors: {[key: string]: string} = {};
    if (nameError) newValidationErrors[nameError.field] = nameError.message;
    if (emailError) newValidationErrors[emailError.field] = emailError.message;
    if (phoneError) newValidationErrors['mobile'] = phoneError.message;
    if (addressError) newValidationErrors[addressError.field] = addressError.message;
    
    // Validate unique code
    if (!formData.uniqueCode.trim()) {
      newValidationErrors['uniqueCode'] = 'Unique code is required';
    }
    
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      return;
    }
    
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.uniqueCode, formData);
      } else {
        await addCustomer(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save customer:', error);
      // Handle error (show toast, etc.)
    }
  };

  const resetForm = () => {
    setFormData({
      uniqueCode: '',
      name: '',
      email: '',
      mobile: '',
      address: ''
    });
    setValidationErrors({});
    setEditingCustomer(null);
    setShowModal(false);
  };
  
  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      uniqueCode: customer.uniqueCode,
      name: customer.name,
      email: customer.email || '',
      mobile: customer.mobile,
      address: customer.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    // Note: Delete functionality not implemented in backend API
    alert('Delete functionality is not yet implemented in the backend API.');
  };

  const getCustomerVehicles = (customerId: string) => {
    return vehicles.filter(v => v._id === customerId || v.id === customerId);
  };

  const toggleCustomerExpansion = async (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    
    if (expandedCustomers.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
      // Load orders for this customer if not already loaded
      if (!customerOrders[customerId]) {
        try {
          const customerOrdersList = await getOrdersByCustomer(customerId);
          setCustomerOrders(prev => ({
            ...prev,
            [customerId]: customerOrdersList
          }));
        } catch (error) {
          console.error('Failed to load customer orders:', error);
        }
      }
    }
    
    setExpandedCustomers(newExpanded);
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v._id === vehicleId || v.id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    return `${vehicle.year || ''} ${vehicle.make} ${vehicle.vehicleModel} (${vehicle.vehicleNumber})`.trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers Management</h1>
          <p className="text-gray-600 mt-1">Manage customers in your showroom</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search customers by name, email, phone, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Loading State */}
      {loading.customers && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading customers...</p>
        </div>
      )}

      {/* Customers List */}
      {!loading.customers && (
        <div className="space-y-4">
        {filteredCustomers.map((customer) => {
          const customerVehicles = getCustomerVehicles(customer.id);
          const isExpanded = expandedCustomers.has(customer.id);
          const orders = customerOrders[customer.id] || [];
          
          return (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Customer Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                        <span className="text-sm text-gray-500">#{customer.uniqueCode}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{customer.mobile}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car className="h-4 w-4" />
                          <span>{customerVehicles.length} vehicle{customerVehicles.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit Customer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete()}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Customer"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleCustomerExpansion(customer.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title={isExpanded ? 'Collapse Orders' : 'View Orders'}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
                
                {customer.address && (
                  <div className="mt-3 flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>

              {/* Expanded Orders Section */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Wrench className="h-5 w-5 text-purple-600 mr-2" />
                        Service Orders ({orders.length})
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
                                <span className="text-gray-600">Vehicle:</span>
                                <span className="ml-2 text-gray-900">{getVehicleInfo(order.vehicleId)}</span>
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
                        <p className="text-gray-500">No service orders found for this customer</p>
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

      {!loading.customers && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first customer'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unique Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.uniqueCode}
                  onChange={(e) => {
                    setFormData({...formData, uniqueCode: e.target.value});
                    clearFieldError('uniqueCode');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                    validationErrors.uniqueCode 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter unique customer code"
                  disabled={!!editingCustomer}
                />
                {validationErrors.uniqueCode && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.uniqueCode}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    clearFieldError('name');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                    validationErrors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter customer's full name"
                />
                {validationErrors.name && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    clearFieldError('email');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                    validationErrors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter email address"
                />
                {validationErrors.email && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => {
                    setFormData({...formData, mobile: e.target.value});
                    clearFieldError('mobile');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                    validationErrors.mobile 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter phone number (e.g., +1234567890)"
                />
                {validationErrors.mobile && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.mobile}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({...formData, address: e.target.value});
                    clearFieldError('address');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                    validationErrors.address 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter complete address (street, city, state, zip)"
                  rows={3}
                />
                {validationErrors.address && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.address}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingCustomer ? 'Update' : 'Add'} Customer
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

export default CustomersManagement;