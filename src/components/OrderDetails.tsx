import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Order, ServiceItem } from '../types';
import { ArrowLeft, Save, Wrench, Plus, X, AlertCircle, User, Car, Phone, Mail, MapPin, Calendar } from 'lucide-react';

interface OrderDetailsProps {
  navigate?: (tabId: string, params?: any) => void;
  params?: { orderId?: string } | null;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ navigate, params }) => {
  const { orders, customers, vehicles, loadOrders, updateOrder } = useData();
  const orderId = params?.orderId || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!orders || orders.length === 0) {
      loadOrders();
    }
  }, [orders, loadOrders]);

  useEffect(() => {
    const found = orders.find(o => o._id === orderId || o.id === orderId);
    if (found) {
      setOrder(found);
      setServices(found.services);
    }
  }, [orders, orderId]);

  const customer = useMemo(() => {
    if (!order) return undefined;
    return customers.find(cu => cu._id === order.customerId || cu.id === order.customerId);
  }, [order, customers]);

  const vehicle = useMemo(() => {
    if (!order) return undefined;
    return vehicles.find(vh => vh._id === order.vehicleId || vh.id === order.vehicleId);
  }, [order, vehicles]);

  const totalAmount = useMemo(() => services.reduce((sum, s) => sum + (s.amount || 0), 0), [services]);

  const updateService = (index: number, field: keyof ServiceItem, value: string | number) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, [field]: field === 'amount' ? Number(value) : value } as ServiceItem : s));
    const key = field === 'amount' ? `service.${index}.amount` : `service.${index}.name`;
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const addService = () => setServices(prev => [...prev, { name: '', description: '', amount: 0 }]);
  const removeService = (index: number) => setServices(prev => prev.filter((_, i) => i !== index));

  const validate = () => {
    const e: { [key: string]: string } = {};
    if (services.length === 0) e['services'] = 'Add at least one service';
    services.forEach((s, i) => {
      if (!s.name.trim()) e[`service.${i}.name`] = 'Service name is required';
      if (!(typeof s.amount === 'number') || s.amount <= 0) e[`service.${i}.amount`] = 'Amount must be > 0';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!order) return;
    if (!validate()) return;
    setSaving(true);
    try {
      await updateOrder(order.orderNumber, { services, totalAmount });
      if (navigate) navigate('orders');
    } catch (err) {
      // noop, interceptor/logs already handle
    } finally {
      setSaving(false);
    }
  };

  if (!order) {
    return (
      <div className="card p-6">
        <div className="mb-4">
          <button onClick={() => navigate && navigate('orders')} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Orders</span>
          </button>
        </div>
        <div>Loading order...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <div className="text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <User size={16} className="text-blue-600" />
              {customer?.name || 'Unknown Customer'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Car size={16} className="text-green-600" />
              {vehicle ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.vehicleModel} (${vehicle.vehicleNumber})`.trim() : 'Unknown Vehicle'}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1 inline-flex items-center gap-1">
            <Calendar size={14} />
            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate && navigate('orders')} className="btn">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <button onClick={save} disabled={saving} className="btn btn-primary">
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            Customer Details
          </h3>
          {customer ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900 font-medium">{customer.name}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 text-gray-900">{customer.mobile}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{customer.email || 'N/A'}</span>
              </div>
              {customer.address && (
                <div className="flex items-start">
                  <MapPin className="h-3 w-3 text-gray-400 mr-1 mt-1" />
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2 text-gray-900">{customer.address}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Customer information not available</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
            <Car className="h-5 w-5 text-green-600 mr-2" />
            Vehicle Details
          </h3>
          {vehicle ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Vehicle:</span>
                <span className="ml-2 text-gray-900 font-medium">{vehicle.year} {vehicle.make} {vehicle.vehicleModel}</span>
              </div>
              <div>
                <span className="text-gray-600">Registration:</span>
                <span className="ml-2 text-gray-900 font-mono">{vehicle.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Color:</span>
                <span className="ml-2 text-gray-900">{vehicle.color || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Engine:</span>
                <span className="ml-2 text-gray-900 font-mono">{vehicle.engineNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Chassis:</span>
                <span className="ml-2 text-gray-900 font-mono">{vehicle.chassisNumber || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Vehicle information not available</p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <Wrench className="mr-2 text-purple-600" />
          Services
        </h3>

        {errors['services'] && (
          <p className="text-red-600 text-sm mb-2 flex items-center">
            <AlertCircle className="mr-1" size={16} />
            {errors['services']}
          </p>
        )}

        <div className="space-y-3">
          {services.map((s, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Service {idx + 1}</div>
                <button onClick={() => removeService(idx)} className="text-red-600 hover:text-red-800">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={s.name}
                  onChange={(e) => updateService(idx, 'name', e.target.value)}
                  placeholder="Service name"
                  className={`input ${errors[`service.${idx}.name`] ? 'border-red-500' : ''}`}
                />
                <input
                  value={s.description || ''}
                  onChange={(e) => updateService(idx, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  className="input"
                />
                <input
                  type="number"
                  value={s.amount}
                  onChange={(e) => updateService(idx, 'amount', e.target.value)}
                  placeholder="Amount"
                  className={`input ${errors[`service.${idx}.amount`] ? 'border-red-500' : ''}`}
                  min={0}
                  step={0.01}
                />
              </div>
              {(errors[`service.${idx}.name`] || errors[`service.${idx}.amount`]) && (
                <div className="text-red-600 text-xs mt-2">
                  {errors[`service.${idx}.name`] || errors[`service.${idx}.amount`]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={addService} className="btn">
            <Plus size={16} />
            <span>Add Service</span>
          </button>
          <div className="text-lg font-bold text-green-700">Total: ${totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {order.notes && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-3 text-lg">Additional Notes</h3>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;


