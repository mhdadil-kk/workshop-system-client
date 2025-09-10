import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { DataContextType, Customer, Vehicle, Order } from '../types';
import { customerAPI, vehicleAPI, orderAPI } from '../services/api';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

// Helper function to transform server data to client format
const transformServerData = (serverData: any): any => {
  if (!serverData) return serverData;
  
  // Handle arrays
  if (Array.isArray(serverData)) {
    return serverData.map(transformServerData);
  }
  
  // Handle objects with _id field - only add id if it doesn't exist
  if (serverData._id && !serverData.id) {
    return {
      ...serverData,
      id: serverData._id, // Add compatibility id field
    };
  }
  
  return serverData;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  console.log('[DataContext] DataProvider render');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState({
    customers: false,
    vehicles: false,
    orders: false,
  });

  const loadCustomers = useCallback(async () => {
    console.log('[DataContext] Loading customers...');
    setLoading(prev => ({ ...prev, customers: true }));
    try {
      const response = await customerAPI.getAll();
      console.log('[DataContext] Customers response:', response.data);
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        console.log('[DataContext] Setting customers:', transformedData);
        setCustomers(transformedData);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    setLoading(prev => ({ ...prev, vehicles: true }));
    try {
      const response = await vehicleAPI.getAll();
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setVehicles(transformedData);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const response = await orderAPI.getAll();
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setOrders(transformedData);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  }, []);

  // Remove automatic data loading - use lazy loading instead
  // Data will be loaded when components actually need it

  // Customer operations
  const addCustomer = useCallback(async (customerData: Omit<Customer, '_id' | 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await customerAPI.create(customerData);
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setCustomers(prev => [...prev, transformedData]);
        return transformedData;
      }
      throw new Error('Failed to create customer');
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (uniqueCode: string, customerData: Partial<Customer>) => {
    try {
      const response = await customerAPI.update(uniqueCode, customerData);
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setCustomers(prev => prev.map(customer => 
          customer.uniqueCode === uniqueCode ? transformedData : customer
        ));
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }, []);

  // Note: Delete operations not implemented in backend API

  const searchCustomers = useCallback(async (searchTerm: string): Promise<Customer[]> => {
    try {
      const response = await customerAPI.search(searchTerm);
      if (response.data && response.data.success) {
        return transformServerData(response.data.data);
      }
      return [];
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  }, []);

  // Vehicle operations
  const addVehicle = useCallback(async (vehicleData: Omit<Vehicle, '_id' | 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await vehicleAPI.create(vehicleData);
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setVehicles(prev => [...prev, transformedData]);
        return transformedData;
      }
      throw new Error('Failed to create vehicle');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  }, []);

  const updateVehicle = useCallback(async (vehicleNumber: string, vehicleData: Partial<Vehicle>) => {
    try {
      const response = await vehicleAPI.update(vehicleNumber, vehicleData);
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setVehicles(prev => prev.map(vehicle => 
          vehicle.vehicleNumber === vehicleNumber ? transformedData : vehicle
        ));
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }, []);

  // Note: Delete operations not implemented in backend API

  const searchVehicles = useCallback(async (searchTerm: string): Promise<Vehicle[]> => {
    try {
      const response = await vehicleAPI.search(searchTerm);
      if (response.data && response.data.success) {
        return transformServerData(response.data.data);
      }
      return [];
    } catch (error) {
      console.error('Error searching vehicles:', error);
      return [];
    }
  }, []);

  // Order operations
  const addOrder = useCallback(async (orderData: Omit<Order, '_id' | 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await orderAPI.create(orderData);
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setOrders(prev => [...prev, transformedData]);
      }
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }, []);

  const updateOrder = useCallback(async (orderNumber: string, orderData: Partial<Order>) => {
    try {
      const response = await orderAPI.update(orderNumber, orderData);
      if (response.data && response.data.success) {
        const transformedData = transformServerData(response.data.data);
        setOrders(prev => prev.map(order => 
          order.orderNumber === orderNumber ? transformedData : order
        ));
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }, []);

  // Note: Delete operations not implemented in backend API

  const getOrdersByCustomer = useCallback(async (customerId: string): Promise<Order[]> => {
    try {
      const response = await orderAPI.getByCustomer(customerId);
      if (response.data && response.data.success) {
        return transformServerData(response.data.data);
      }
      return [];
    } catch (error) {
      console.error('Error getting orders by customer:', error);
      return [];
    }
  }, []);

  const getOrdersByVehicle = useCallback(async (vehicleId: string): Promise<Order[]> => {
    try {
      const response = await orderAPI.getByVehicle(vehicleId);
      if (response.data && response.data.success) {
        return transformServerData(response.data.data);
      }
      return [];
    } catch (error) {
      console.error('Error getting orders by vehicle:', error);
      return [];
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([loadCustomers(), loadVehicles(), loadOrders()]);
  }, [loadCustomers, loadVehicles, loadOrders]);

  const value: DataContextType = useMemo(() => ({
    customers,
    vehicles,
    orders,
    loading,
    loadCustomers,
    loadVehicles,
    loadOrders,
    addCustomer,
    updateCustomer,
    searchCustomers,
    addVehicle,
    updateVehicle,
    searchVehicles,
    addOrder,
    updateOrder,
    getOrdersByCustomer,
    getOrdersByVehicle,
    refreshData,
  }), [
    customers,
    vehicles,
    orders,
    loading,
    loadCustomers,
    loadVehicles,
    loadOrders,
    addCustomer,
    updateCustomer,
    searchCustomers,
    addVehicle,
    updateVehicle,
    searchVehicles,
    addOrder,
    updateOrder,
    getOrdersByCustomer,
    getOrdersByVehicle,
    refreshData,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};