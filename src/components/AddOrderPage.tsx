import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { ChevronDown, ChevronRight, Plus, User, Car, Wrench, DollarSign, Save, X, AlertCircle } from 'lucide-react';
// Import types are used in the component interfaces

interface ServiceItem {
  name: string;
  description?: string;
  amount: number;
}

interface OrderFormData {
  orderNumber: string;
  customerId: string;
  vehicleId: string;
  services: ServiceItem[];
  totalAmount: number;
  notes?: string;
}

const AddOrderPage: React.FC = () => {
  const { customers, vehicles, loading, loadCustomers, loadVehicles, addOrder } = useData();
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    vehicle: false,
    services: false
  });
  
  const [formData, setFormData] = useState<OrderFormData>({
    orderNumber: `ORD-${Date.now()}`,
    customerId: '',
    vehicleId: '',
    services: [],
    totalAmount: 0,
    notes: ''
  });

  const [newService, setNewService] = useState<ServiceItem>({
    name: '',
    description: '',
    amount: 0
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadVehicles();
  }, [loadCustomers, loadVehicles]);

  useEffect(() => {
    const total = formData.services.reduce((sum, service) => sum + service.amount, 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.services]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addService = () => {
    if (!newService.name.trim() || newService.amount <= 0) {
      setValidationErrors({ service: 'Service name and amount are required' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { ...newService }]
    }));

    setNewService({ name: '', description: '', amount: 0 });
    setValidationErrors({});
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    // Validation
    const errors: {[key: string]: string} = {};
    if (!formData.customerId) errors.customerId = 'Please select a customer';
    if (!formData.vehicleId) errors.vehicleId = 'Please select a vehicle';
    if (formData.services.length === 0) errors.services = 'Please add at least one service';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await addOrder({
        orderNumber: formData.orderNumber,
        customerId: formData.customerId,
        vehicleId: formData.vehicleId,
        services: formData.services,
        totalAmount: formData.totalAmount,
        notes: formData.notes
      });

      // Reset form
      setFormData({
        orderNumber: `ORD-${Date.now()}`,
        customerId: '',
        vehicleId: '',
        services: [],
        totalAmount: 0,
        notes: ''
      });

      alert('Order created successfully!');
    } catch (error) {
      console.error('Failed to create order:', error);
      setValidationErrors({ submit: 'Failed to create order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c._id === formData.customerId);
  const selectedVehicle = vehicles.find(v => v._id === formData.vehicleId);
  const customerVehicles = vehicles.filter(v => v._id === formData.customerId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card p-8 bg-gradient-to-r from-white to-gray-50/30">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Create New Order</h1>
            <p className="text-gray-600 text-lg">Add customer, vehicle, and service details to create a new workshop order</p>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/60">
          <p className="text-blue-800 font-semibold flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Order Number: <span className="font-mono font-bold ml-2 text-blue-900">{formData.orderNumber}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Section */}
        <div className="card overflow-hidden animate-slide-in">
          <button
            type="button"
            onClick={() => toggleSection('customer')}
            className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">1. Customer Details</h3>
                <p className="text-gray-600 font-medium">
                  {selectedCustomer ? selectedCustomer.name : 'Select a customer to continue'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedCustomer && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              {expandedSections.customer ? <ChevronDown size={24} className="text-gray-400" /> : <ChevronRight size={24} className="text-gray-400" />}
            </div>
          </button>

          {expandedSections.customer && (
            <div className="px-8 pb-8 border-t border-gray-200/60 bg-gradient-to-r from-white to-gray-50/20">
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, customerId: e.target.value, vehicleId: '' }));
                      setValidationErrors(prev => ({ ...prev, customerId: '' }));
                    }}
                    className={`input text-base py-4 ${
                      validationErrors.customerId 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.mobile}
                      </option>
                    ))}
                  </select>
                {validationErrors.customerId && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.customerId}</span>
                  </div>
                )}

                {selectedCustomer && (
                  <div className="card p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/60">
                    <h4 className="font-bold text-blue-900 mb-4 text-lg">✓ Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Email</span>
                        <p className="text-gray-900 font-semibold">{selectedCustomer.email || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Phone</span>
                        <p className="text-gray-900 font-semibold">{selectedCustomer.mobile}</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Address</span>
                        <p className="text-gray-900 font-semibold">{selectedCustomer.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Section */}
        <div className="card overflow-hidden animate-slide-in" style={{ animationDelay: '100ms' }}>
          <button
            type="button"
            onClick={() => toggleSection('vehicle')}
            className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <Car className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">2. Vehicle Details</h3>
                <p className="text-gray-600 font-medium">
                  {selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.vehicleModel}` : 'Select a vehicle for service'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedVehicle && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              {expandedSections.vehicle ? <ChevronDown size={24} className="text-gray-400" /> : <ChevronRight size={24} className="text-gray-400" />}
            </div>
          </button>

          {expandedSections.vehicle && (
            <div className="px-8 pb-8 border-t border-gray-200/60 bg-gradient-to-r from-white to-gray-50/20">
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    Select Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, vehicleId: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, vehicleId: '' }));
                    }}
                    className={`input text-base py-4 ${
                      validationErrors.vehicleId 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    } ${!formData.customerId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={!formData.customerId}
                  >
                    <option value="">
                      {!formData.customerId ? 'Select a customer first' : 'Choose a vehicle...'}
                    </option>
                    {customerVehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.year} {vehicle.make} {vehicle.vehicleModel} - {vehicle.vehicleNumber}
                      </option>
                    ))}
                  </select>
                {validationErrors.vehicleId && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.vehicleId}</span>
                  </div>
                )}

                {selectedVehicle && (
                  <div className="card p-6 bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200/60">
                    <h4 className="font-bold text-green-900 mb-4 text-lg">✓ Vehicle Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Registration</span>
                        <p className="text-gray-900 font-mono font-bold text-lg">{selectedVehicle.vehicleNumber}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Color</span>
                        <p className="text-gray-900 font-semibold">{selectedVehicle.color || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Engine</span>
                        <p className="text-gray-900 font-mono">{selectedVehicle.engineNumber || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Chassis</span>
                        <p className="text-gray-900 font-mono">{selectedVehicle.chassisNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="card overflow-hidden animate-slide-in" style={{ animationDelay: '200ms' }}>
          <button
            type="button"
            onClick={() => toggleSection('services')}
            className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <Wrench className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">3. Service Details</h3>
                <p className="text-gray-600 font-medium">
                  {formData.services.length} service{formData.services.length !== 1 ? 's' : ''} added
                  {formData.services.length > 0 && (
                    <span className="ml-2 text-purple-600 font-bold">${formData.totalAmount.toFixed(2)}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {formData.services.length > 0 && (
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              )}
              {expandedSections.services ? <ChevronDown size={24} className="text-gray-400" /> : <ChevronRight size={24} className="text-gray-400" />}
            </div>
          </button>

          {expandedSections.services && (
            <div className="px-8 pb-8 border-t border-gray-200/60 bg-gradient-to-r from-white to-gray-50/20">
              <div className="mt-6 space-y-6">
                {/* Add New Service */}
                <div className="card p-6 bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200/60">
                  <h4 className="font-bold text-purple-900 mb-4 text-lg">Add New Service</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">
                        Service Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                        className="input py-3 text-base"
                        placeholder="e.g., Oil Change, Brake Service"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newService.description}
                        onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                        className="input py-3 text-base"
                        placeholder="Service details and notes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 text-gray-600 font-bold text-lg">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newService.amount}
                          onChange={(e) => setNewService(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className="input rounded-l-none py-3 text-base font-semibold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addService}
                    className="btn btn-primary mt-4 px-6 py-3 text-base font-semibold"
                  >
                    <Plus size={20} />
                    <span>Add Service</span>
                  </button>
                  {validationErrors.service && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.service}</span>
                    </div>
                  )}
                </div>

                {/* Services List */}
                {formData.services.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">✓ Added Services ({formData.services.length})</h4>
                    <div className="space-y-3">
                      {formData.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-lg">{service.name}</div>
                            {service.description && (
                              <div className="text-gray-600 mt-1">{service.description}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-green-600 text-xl">${service.amount.toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="icon-btn p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationErrors.services && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.services}</span>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input py-4 text-base leading-relaxed"
                    rows={4}
                    placeholder="Any additional notes, special instructions, or customer requests..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Submit */}
        <div className="card p-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 animate-slide-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Order Summary</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Total Amount</p>
              <div className="text-4xl font-bold text-green-600">
                ${formData.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {validationErrors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{validationErrors.submit}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting || loading.customers || loading.vehicles}
              className="btn btn-primary flex-1 py-4 px-8 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Save size={24} />
                  <span>Create Order</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  orderNumber: `ORD-${Date.now()}`,
                  customerId: '',
                  vehicleId: '',
                  services: [],
                  totalAmount: 0,
                  notes: ''
                });
                setValidationErrors({});
              }}
              className="btn btn-secondary px-8 py-4 text-lg font-semibold"
            >
              Reset Form
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddOrderPage;
