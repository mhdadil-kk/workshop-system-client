import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Plus, Edit2, Search, User, Phone, Mail, MapPin, AlertCircle, ChevronDown, ChevronRight, Wrench, DollarSign, Calendar } from 'lucide-react';
import { Customer, Order } from '../types';

const CustomersManagement: React.FC = () => {
  const { customers, vehicles, loading, loadCustomers, loadVehicles, loadOrders, addCustomer, updateCustomer, getOrdersByCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: ''
  });
  const [error, setError] = useState<string>('');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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
      if (editingCustomer) {
        await updateCustomer(editingCustomer.uniqueCode, formData);
      } else {
        await addCustomer(formData);
      }
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to save customer:', error);
      
      // Handle backend validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors: {[key: string]: string} = {};
        error.response.data.errors.forEach((err: {field: string, message: string}) => {
          backendErrors[err.field] = err.message;
        });
        setFieldErrors(backendErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to save customer. Please try again.';
        setError(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      address: ''
    });
    setError('');
    setFieldErrors({});
    setEditingCustomer(null);
    setShowModal(false);
  };
  

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      mobile: customer.mobile,
      address: customer.address || ''
    });
    setShowModal(true);
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

  const [customerOrders, setCustomerOrders] = useState<{[key: string]: Order[]}>({});

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header - Medium */}
      <div className="card p-6 bg-white border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-600">Total: {customers.length}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary px-4 py-3 text-base"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search - Medium */}
      <div className="card p-4 bg-white border border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers by name, mobile, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 pr-4 py-3 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400"
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
          const isExpanded = expandedCustomers.has(customer._id);
          const orders = customerOrders[customer._id] || [];
          
          return (
            <div key={customer._id} className="card overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200">
              {/* Customer Header - Medium */}
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{customer.name}</h3>
                        <span className="badge badge-primary text-sm px-2 py-1">{customer.uniqueCode}</span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{customer.mobile}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{customer.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{customer.address || 'No address'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Customer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleCustomerExpansion(customer._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={isExpanded ? 'Collapse Orders' : 'View Orders'}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
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
            <Users className="h-10 w-10 text-gray-400" />
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
                  <Users className="h-6 w-6 text-white" />
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
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input py-3 text-base border-gray-300 focus:ring-blue-500"
                  placeholder="Enter customer's full name"
                />
                {fieldErrors.name && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input py-3 text-base border-gray-300 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
                {fieldErrors.email && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.email}</span>
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
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className={`input py-3 text-base font-mono ${
                    fieldErrors.mobile 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {fieldErrors.mobile && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.mobile}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`input py-3 text-base leading-relaxed ${
                    fieldErrors.address 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter complete address including street, city, state, and zip code"
                  rows={4}
                />
                {fieldErrors.address && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.address}</span>
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