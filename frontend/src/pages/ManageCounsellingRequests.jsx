import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiSearch, FiEdit, FiMail, FiPhone, FiCalendar, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageCounsellingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm, setEditForm] = useState({
    status: '',
    notes: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      params.append('limit', '100');

      const response = await axiosInstance.get(`/counselling/leads?${params.toString()}`);
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load counselling requests');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request._id);
    setEditForm({
      status: request.status,
      notes: request.notes || '',
    });
  };

  const handleSave = async (requestId) => {
    try {
      await axiosInstance.put(`/counselling/leads/${requestId}`, editForm);
      toast.success('Counselling request updated successfully');
      setEditingRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update request');
    }
  };

  const handleCancel = () => {
    setEditingRequest(null);
    setEditForm({ status: '', notes: '' });
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: 'New', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: FiClock },
      contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: FiCheckCircle },
      completed: { label: 'Closed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: FiXCircle },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: FiClock };
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = searchTerm === '' || 
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.institution.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading counselling requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Counselling Requests</h1>
        <Link to="/admin/dashboard" className="btn-outline">
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or institution..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              className="input-field w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">New</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="card text-center py-12">
          <FiMail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No counselling requests found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Full Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Course Interest</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Submission Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => {
                const statusInfo = getStatusDisplay(request.status);
                const StatusIcon = statusInfo.icon;
                const isEditing = editingRequest === request._id;

                return (
                  <tr
                    key={request._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {request.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <FiPhone className="w-4 h-4" />
                        <span>{request.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {request.institution}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          className="input-field text-sm"
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        >
                          <option value="pending">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="completed">Closed</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(request._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes Section for Editing */}
      {editingRequest && (
        <div className="card mt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Notes</h2>
          <textarea
            className="input-field w-full min-h-[100px]"
            placeholder="Add notes about this counselling request..."
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
          />
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total: {filteredRequests.length} request(s)
      </div>
    </div>
  );
};

export default ManageCounsellingRequests;

