export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'super_admin' | 'admin';
  showroomId?: string;
  phone?: string;
  createdAt: string;
}

export interface Showroom {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  manager: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  showroomId: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  customerId: string;
  showroomId: string;
  mileage: number;
  color: string;
  createdAt: string;
}

export interface Service {
  id: string;
  vehicleId: string;
  customerId: string;
  showroomId: string;
  serviceType: string;
  description: string;
  cost: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  technician: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface DataContextType {
  users: User[];
  showrooms: Showroom[];
  customers: Customer[];
  vehicles: Vehicle[];
  services: Service[];
  
  // User operations
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Showroom operations
  addShowroom: (showroom: Omit<Showroom, 'id' | 'createdAt'>) => void;
  updateShowroom: (id: string, showroom: Partial<Showroom>) => void;
  deleteShowroom: (id: string) => void;
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  // Service operations
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
}