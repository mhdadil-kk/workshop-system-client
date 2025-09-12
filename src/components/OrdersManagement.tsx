import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Calendar, User, Car, Wrench, ChevronDown, ChevronRight, X, Save, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { useData } from '../contexts/DataContext';
import { 
  type ServiceInput 
} from '../utils/validation';
import Toast from './Toast';

interface NewOrderData {
  customer: {
    name: string;
    email: string;
    mobile: string;
    address: string;
  };
  vehicle: {
    vehicleNumber: string;
    make: string;
    vehicleModel: string;
    year?: number;
    color: string;
    engineNumber: string;
    chassisNumber: string;
  };
  services: ServiceInput[];
  notes: string;
}

const OrdersManagement: React.FC<any> = ({ navigate }) => {
  const { orders, customers, vehicles, loading, loadOrders, loadCustomers, loadVehicles, addOrder, addCustomer, addVehicle, searchCustomers, searchVehicles } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Add Order Modal State
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    vehicle: false,
    services: false
  });
  
  // Independent modes and selections
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [vehicleMode, setVehicleMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicleSuggestions, setVehicleSuggestions] = useState<any[]>([]);
  
  const [newOrderData, setNewOrderData] = useState<NewOrderData>({
    customer: {
      name: '',
      email: '',
      mobile: '',
      address: ''
    },
    vehicle: {
      vehicleNumber: '',
      make: '',
      vehicleModel: '',
      year: undefined,
      color: '',
      engineNumber: '',
      chassisNumber: ''
    },
    services: [],
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper functions for Add Order Modal
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateCustomerData = (field: string, value: string) => {
    setNewOrderData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (formErrors[`customer.${field}`]) {
      setFormErrors(prev => ({ ...prev, [`customer.${field}`]: '' }));
    }
  };

  const updateVehicleData = (field: string, value: string | number) => {
    setNewOrderData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: field === 'year' ? (value === '' ? undefined : Number(value)) : value
      }
    }));
    // Clear error when user starts typing
    if (formErrors[`vehicle.${field}`]) {
      setFormErrors(prev => ({ ...prev, [`vehicle.${field}`]: '' }));
    }
  };

  const addService = () => {
    setNewOrderData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', amount: 0 }]
    }));
  };

  const updateService = (index: number, field: keyof ServiceInput, value: string | number) => {
    setNewOrderData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: field === 'amount' ? Number(value) : value } : service
      )
    }));
  };

  const removeService = (index: number) => {
    setNewOrderData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const getTotalAmount = () => {
    return newOrderData.services.reduce((sum, service) => sum + (service.amount || 0), 0);
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    if (customerMode === 'new') {
      const name = newOrderData.customer.name.trim();
      const mobile = newOrderData.customer.mobile.trim();
      if (!name) errors['customer.name'] = 'Customer name is required';
      if (!mobile) {
        errors['customer.mobile'] = 'Mobile is required';
      } else if (!/^\d{10,}$/.test(mobile)) {
        errors['customer.mobile'] = 'Enter at least 10 digits';
      }
    } else {
      if (!selectedCustomerId) errors['selectedCustomer'] = 'Please select a customer';
    }
    if (vehicleMode === 'new') {
      if (!newOrderData.vehicle.vehicleNumber.trim()) errors['vehicle.vehicleNumber'] = 'Vehicle number is required';
      if (!newOrderData.vehicle.make.trim()) errors['vehicle.make'] = 'Make is required';
      if (!newOrderData.vehicle.vehicleModel.trim()) errors['vehicle.vehicleModel'] = 'Model is required';
    } else {
      if (!selectedVehicleId) errors['selectedVehicle'] = 'Please select a vehicle';
    }
    if (newOrderData.services.length === 0) {
      errors['services'] = 'Add at least one service';
    } else {
      newOrderData.services.forEach((s, i) => {
        if (!s.name.trim()) errors[`service.${i}.name`] = 'Service name is required';
        if (!(typeof s.amount === 'number') || s.amount <= 0) errors[`service.${i}.amount`] = 'Amount must be greater than 0';
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let customerId: string;
      let vehicleId: string;

      if (customerMode === 'existing') {
        customerId = selectedCustomerId;
      } else {
        const created = await addCustomer({
          name: newOrderData.customer.name.trim(),
          email: newOrderData.customer.email?.trim() || undefined,
          mobile: newOrderData.customer.mobile.trim(),
          address: newOrderData.customer.address?.trim() || undefined
        } as any);
        customerId = created._id;
      }

      if (vehicleMode === 'existing') {
        vehicleId = selectedVehicleId;
      } else {
        const vehicleData = {
          vehicleNumber: newOrderData.vehicle.vehicleNumber,
          make: newOrderData.vehicle.make,
          vehicleModel: newOrderData.vehicle.vehicleModel,
          year: newOrderData.vehicle.year || undefined,
          color: newOrderData.vehicle.color || undefined,
          engineNumber: newOrderData.vehicle.engineNumber || undefined,
          chassisNumber: newOrderData.vehicle.chassisNumber || undefined
        };
        const createdVehicle = await addVehicle(vehicleData as any);
        vehicleId = createdVehicle._id;
      }

      // Create order with backend-expected structure
        await addOrder({
          customerId,
          vehicleId,
          services: newOrderData.services.map(service => ({
            name: service.name.trim(),
            description: service.description?.trim() || undefined,
            amount: service.amount
          })),
          notes: newOrderData.notes || undefined
        } as any);

      // Reset form and close modal
      resetForm();
      setShowAddOrderModal(false);
      
      // Reload all data
      await Promise.all([loadOrders(), loadCustomers(), loadVehicles()]);
      
      // Show success toast
      setToast({ message: 'Order created successfully!', type: 'success' });
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Display backend error messages directly
      let errorMessage = 'Failed to create order. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = errors.map(err => err.message).join(', ');
        }
      }
      
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewOrderData({
      customer: {
        name: '',
        email: '',
        mobile: '',
        address: ''
      },
      vehicle: {
        vehicleNumber: '',
        make: '',
        vehicleModel: '',
        year: undefined,
        color: '',
        engineNumber: '',
        chassisNumber: ''
      },
      services: [],
      notes: ''
    });
    setCustomerMode('existing');
    setVehicleMode('existing');
    setSelectedCustomerId('');
    setSelectedVehicleId('');
    setCustomerQuery('');
    setVehicleQuery('');
    setCustomerSuggestions([]);
    setVehicleSuggestions([]);
    setExpandedSections({ customer: true, vehicle: false, services: false });
    setFormErrors({});
  };

  // Load data when component mounts
  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadVehicles();
  }, [loadOrders, loadCustomers, loadVehicles]);

  // Autocomplete: customers (code-only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = customerQuery.trim();
      if (!q) { setCustomerSuggestions([]); return; }
      try {
        const results = await searchCustomers(q);
        const qLower = q.toLowerCase();
        const filtered = (results || []).filter((c: any) => (c.uniqueCode || '').toLowerCase().includes(qLower));
        if (!cancelled) setCustomerSuggestions(filtered);
      } catch {
        setCustomerSuggestions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [customerQuery, searchCustomers]);

  // Autocomplete: vehicles (vehicle number only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = vehicleQuery.trim();
      if (!q) { setVehicleSuggestions([]); return; }
      try {
        const results = await searchVehicles(q);
        const qLower = q.toLowerCase();
        const filtered = (results || []).filter((v: any) => (v.vehicleNumber || '').toLowerCase().includes(qLower));
        if (!cancelled) setVehicleSuggestions(filtered);
      } catch {
        setVehicleSuggestions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [vehicleQuery, searchVehicles]);

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c._id === order.customerId);
    const vehicle = vehicles.find(v => v._id === order.vehicleId);
    
    return (
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    return `${vehicle.year || ''} ${vehicle.make} ${vehicle.vehicleModel} (${vehicle.vehicleNumber})`.trim();
  };

  const handleViewOrder = (order: Order) => {
    if (navigate) {
      navigate('orderDetails', { orderId: order._id });
      return;
    }
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (expandedOrders.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Orders Management</h1>
          <p className="text-gray-600 text-lg">Manage workshop orders and services with ease</p>
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{orders.length} Total Orders</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>${orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()} Revenue</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddOrderModal(true)}
          className="btn btn-primary px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by number, customer, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12 pr-4 py-3 text-base bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-blue-400/20"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Total:</span>
              <span className="text-sm font-bold text-gray-900">{filteredOrders.length} orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading.orders && (
        <div className="card p-12 text-center">
          <div className="spinner w-12 h-12 mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Orders</h3>
          <p className="text-gray-500">Please wait while we fetch your order data...</p>
        </div>
      )}

      {/* Orders List */}
      {!loading.orders && (
        <div className="space-y-4">
        {filteredOrders.map((order, index) => {
          const customer = customers.find(c => c._id === order.customerId);
          const vehicle = vehicles.find(v => v._id === order.vehicleId);
          const isExpanded = expandedOrders.has(order._id);
          
          return (
            <div 
              key={order._id} 
              className="card overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-in border-l-4 border-l-blue-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Order Header */}
              <div className="p-6 bg-gradient-to-r from-white to-gray-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                        <Wrench className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">#{order.orderNumber}</h3>
                        <div className="badge badge-success text-xs font-bold px-2 py-1">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <div className="p-1 bg-blue-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <div className="p-1 bg-purple-100 rounded-lg">
                            <Wrench className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-medium">{order.services.length} service{order.services.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {handleViewOrder(order)}}
                      className="icon-btn icon-btn-primary p-3 hover:scale-110 transition-all duration-200"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {false && (
                    <button
                      onClick={() => {toggleOrderExpansion(order._id)}}
                      className="icon-btn icon-btn-primary p-3 hover:scale-110 transition-all duration-200"
                      title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    )}
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
                    <div className="p-2 bg-blue-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-200">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">{customer?.name || 'Unknown Customer'}</div>
                      <div className="text-xs text-blue-700 font-medium">{customer?.mobile || 'No contact'}</div>
                    </div>
                  </div>
                  <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
                    <div className="p-2 bg-green-500 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-200">
                      <Car className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">
                        {vehicle ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.vehicleModel}`.trim() : 'Unknown Vehicle'}
                      </div>
                      <div className="text-xs text-green-700 font-mono font-medium">{vehicle?.vehicleNumber || 'No registration'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details Section removed in favor of dedicated page */}
            </div>
          );
        })}
        </div>
      )}

      {!loading.orders && filteredOrders.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No orders found</h3>
          <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto leading-relaxed">
            {searchTerm ? 'Try adjusting your search terms or clear the search to see all orders.' : 'Ready to get started? Create your first order to begin managing workshop services.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowAddOrderModal(true)}
              className="btn btn-primary px-6 py-3 text-base font-semibold"
            >
              <Plus size={20} />
              <span>Create First Order</span>
            </button>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between p-8 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600">#{selectedOrder.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="icon-btn p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Order Number</label>
                  <p className="text-lg font-bold text-gray-900">#{selectedOrder.orderNumber}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Date Created</label>
                  <p className="text-lg font-semibold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <label className="block text-sm font-bold text-blue-700 uppercase tracking-wide mb-2">Customer</label>
                  <p className="text-base font-bold text-gray-900">{getCustomerName(selectedOrder.customerId)}</p>
                </div>
                
                <div className="card p-4 bg-gradient-to-r from-green-50 to-green-100/50">
                  <label className="block text-sm font-bold text-green-700 uppercase tracking-wide mb-2">Vehicle</label>
                  <p className="text-base font-bold text-gray-900">{getVehicleInfo(selectedOrder.vehicleId)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Services Performed</label>
                <div className="space-y-3">
                  {selectedOrder.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/60">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                      </div>
                      <span className="font-bold text-lg text-green-600">${service.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Additional Notes</label>
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200/60">
                    <p className="text-gray-700 leading-relaxed">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">Total Amount:</span>
                  <span className="text-3xl font-bold text-green-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between p-8 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
                  <p className="text-gray-600">Add customer, vehicle, and service details</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddOrderModal(false)}
                className="icon-btn p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              

              {/* Existing Customer/Vehicle Selection */}
              {false && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={''}
                      onChange={() => {}}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors['selectedCustomer'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map(customer => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} - {customer.mobile}
                        </option>
                      ))}
                    </select>
                    {formErrors['selectedCustomer'] && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {formErrors['selectedCustomer']}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Vehicle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={''}
                      onChange={() => {}}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors['selectedVehicle'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose a vehicle...</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.vehicleNumber} - {vehicle.make} {vehicle.vehicleModel}
                        </option>
                      ))}
                    </select>
                    {formErrors['selectedVehicle'] && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {formErrors['selectedVehicle']}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Section */}
              {true && (
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('customer')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="text-blue-600" size={20} />
                      <span className="font-semibold text-gray-900">1. Customer Details</span>
                    </div>
                    {expandedSections.customer ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                
                {expandedSections.customer && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center text-sm">
                        <input type="radio" checked={customerMode === 'existing'} onChange={() => setCustomerMode('existing')} />
                        <span className="ml-2">Existing</span>
                      </label>
                      <label className="inline-flex items-center text-sm">
                        <input type="radio" checked={customerMode === 'new'} onChange={() => setCustomerMode('new')} />
                        <span className="ml-2">New</span>
                      </label>
                    </div>
                    {customerMode === 'existing' ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Search by customer code</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            value={customerQuery}
                            onChange={(e) => setCustomerQuery(e.target.value)}
                            placeholder="Type to search..."
                            className={`input pl-9 w-full ${formErrors['selectedCustomer'] ? 'border-red-500' : ''}`}
                          />
                          {customerSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-30 max-h-56 overflow-auto">
                              {customerSuggestions.map((c: any) => (
                                <button
                                  key={c._id}
                                  type="button"
                                  onClick={() => { setSelectedCustomerId(c._id); setCustomerQuery(''); setCustomerSuggestions([]); }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                >
                                  <div className="font-semibold">{c.uniqueCode}</div>
                                  <div className="text-xs text-gray-600">{c.name}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <select
                          value={selectedCustomerId}
                          onChange={(e) => setSelectedCustomerId(e.target.value)}
                          className={`input w-full ${formErrors['selectedCustomer'] ? 'border-red-500' : ''}`}
                        >
                          <option value="">Or choose by code...</option>
                          {customers.map(c => (
                            <option key={c._id} value={c._id}>{c.uniqueCode} - {c.name}</option>
                          ))}
                        </select>
                        {formErrors['selectedCustomer'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={16} className="mr-1" />{formErrors['selectedCustomer']}</p>
                        )}
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newOrderData.customer.name}
                          onChange={(e) => updateCustomerData('name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors['customer.name'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter customer name"
                        />
                        {formErrors['customer.name'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors['customer.name']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={newOrderData.customer.mobile}
                          onChange={(e) => updateCustomerData('mobile', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors['customer.mobile'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter mobile number"
                        />
                        {formErrors['customer.mobile'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors['customer.mobile']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={newOrderData.customer.email}
                          onChange={(e) => updateCustomerData('email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors['customer.email'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter email address (optional)"
                        />
                        {formErrors['customer.email'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors['customer.email']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={newOrderData.customer.address}
                          onChange={(e) => updateCustomerData('address', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors['customer.address'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter address (optional)"
                        />
                        {formErrors['customer.address'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors['customer.address']}
                          </p>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Vehicle Section */}
              {true && (
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('vehicle')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Car className="text-green-600" size={20} />
                      <span className="font-semibold text-gray-900">2. Vehicle Details</span>
                    </div>
                    {expandedSections.vehicle ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                
                {expandedSections.vehicle && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center text-sm"><input type="radio" checked={vehicleMode === 'existing'} onChange={() => setVehicleMode('existing')} /><span className="ml-2">Existing</span></label>
                      <label className="inline-flex items-center text-sm"><input type="radio" checked={vehicleMode === 'new'} onChange={() => setVehicleMode('new')} /><span className="ml-2">New</span></label>
                    </div>
                    {vehicleMode === 'existing' ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Search by vehicle number</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input value={vehicleQuery} onChange={(e) => setVehicleQuery(e.target.value)} placeholder="Type to search..." className={`input pl-9 w-full ${formErrors['selectedVehicle'] ? 'border-red-500' : ''}`} />
                          {vehicleSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-30 max-h-56 overflow-auto">
                              {vehicleSuggestions.map((v: any) => (
                                <button key={v._id} type="button" onClick={() => { setSelectedVehicleId(v._id); setVehicleQuery(''); setVehicleSuggestions([]); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
                                  <div className="font-semibold">{v.vehicleNumber}</div>
                                  <div className="text-xs text-gray-600">{v.make} {v.vehicleModel}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className={`input w-full ${formErrors['selectedVehicle'] ? 'border-red-500' : ''}`}>
                          <option value="">Or choose by number...</option>
                          {vehicles.map(v => (<option key={v._id} value={v._id}>{v.vehicleNumber}</option>))}
                        </select>
                        {formErrors['selectedVehicle'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={16} className="mr-1" />{formErrors['selectedVehicle']}</p>
                        )}
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newOrderData.vehicle.vehicleNumber}
                          onChange={(e) => updateVehicleData('vehicleNumber', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors['vehicle.vehicleNumber'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter vehicle number"
                        />
                        {formErrors['vehicle.vehicleNumber'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors['vehicle.vehicleNumber']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Make <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newOrderData.vehicle.make}
                          onChange={(e) => updateVehicleData('make', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors['vehicle.make'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter vehicle make"
                        />
                        {formErrors['vehicle.make'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors['vehicle.make']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newOrderData.vehicle.vehicleModel}
                          onChange={(e) => updateVehicleData('vehicleModel', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors['vehicle.vehicleModel'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter vehicle model"
                        />
                        {formErrors['vehicle.vehicleModel'] && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors['vehicle.vehicleModel']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="number"
                          value={newOrderData.vehicle.year || ''}
                          onChange={(e) => updateVehicleData('year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter year (optional)"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="text"
                          value={newOrderData.vehicle.color}
                          onChange={(e) => updateVehicleData('color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter color (optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number</label>
                        <input
                          type="text"
                          value={newOrderData.vehicle.engineNumber}
                          onChange={(e) => updateVehicleData('engineNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter engine number (optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number</label>
                        <input
                          type="text"
                          value={newOrderData.vehicle.chassisNumber}
                          onChange={(e) => updateVehicleData('chassisNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter chassis number (optional)"
                        />
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Service Details Accordion */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('services')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Wrench className="text-orange-600" size={20} />
                    <span className="font-semibold text-gray-900">3. Service Details</span>
                  </div>
                  {expandedSections.services ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                
                {expandedSections.services && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Services</h4>
                      <button
                        onClick={addService}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <Plus size={16} />
                        <span>Add Service</span>
                      </button>
                    </div>

                    {formErrors['services'] && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {formErrors['services']}
                      </p>
                    )}

                    <div className="space-y-3">
                      {newOrderData.services.map((service, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">Service {index + 1}</h5>
                            <button
                              onClick={() => {removeService(index)}}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={service.name}
                                onChange={(e) => updateService(index, 'name', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  formErrors[`service.${index}.name`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter service name"
                              />
                              {formErrors[`service.${index}.name`] && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                  <AlertCircle size={14} className="mr-1" />
                                  {formErrors[`service.${index}.name`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={service.description || ''}
                                onChange={(e) => updateService(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter description (optional)"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={service.amount}
                                onChange={(e) => updateService(index, 'amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  formErrors[`service.${index}.amount`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter amount"
                                min="0"
                                step="0.01"
                              />
                              {formErrors[`service.${index}.amount`] && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                  <AlertCircle size={14} className="mr-1" />
                                  {formErrors[`service.${index}.amount`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Amount Display */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-800">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-900">${getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                      <textarea
                        value={newOrderData.notes}
                        onChange={(e) => setNewOrderData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter any additional notes (optional)"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowAddOrderModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Order...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Create Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OrdersManagement;
