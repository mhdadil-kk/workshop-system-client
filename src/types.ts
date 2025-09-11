// User model - matches server User model
export interface User {
  _id: string;
  id: string; // For compatibility
  email: string;
  name: string;
  mobile?: number;
  password?: string;
  role: 'staff' | 'admin';
  isBlock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Customer model - matches server Customer model
export interface Customer {
  _id: string;
  id: string; // For compatibility
  uniqueCode: string;
  name: string;
  email?: string;
  mobile: string; // Server uses mobile instead of phone
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Vehicle model - matches server Vehicle model
export interface Vehicle {
  _id: string;
  id: string; // For compatibility
  vehicleNumber: string;
  make: string;
  vehicleModel: string; // Server uses vehicleModel instead of model
  year?: number;
  color?: string;
  engineNumber?: string;
  chassisNumber?: string;
  // Optional link to customer if server provides it
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

// Service within Order - matches server IService
export interface ServiceItem {
  name: string;
  description?: string;
  amount: number;
}

// Order model - matches server Order model (replaces Service)
export interface Order {
  _id: string;
  id: string; // For compatibility
  orderNumber: string;
  customerId: string;
  vehicleId: string;
  services: ServiceItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface DataContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  orders: Order[];
  
  // Loading states
  loading: {
    customers: boolean;
    vehicles: boolean;
    orders: boolean;
  };
  
  // Data loading functions
  loadCustomers: () => Promise<void>;
  loadVehicles: () => Promise<void>;
  loadOrders: () => Promise<void>;
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, '_id' | 'id' | 'uniqueCode' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (uniqueCode: string, customer: Partial<Customer>) => Promise<void>;
  searchCustomers: (searchTerm: string) => Promise<Customer[]>;
  
  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, '_id' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  updateVehicle: (vehicleNumber: string, vehicle: Partial<Vehicle>) => Promise<void>;
  searchVehicles: (searchTerm: string) => Promise<Vehicle[]>;
  
  // Order operations
  addOrder: (order: Omit<Order, '_id' | 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrder: (orderNumber: string, order: Partial<Order>) => Promise<void>;
  getOrdersByCustomer: (customerId: string) => Promise<Order[]>;
  getOrdersByVehicle: (vehicleId: string) => Promise<Order[]>;
  
  
  // Data refresh
  refreshData: () => Promise<void>;
}