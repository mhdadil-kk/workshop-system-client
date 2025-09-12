import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, Phone, Mail, User, AlertCircle } from 'lucide-react';

interface Showroom {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  manager: string;
  createdAt: string;
}

const ShowroomsManagement: React.FC = () => {
  // Mock showrooms data since not implemented in backend
  const [showrooms, setShowrooms] = useState<Showroom[]>([
    {
      id: '1',
      name: 'Main Showroom',
      location: '123 Main Street, City Center',
      phone: '+1-234-567-8900',
      email: 'main@workshop.com',
      manager: 'John Doe',
      createdAt: new Date().toISOString()
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    manager: ''
  });
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const filteredShowrooms = showrooms.filter(showroom =>
    showroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    showroom.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    showroom.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock CRUD functions
  const addShowroom = (data: typeof formData) => {
    const newShowroom: Showroom = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    setShowrooms(prev => [...prev, newShowroom]);
  };

  const updateShowroom = (id: string, data: typeof formData) => {
    setShowrooms(prev => prev.map(showroom => 
      showroom.id === id ? { ...showroom, ...data } : showroom
    ));
  };

  const deleteShowroom = (id: string) => {
    setShowrooms(prev => prev.filter(showroom => showroom.id !== id));
  };

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
      if (editingShowroom) {
        updateShowroom(editingShowroom.id, formData);
      } else {
        addShowroom(formData);
      }
      resetForm();
    } catch (error: any) {
      console.error('Failed to save showroom:', error);
      
      // Handle backend validation errors - display backend messages directly
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors: {[key: string]: string} = {};
        error.response.data.errors.forEach((err: {field: string, message: string}) => {
          backendErrors[err.field] = err.message;
        });
        setFieldErrors(backendErrors);
      } else if (error.response?.data?.message) {
        // Display backend error message directly
        setError(error.response.data.message);
      } else {
        setError('Failed to save showroom. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      phone: '',
      email: '',
      manager: ''
    });
    setError('');
    setFieldErrors({});
    setEditingShowroom(null);
    setShowModal(false);
  };

  const handleEdit = (showroom: Showroom) => {
    setEditingShowroom(showroom);
    setFormData({
      name: showroom.name,
      location: showroom.location,
      phone: showroom.phone,
      email: showroom.email,
      manager: showroom.manager
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this showroom? This will also delete all related data.')) {
      deleteShowroom(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Showrooms Management</h1>
          <p className="text-gray-600 mt-1">Manage all showroom locations and their details</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Add Showroom</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search showrooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Showrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShowrooms.map((showroom) => (
          <div key={showroom.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{showroom.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(showroom.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(showroom)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(showroom.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Building2 className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">{showroom.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">{showroom.phone}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">{showroom.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">Manager: {showroom.manager}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingShowroom ? 'Edit Showroom' : 'Add New Showroom'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Showroom Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                    fieldErrors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter showroom name"
                />
                {fieldErrors.name && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                    fieldErrors.location 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter complete address"
                  rows={2}
                />
                {fieldErrors.location && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.location}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                    fieldErrors.phone 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter phone number"
                />
                {fieldErrors.phone && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                    fieldErrors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter email address"
                />
                {fieldErrors.email && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                    fieldErrors.manager 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter manager name"
                />
                {fieldErrors.manager && (
                  <div className="mt-1 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{fieldErrors.manager}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingShowroom ? 'Update' : 'Add'} Showroom
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

export default ShowroomsManagement;