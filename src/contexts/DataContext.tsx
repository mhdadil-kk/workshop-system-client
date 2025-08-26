import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataContextType, User, Showroom, Customer, Vehicle, Service } from '../types';

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

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // User operations
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // Showroom operations
  const addShowroom = (showroomData: Omit<Showroom, 'id' | 'createdAt'>) => {
    const newShowroom: Showroom = {
      ...showroomData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setShowrooms(prev => [...prev, newShowroom]);
  };

  const updateShowroom = (id: string, showroomData: Partial<Showroom>) => {
    setShowrooms(prev => prev.map(showroom => 
      showroom.id === id ? { ...showroom, ...showroomData } : showroom
    ));
  };

  const deleteShowroom = (id: string) => {
    setShowrooms(prev => prev.filter(showroom => showroom.id !== id));
    // Also remove related data
    setUsers(prev => prev.filter(user => user.showroomId !== id));
    setCustomers(prev => prev.filter(customer => customer.showroomId !== id));
    setVehicles(prev => prev.filter(vehicle => vehicle.showroomId !== id));
    setServices(prev => prev.filter(service => service.showroomId !== id));
  };

  // Customer operations
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...customerData } : customer
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    // Also remove related vehicles and services
    setVehicles(prev => prev.filter(vehicle => vehicle.customerId !== id));
    setServices(prev => prev.filter(service => service.customerId !== id));
  };

  // Vehicle operations
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
    ));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    // Also remove related services
    setServices(prev => prev.filter(service => service.vehicleId !== id));
  };

  // Service operations
  const addService = (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...serviceData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, ...serviceData } : service
    ));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const value: DataContextType = {
    users,
    showrooms,
    customers,
    vehicles,
    services,
    addUser,
    updateUser,
    deleteUser,
    addShowroom,
    updateShowroom,
    deleteShowroom,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addService,
    updateService,
    deleteService,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};