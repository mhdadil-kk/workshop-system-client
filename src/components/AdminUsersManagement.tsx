import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';

const AdminUsersManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Users Management</h1>
          <p className="text-gray-600 mt-1">User management functionality</p>
        </div>
      </div>

      {/* Not Available Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">
              User Management Not Available
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                User management functionality is not currently supported by the server. 
                The server only provides authentication endpoints for login and logout.
              </p>
              <p className="mt-2">
                To enable user management, the following would need to be implemented on the server:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>User creation endpoint (POST /api/users)</li>
                <li>User update endpoint (PUT /api/users/:id)</li>
                <li>User deletion endpoint (DELETE /api/users/:id)</li>
                <li>User listing endpoint (GET /api/users)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
          <p className="text-gray-500">
            This feature will be available once the server implements user management endpoints.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersManagement;