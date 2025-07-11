import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, User, Shield, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import FormField from '../../components/Forms/FormField';
import Input from '../../components/Forms/Input';
import Select from '../../components/Forms/Select';
import { apiService } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import type { User as UserType, UserCreate, UserUpdate } from '../../services/api';

const roleOptions = [
  { value: '', label: 'Select Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
  { value: 'editor', label: 'Editor' },
];

export default function UsersList() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form data for add/edit
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    password: '',
    role: 'user',
  });

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You need admin privileges to access user management.</p>
        </div>
      </div>
    );
  }

  // API hooks
  const { data: usersData, loading, execute: refetchUsers } = useApi(
    () => apiService.getUsers({ 
      q: searchTerm, 
      limit: itemsPerPage * 10, // Get more for pagination
      sort: '-created_at' 
    }),
    { 
      immediate: true,
      cacheKey: `users-list-${searchTerm}`,
      cacheTTL: 2 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  const { mutate: createUser, loading: creating } = useMutation(
    (data: UserCreate) => apiService.createUser(data)
  );

  const { mutate: updateUser, loading: updating } = useMutation(
    ({ id, data }: { id: string; data: UserUpdate }) => apiService.updateUser(id, data)
  );

  const { mutate: deleteUser, loading: deleting } = useMutation(
    (id: string) => apiService.deleteUser(id)
  );

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refetchUsers();
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        alert('User deleted successfully!');
        refetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedUser) {
        // Update existing user
        const updateData: UserUpdate = {
          email: formData.email,
          role: formData.role,
        };
        
        // Only include password if it's provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        await updateUser({ id: selectedUser.id, data: updateData });
        alert('User updated successfully!');
      } else {
        // Create new user
        if (!formData.password.trim()) {
          alert('Password is required for new users.');
          return;
        }
        
        await createUser(formData);
        alert('User created successfully!');
      }
      
      // Reset form and close modals
      setFormData({
        email: '',
        password: '',
        role: 'user',
      });
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      
      // Refresh data
      refetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      if (error instanceof Error && error.message.includes('Authentication')) {
        alert('Authentication expired. Please login again.');
        navigate('/admin/login');
      } else {
        alert('Failed to save user. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      email: '',
      password: '',
      role: 'user',
    });
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Get users and apply pagination
  const allUsers = usersData?.rows || [];
  const filteredUsers = allUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'editor':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Add User Modal
  const AddUserModal = () => (
    <Modal
      isOpen={isAddModalOpen}
      onClose={handleCancel}
      title="Add New User"
      size="md"
    >
      <form className="space-y-6" onSubmit={handleSaveUser}>
        <FormField label="Email Address" required>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="user@example.com"
            required
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter password"
            required
          />
        </FormField>

        <FormField label="Role" required>
          <Select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={roleOptions}
            required
          />
        </FormField>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={creating}>
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );

  // Edit User Modal
  const EditUserModal = () => (
    <Modal
      isOpen={isEditModalOpen}
      onClose={handleCancel}
      title="Edit User"
      size="md"
    >
      <form className="space-y-6" onSubmit={handleSaveUser}>
        <FormField label="Email Address" required>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </FormField>

        <FormField label="New Password">
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Leave blank to keep current password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to keep the current password
          </p>
        </FormField>

        <FormField label="Role" required>
          <Select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={roleOptions}
            required
          />
        </FormField>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={updating}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
        
        <div className="flex items-center justify-between mb-4">
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)} className="btn-hover">
            Add User
          </Button>
          
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${filteredUsers.length} users total`}
          </div>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="table-row-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Edit}
                        onClick={() => handleEdit(user)}
                        className="btn-hover"
                      >
                        Edit
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2}
                          onClick={() => handleDelete(user.id)}
                          className="btn-hover text-red-600 hover:text-red-800"
                          loading={deleting}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No users found.</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)} 
                className="mt-4"
                icon={Plus}
              >
                Add Your First User
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                  disabled={currentPage === 1}
                  className="btn-hover"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                  disabled={currentPage === totalPages}
                  className="btn-hover"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="btn-hover"
                    >
                      Previous
                    </Button>
                    {getPageNumbers().map((page) => (
                      <Button 
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm" 
                        onClick={() => handlePageChange(page)}
                        className="btn-hover"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="btn-hover"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <AddUserModal />
      <EditUserModal />
    </div>
  );
}