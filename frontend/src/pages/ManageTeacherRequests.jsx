import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import { FiUsers, FiCheck, FiX, FiClock, FiMail, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageTeacherRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchTeacherRequests();
  }, []);

  const fetchTeacherRequests = async () => {
    try {
      const response = await axiosInstance.get('/admin/teacher-requests?status=all');
      setTeacherRequests(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load teacher requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId) => {
    if (!window.confirm('Are you sure you want to approve this teacher request?')) {
      return;
    }

    setProcessing({ ...processing, [teacherId]: 'approving' });
    try {
      await axiosInstance.put(`/admin/teacher-requests/${teacherId}/approve`);
      toast.success('Teacher request approved successfully');
      await fetchTeacherRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve teacher request');
    } finally {
      setProcessing({ ...processing, [teacherId]: null });
    }
  };

  const handleReject = async (teacherId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    if (!window.confirm('Are you sure you want to reject this teacher request?')) {
      return;
    }

    setProcessing({ ...processing, [teacherId]: 'rejecting' });
    try {
      await axiosInstance.put(`/admin/teacher-requests/${teacherId}/reject`, {
        reason: reason || 'Not specified',
        disableAccount: false, // Keep account active but as teacher_pending
      });
      toast.success('Teacher request rejected');
      await fetchTeacherRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject teacher request');
    } finally {
      setProcessing({ ...processing, [teacherId]: null });
    }
  };

  const getStatusBadge = (role, isActive) => {
    if (role === 'teacher') {
      return (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
          Approved
        </span>
      );
    }
    if (role === 'teacher_pending' && !isActive) {
      return (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs font-semibold">
          Rejected / Disabled
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-semibold">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const pendingRequests = teacherRequests.filter((t) => t.role === 'teacher_pending');
  const approvedTeachers = teacherRequests.filter((t) => t.role === 'teacher');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Teacher Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage teacher access requests and approvals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingRequests.length}
              </p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Approved Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {approvedTeachers.length}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {teacherRequests.length}
              </p>
            </div>
            <FiUser className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Signup Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((teacher) => (
                  <tr
                    key={teacher._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{teacher.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(teacher.role, teacher.isActive)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(teacher._id)}
                          disabled={processing[teacher._id]}
                          className="btn-primary text-sm flex items-center space-x-1 disabled:opacity-50"
                        >
                          <FiCheck className="w-4 h-4" />
                          <span>
                            {processing[teacher._id] === 'approving' ? 'Approving...' : 'Approve'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleReject(teacher._id)}
                          disabled={processing[teacher._id]}
                          className="btn-outline text-sm flex items-center space-x-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                          <FiX className="w-4 h-4" />
                          <span>
                            {processing[teacher._id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Teachers */}
      {approvedTeachers.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Approved Teachers ({approvedTeachers.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Signup Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvedTeachers.map((teacher) => (
                  <tr
                    key={teacher._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{teacher.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(teacher.role, teacher.isActive)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {teacherRequests.length === 0 && (
        <div className="card text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No teacher requests found</p>
        </div>
      )}
    </div>
  );
};

export default ManageTeacherRequests;

