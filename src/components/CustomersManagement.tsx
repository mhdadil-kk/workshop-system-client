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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card p-8 bg-gradient-to-r from-white to-gray-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Customers Management</h1>
              <p className="text-gray-600 text-lg">Manage and track all your customers and their service history</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary px-6 py-3 text-base font-semibold"
            >
              <Plus size={20} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6 bg-gradient-to-r from-white to-gray-50/30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers by name, email, phone, code, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 pr-4 py-4 text-base bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-blue-400/20"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading.customers && (
        <div className="card p-12 text-center">
          <div className="loading-spinner mx-auto mb-6"></div>
          <p className="text-gray-500 text-lg font-medium">Loading customers...</p>
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
            <div key={customer.id} className="card overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-in border-l-4 border-l-blue-500">
              {/* Customer Header */}
              <div className="p-8 bg-gradient-to-r from-white to-gray-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserCheck className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
                        <span className="badge badge-primary text-sm font-mono">#{customer.uniqueCode}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium">{customer.mobile}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Mail className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-medium">{customer.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Car className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="font-medium">{customerVehicles.length} vehicle{customerVehicles.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="icon-btn icon-btn-primary p-3"
                      title="Edit Customer"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete()}
                      className="icon-btn p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      title="Delete Customer"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => toggleCustomerExpansion(customer.id)}
                      className="icon-btn icon-btn-primary p-3"
                      title={isExpanded ? 'Collapse Orders' : 'View Service History'}
                    >
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                </div>
                
                {customer.address && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/60">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-gray-900 font-medium leading-relaxed">{customer.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Orders Section */}
              {isExpanded && (
                <div className="border-t border-gray-200/60 bg-gradient-to-r from-gray-50 to-gray-100/30">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                          <Wrench className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">
                          Service History ({orders.length} orders)
                        </h4>
                      </div>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order._id} className="card p-6 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                                  <Wrench className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 text-lg">#{order.orderNumber}</div>
                                  <div className="text-gray-600 flex items-center font-medium">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-gray-600 font-medium mb-1">{order.services.length} service{order.services.length !== 1 ? 's' : ''}</div>
                                <div className="badge badge-success text-lg font-bold">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {order.totalAmount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vehicle</span>
                                <p className="text-gray-900 font-semibold">{getVehicleInfo(order.vehicleId)}</p>
                              </div>
                              <div className="space-y-2">
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Services</span>
                                <p className="text-gray-900 font-semibold">
                                  {order.services.slice(0, 2).map(s => s.name).join(', ')}
                                  {order.services.length > 2 && (
                                    <span className="text-purple-600 font-bold"> +{order.services.length - 2} more</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            
                            {order.notes && (
                              <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200/60">
                                <p className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-2">Notes</p>
                                <p className="text-gray-700 leading-relaxed">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="card p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Wrench className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">No Service History</h3>
                        <p className="text-gray-500 text-lg leading-relaxed">This customer hasn't had any service orders yet. When they do, they'll appear here.</p>
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
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserCheck className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No customers found</h3>
          <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto leading-relaxed">
            {searchTerm ? 'Try adjusting your search terms or clear the search to see all customers.' : 'Ready to get started? Add your first customer to begin managing your client base.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowModal(true)}
              className="btn btn-primary px-6 py-3 text-base font-semibold"
            >
              <Plus size={20} />
              <span>Add First Customer</span>
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-8 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h2>
                  <p className="text-gray-600">Enter customer information below</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Unique Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.uniqueCode}
                  onChange={(e) => {
                    setFormData({...formData, uniqueCode: e.target.value});
                    clearFieldError('uniqueCode');
                  }}
                  className={`input py-3 text-base font-mono ${
                    validationErrors.uniqueCode 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  } ${!!editingCustomer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter unique customer code (e.g., CUST001)"
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
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    clearFieldError('name');
                  }}
                  className={`input py-3 text-base ${
                    validationErrors.name 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
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
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    clearFieldError('email');
                  }}
                  className={`input py-3 text-base ${
                    validationErrors.email 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="customer@example.com"
                />
                {validationErrors.email && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => {
                    setFormData({...formData, mobile: e.target.value});
                    clearFieldError('mobile');
                  }}
                  className={`input py-3 text-base font-mono ${
                    validationErrors.mobile 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {validationErrors.mobile && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.mobile}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({...formData, address: e.target.value});
                    clearFieldError('address');
                  }}
                  className={`input py-3 text-base leading-relaxed ${
                    validationErrors.address 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter complete address including street, city, state, and zip code"
                  rows={4}
                />
                {validationErrors.address && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.address}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  className="btn btn-primary flex-1 py-3 px-6 text-base font-bold"
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary flex-1 py-3 px-6 text-base font-semibold"
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