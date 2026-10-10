import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { 
  Users, Shield, MessageSquare, AlertTriangle, Download, 
  Search, Filter, TrendingUp, Activity, Ban, CheckCircle,
  Clock, Eye, X, RefreshCw, Calendar, BarChart3, PieChart,
  Settings, RotateCcw, CheckSquare, Square, LogOut, Moon, Sun
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const { authUser, socket, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [viewUserDetails, setViewUserDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showModerationLogs, setShowModerationLogs] = useState(true);
  const [moderationLogs, setModerationLogs] = useState([]);
  const [moderationPage, setModerationPage] = useState(1);
  const [moderationFilter, setModerationFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7'); // days
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkBlockReason, setBulkBlockReason] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (!authUser?.isAdmin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [authUser, navigate, dateRange]);

  useEffect(() => {
    // Apply theme to document
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    fetchUsers();
  }, [page, filterType, searchTerm]);

  useEffect(() => {
    if (showModerationLogs) {
      fetchModerationLogs();
      // Auto-refresh moderation logs every 10 seconds
      const interval = setInterval(() => {
        fetchModerationLogs();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [showModerationLogs, moderationPage, moderationFilter]);

  useEffect(() => {
    if (viewUserDetails) {
      fetchUserDetails(viewUserDetails);
    }
  }, [viewUserDetails]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data } = await axiosInstance.get('/admin/stats', {
        params: { days: dateRange }
      });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/admin/users', {
        params: { page, limit: 20, search: searchTerm, filter: filterType }
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const { data } = await axiosInstance.get(`/admin/users/${userId}`);
      setUserDetails(data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const fetchModerationLogs = async () => {
    try {
      console.log('[FRONTEND] Fetching moderation logs with filter:', moderationFilter);
      const { data } = await axiosInstance.get('/admin/moderation-logs', {
        params: { 
          page: moderationPage, 
          limit: 50, 
          filter: moderationFilter
        }
      });
      console.log('[FRONTEND] Received logs:', data.logs?.length, 'Total:', data.pagination?.total);
      console.log('[FRONTEND] First 3 logs:', data.logs?.slice(0, 3).map(l => ({ action: l.action, message: l.originalMessage?.substring(0, 20) })));
      setModerationLogs(data.logs || []);
      // Store pagination info if available
      if (data.pagination) {
        setPagination(prev => ({ ...prev, moderation: data.pagination }));
      }
    } catch (error) {
      console.error('Failed to fetch moderation logs:', error);
      toast.error('Failed to load moderation logs');
    }
  };

  const handleBlockUser = async (userId) => {
    if (!blockReason.trim()) {
      toast.error('Please provide a reason for blocking');
      return;
    }
    try {
      await axiosInstance.post(`/admin/users/${userId}/block`, { reason: blockReason });
      toast.success('User blocked successfully');
      fetchUsers();
      fetchDashboardData();
      setSelectedUser(null);
      setBlockReason('');
    } catch (error) {
      console.error('Failed to block user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await axiosInstance.post(`/admin/users/${userId}/unblock`);
      toast.success('User unblocked successfully');
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to unblock user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const downloadReport = async (type) => {
    try {
      const response = await axiosInstance.get(`/admin/export?type=${type}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleBulkBlock = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to block');
      return;
    }
    if (!bulkBlockReason.trim()) {
      toast.error('Please provide a reason for blocking');
      return;
    }
    
    setIsBulkProcessing(true);
    try {
      const response = await axiosInstance.post('/admin/users/bulk-block', {
        userIds: selectedUsers,
        reason: bulkBlockReason
      });
      
      const { blocked, skipped, failed, total } = response.data;
      
      // Show detailed success message
      let message = `✅ Blocked ${blocked} user${blocked !== 1 ? 's' : ''}`;
      if (skipped > 0) message += ` | ⏭️ Skipped ${skipped} (already blocked)`;
      if (failed > 0) message += ` | ⚠️ Failed ${failed}`;
      
      toast.success(message);
      
      // Reset state and close modal only on success
      setSelectedUsers([]);
      setBulkBlockReason('');
      setShowBulkActions(false);
      
      // Refresh data
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to bulk block users:', error);
      const errorMsg = error.response?.data?.error || 'Failed to block users';
      toast.error(errorMsg);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkUnblock = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to unblock');
      return;
    }
    
    setIsBulkProcessing(true);
    try {
      const response = await axiosInstance.post('/admin/users/bulk-unblock', {
        userIds: selectedUsers
      });
      
      const { unblocked, skipped, failed, total } = response.data;
      
      // Show detailed success message
      let message = `✅ Unblocked ${unblocked} user${unblocked !== 1 ? 's' : ''}`;
      if (skipped > 0) message += ` | ⏭️ Skipped ${skipped} (already unblocked)`;
      if (failed > 0) message += ` | ⚠️ Failed ${failed}`;
      
      toast.success(message);
      
      // Reset state and close modal only on success
      setSelectedUsers([]);
      setShowBulkActions(false);
      
      // Refresh data
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to bulk unblock users:', error);
      const errorMsg = error.response?.data?.error || 'Failed to unblock users';
      toast.error(errorMsg);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleSyncToxicCounts = async () => {
    try {
      const { data } = await axiosInstance.post('/admin/sync-toxic-counts');
      toast.success(data.message);
      fetchDashboardData();
      fetchUsers();
    } catch (error) {
      console.error('Failed to sync toxic counts:', error);
      toast.error('Failed to sync toxic counts');
    }
  };

  const handleResetToxicCount = async (userId) => {
    if (!confirm('Are you sure you want to reset the toxic count for this user?')) {
      return;
    }
    try {
      const { data } = await axiosInstance.post(`/admin/users/${userId}/reset-toxic`);
      toast.success('Toxic count reset successfully');
      
      // Update user in the list immediately
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === userId ? { ...u, toxicMessageCount: 0 } : u)
      );
      
      if (viewUserDetails === userId) {
        fetchUserDetails(userId);
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to reset toxic count:', error);
      toast.error('Failed to reset toxic count');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  if (!stats) return (
    <div className="flex items-center justify-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );

  const userGrowthData = {
    labels: stats.userGrowth.map(d => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'New Users',
      data: stats.userGrowth.map(d => d.count),
      borderColor: 'rgb(234, 123, 16)',
      backgroundColor: 'rgba(234, 123, 16, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const moderationData = {
    labels: stats.moderationStats.map(d => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Blocked',
        data: stats.moderationStats.map(d => d.blocked),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'Rephrased',
        data: stats.moderationStats.map(d => d.rephrased),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
      },
      {
        label: 'Allowed',
        data: stats.moderationStats.map(d => d.allowed || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      }
    ]
  };

  const userStatusData = {
    labels: ['Active Users', 'Blocked Users'],
    datasets: [{
      data: [stats.stats.totalUsers - stats.stats.blockedUsers, stats.stats.blockedUsers],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
    }]
  };

  const moderationMethodData = stats.moderationMethodStats ? {
    labels: stats.moderationMethodStats.map(d => d._id || 'unknown'),
    datasets: [{
      data: stats.moderationMethodStats.map(d => d.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
    }]
  } : null;

  return (
    <div className={`min-h-screen pt-20 pb-10 transition-colors duration-300 ${
      isDarkTheme ? 'bg-slate-900' : 'bg-base-200'
    }`}>
      {/* Fixed Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isDarkTheme ? 'bg-slate-800 border-b border-slate-700' : 'bg-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <MessageSquare size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Willow</span>
          </div>

          {/* Right: Theme Toggle and Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                isDarkTheme ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                isDarkTheme ? 'translate-x-6' : 'translate-x-1'
              }`} />
              <Sun className={`absolute left-1 h-3 w-3 text-yellow-500 transition-opacity duration-300 ${
                isDarkTheme ? 'opacity-0' : 'opacity-100'
              }`} />
              <Moon className={`absolute right-1 h-3 w-3 text-gray-400 transition-opacity duration-300 ${
                isDarkTheme ? 'opacity-100' : 'opacity-0'
              }`} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-white hover:text-orange-400 transition text-sm"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="btn btn-sm btn-ghost btn-circle"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-base-content/60 mt-1">Monitor and manage Willow platform</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadReport('users')} className="btn btn-sm btn-outline gap-2">
              <Download size={16} /> Users
            </button>
            <button onClick={() => downloadReport('blocked')} className="btn btn-sm btn-outline gap-2">
              <Download size={16} /> Blocked
            </button>
            <button onClick={() => downloadReport('moderation')} className="btn btn-sm btn-outline gap-2">
              <Download size={16} /> Moderation
            </button>
            <button 
              onClick={() => setShowModerationLogs(!showModerationLogs)} 
              className="btn btn-sm btn-primary gap-2"
            >
              <Eye size={16} /> {showModerationLogs ? 'Hide' : 'View'} Logs
            </button>
            <button 
              onClick={handleSyncToxicCounts} 
              className="btn btn-sm btn-warning gap-2"
              title="Sync toxic counts from moderation logs"
            >
              <RotateCcw size={16} /> Sync Counts
            </button>
          </div>
        </div>

        {/* Date Range, Active Users, Messages - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Date Range Filter */}
          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
            isDarkTheme 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-base-100 border-base-300'
          }`}>
            <div className="flex items-center gap-3">
              <Calendar size={24} className={isDarkTheme ? 'text-orange-400' : ''} />
              <div className="flex-1">
                <p className={`text-xs mb-2 ${
                  isDarkTheme ? 'text-slate-400' : 'text-base-content/60'
                }`}>Date Range</p>
                <select 
                  className={`select select-bordered w-full ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-orange-400' 
                      : ''
                  }`}
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    fetchDashboardData();
                  }}
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Users (24h) */}
          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
            isDarkTheme 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-base-100 border-base-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkTheme ? 'text-slate-400' : 'text-base-content/60'
                }`}>Active Users (24h)</p>
                <p className="text-3xl font-bold mt-1">{stats.stats.activeUsers24h || 0}</p>
                <p className={`text-xs mt-1 ${
                  isDarkTheme ? 'text-slate-500' : 'text-base-content/50'
                }`}>
                  {stats.stats.totalUsers || 0} total users
                </p>
              </div>
              <Activity className={`w-12 h-12 opacity-20 ${
                isDarkTheme ? 'text-green-400' : 'text-success'
              }`} />
            </div>
          </div>

          {/* Messages (24h) */}
          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
            isDarkTheme 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-base-100 border-base-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkTheme ? 'text-slate-400' : 'text-base-content/60'
                }`}>Messages (24h)</p>
                <p className="text-3xl font-bold mt-1">{stats.stats.messages24h || 0}</p>
                <p className={`text-xs mt-1 ${
                  isDarkTheme ? 'text-slate-500' : 'text-base-content/50'
                }`}>
                  {stats.stats.totalMessages || 0} total messages
                </p>
              </div>
              <MessageSquare className={`w-12 h-12 opacity-20 ${
                isDarkTheme ? 'text-orange-400' : 'text-primary'
              }`} />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
            isDarkTheme 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-base-100 border-base-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkTheme ? 'text-slate-400' : 'text-base-content/60'
                }`}>Total Users</p>
                <p className="text-3xl font-bold mt-1">{stats.stats.totalUsers}</p>
                <p className={`text-xs mt-1 ${
                  isDarkTheme ? 'text-slate-500' : 'text-base-content/50'
                }`}>
                  {stats.stats.usersWithToxicMessages || 0} with toxic messages
                </p>
              </div>
              <Users className={`w-12 h-12 opacity-20 ${
                isDarkTheme ? 'text-orange-400' : 'text-primary'
              }`} />
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
            isDarkTheme 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-base-100 border-base-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkTheme ? 'text-slate-400' : 'text-base-content/60'
                }`}>Blocked Users</p>
                <p className={`text-3xl font-bold mt-1 ${
                  isDarkTheme ? 'text-red-400' : 'text-error'
                }`}>{stats.stats.blockedUsers}</p>
                <p className={`text-xs mt-1 ${
                  isDarkTheme ? 'text-slate-500' : 'text-base-content/50'
                }`}>
                  {((stats.stats.blockedUsers / stats.stats.totalUsers) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Ban className={`w-12 h-12 opacity-20 ${
                isDarkTheme ? 'text-red-400' : 'text-error'
              }`} />
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
            isDarkTheme 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-base-100 border-base-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkTheme ? 'text-slate-400' : 'text-base-content/60'
                }`}>Total Messages</p>
                <p className="text-3xl font-bold mt-1">{stats.stats.totalMessages}</p>
                <p className={`text-xs mt-1 ${
                  isDarkTheme ? 'text-slate-500' : 'text-base-content/50'
                }`}>
                  {stats.stats.totalModerated} moderated
                </p>
              </div>
              <MessageSquare className={`w-12 h-12 opacity-20 ${
                isDarkTheme ? 'text-orange-400' : 'text-primary'
              }`} />
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
            isDarkTheme 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-base-100 border-base-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  isDarkTheme ? 'text-slate-400' : 'text-base-content/60'
                }`}>Blocked Messages</p>
                <p className={`text-3xl font-bold mt-1 ${
                  isDarkTheme ? 'text-red-400' : 'text-error'
                }`}>{stats.stats.totalBlocked || 0}</p>
                <p className={`text-xs mt-1 ${
                  isDarkTheme ? 'text-slate-500' : 'text-base-content/50'
                }`}>
                  {stats.stats.blockedInRange || 0} in range
                </p>
              </div>
              <Shield className={`w-12 h-12 opacity-20 ${
                isDarkTheme ? 'text-yellow-400' : 'text-warning'
              }`} />
            </div>
          </div>
        </div>

        {/* Top Toxic Users */}
        {stats.topToxicUsers && stats.topToxicUsers.length > 0 && (
          <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-warning" size={20} /> Top Toxic Users
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {stats.topToxicUsers.map((user, idx) => (
                <div key={user._id} className="bg-base-200 p-3 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">#{idx + 1}</span>
                    <span className={`badge ${user.isBlocked ? 'badge-error' : 'badge-warning'}`}>
                      {user.toxicMessageCount}
                    </span>
                  </div>
                  <p className="text-xs truncate" title={user.email}>{user.email}</p>
                  <p className="text-xs text-base-content/60 truncate">{user.fullName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts - Three Columns in One Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> User Growth (Last {dateRange} Days)
            </h3>
            <div style={{ height: '300px', position: 'relative' }}>
              <Line 
                data={userGrowthData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart size={20} /> User Status
            </h3>
            <div style={{ height: '300px', position: 'relative' }}>
              <Doughnut 
                data={userStatusData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} /> Moderation Activity (Last {dateRange} Days)
            </h3>
            <div style={{ height: '300px', position: 'relative' }}>
              <Bar 
                data={moderationData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Moderation Logs Panel */}
        {showModerationLogs && (
          <div className="bg-base-100 p-6 rounded-lg shadow-md border border-base-300 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye size={20} /> Moderation Logs
              </h3>
              <select
                className="select select-bordered select-sm"
                value={moderationFilter}
                onChange={(e) => {
                  setModerationFilter(e.target.value);
                  setModerationPage(1);
                }}
              >
                <option value="all">All Actions</option>
                <option value="blocked">Blocked Only</option>
                <option value="rephrased">Rephrased Only</option>
                <option value="allowed">Allowed Only</option>
              </select>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="table table-pin-rows">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Sender</th>
                    <th>Receiver/Group</th>
                    <th>Action</th>
                    <th>Message Preview</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {moderationLogs.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-base-content/60">No logs found</td></tr>
                  ) : (
                    moderationLogs.map(log => (
                      <tr key={log._id}>
                        <td className="text-xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <div className="text-sm">{log.senderId?.email || 'Unknown'}</div>
                        </td>
                        <td>
                          <div className="text-sm">
                            {log.groupId?.name || log.receiverId?.email || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            log.action === 'blocked' ? 'badge-error' :
                            log.action === 'rephrased' || log.action === 'bypassed' ? 'badge-warning' :
                            'badge-success'
                          }`}>
                            {log.action === 'bypassed' ? 'rephrased' : log.action}
                          </span>
                        </td>
                        <td className="max-w-xs truncate" title={log.originalMessage}>
                          {log.action === 'blocked' 
                            ? log.originalMessage?.substring(0, 50) 
                            : '*'.repeat(Math.min(log.originalMessage?.length || 0, 50))
                          }
                        </td>
                        <td>
                          <span className="badge badge-ghost badge-sm">
                            {log.moderationMethod || 'unknown'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm"
                disabled={moderationPage === 1}
                onClick={() => setModerationPage(moderationPage - 1)}
              >
                Previous
              </button>
              <span className="flex items-center px-4">
                Page {moderationPage}
                {moderationLogs.length > 0 && ` (${moderationLogs.length} logs)`}
              </span>
              <button
                className="btn btn-sm"
                disabled={moderationLogs.length < 50}
                onClick={() => setModerationPage(moderationPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className={`p-6 rounded-lg shadow-md border transition-colors duration-300 ${
          isDarkTheme 
            ? 'bg-slate-800 border-slate-700 text-white' 
            : 'bg-base-100 border-base-300'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">User Management</h3>
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <span className="badge badge-info">{selectedUsers.length} selected</span>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => setShowBulkActions(true)}
                >
                  Bulk Actions
                </button>
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => setSelectedUsers([])}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={20} />
              <input
                type="text"
                placeholder="Search by email or name..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select 
              className="select select-bordered"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Users</option>
              <option value="blocked">Blocked Only</option>
              <option value="toxic">High Toxic Count (5+)</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="table table-hover w-full">
              <thead>
                <tr className="bg-base-300 border-b-2 border-base-content/20">
                  <th className="w-12">
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={toggleSelectAll}
                      title="Select All"
                    >
                      {selectedUsers.length === users.length && users.length > 0 ? (
                        <CheckSquare size={18} className="text-info" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="min-w-64">Email</th>
                  <th className="min-w-48">Name</th>
                  <th className="w-32">Toxic Count</th>
                  <th className="w-28">Status</th>
                  <th className="w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8"><span className="loading loading-spinner"></span></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-base-content/60">No users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user._id} 
                      className={`border-b border-base-300 transition-colors ${
                        selectedUsers.includes(user._id) 
                          ? 'bg-info/20' 
                          : 'bg-base-100 hover:bg-base-200'
                      }`}
                    >
                      <td className="w-12">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                      </td>
                      <td>
                        {user.email}
                      </td>
                      <td>
                        {user.fullName}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`badge font-bold ${
                            user.toxicMessageCount >= 10 ? 'badge-error' : 
                            user.toxicMessageCount >= 5 ? 'badge-warning' : 
                            user.toxicMessageCount > 0 ? 'badge-info' :
                            'badge-ghost'
                          }`}>
                            {user.toxicMessageCount}
                          </span>
                          {user.toxicMessageCount > 0 && (
                            <button
                              onClick={() => handleResetToxicCount(user._id)}
                              className="btn btn-xs btn-ghost hover:btn-warning"
                              title="Reset toxic count"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        {user.isBlocked ? (
                          <span className="badge badge-error gap-1 font-semibold">
                            <Ban size={12} /> Blocked
                          </span>
                        ) : (
                          <span className="badge badge-success gap-1 font-semibold">
                            <CheckCircle size={12} /> Active
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewUserDetails(user._id)}
                            className="btn btn-xs btn-info"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {user.isBlocked ? (
                            <button 
                              onClick={() => handleUnblockUser(user._id)}
                              className="btn btn-xs btn-success"
                              title="Unblock this user"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSelectedUser(user)}
                              className="btn btn-xs btn-error"
                              title="Block this user"
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button 
                className="btn btn-sm" 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="flex items-center px-4">
                Page {page} of {pagination.pages}
              </span>
              <button 
                className="btn btn-sm" 
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Block User Modal */}
      {selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Block User</h3>
            <p className="mb-2">User: <strong>{selectedUser.email}</strong></p>
            <p className="mb-4 text-sm text-base-content/60">
              Toxic Messages: <span className="font-bold">{selectedUser.toxicMessageCount}</span>
            </p>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Reason for blocking..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows="3"
            />
            <div className="modal-action">
              <button className="btn" onClick={() => { setSelectedUser(null); setBlockReason(''); }}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={() => handleBlockUser(selectedUser._id)}>
                Block User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <CheckSquare size={20} className="text-info" />
              Bulk Actions - {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </h3>
            
            {/* User Preview with Status */}
            <div className="bg-base-200 p-4 rounded-lg mb-4 max-h-40 overflow-y-auto">
              <p className="text-sm font-semibold mb-2">Selected Users:</p>
              <div className="space-y-1 text-sm">
                {users
                  .filter(u => selectedUsers.includes(u._id))
                  .slice(0, 5)
                  .map((user, idx) => (
                    <div key={idx} className="flex justify-between items-center p-1">
                      <span>{user.email}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-base-content/60">{user.fullName}</span>
                        {user.isBlocked ? (
                          <span className="badge badge-error badge-sm">Blocked</span>
                        ) : (
                          <span className="badge badge-success badge-sm">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                {selectedUsers.length > 5 && (
                  <div className="text-xs text-base-content/50 italic">
                    ...and {selectedUsers.length - 5} more
                  </div>
                )}
              </div>
            </div>

            {/* Determine user states */}
            {(() => {
              const selectedUserData = users.filter(u => selectedUsers.includes(u._id));
              const blockedCount = selectedUserData.filter(u => u.isBlocked).length;
              const unblockedCount = selectedUserData.filter(u => !u.isBlocked).length;
              const isMixed = blockedCount > 0 && unblockedCount > 0;

              return (
                <>
                  {/* Warning Alert */}
                  <div className={`alert mb-4 ${isMixed ? 'alert-warning' : 'alert-info'}`}>
                    <AlertTriangle size={16} />
                    <span className="text-sm">
                      {isMixed ? (
                        <>
                          Mixed states detected: {blockedCount} blocked, {unblockedCount} active. Unblocking will only affect the blocked users.
                        </>
                      ) : blockedCount > 0 ? (
                        <>
                          All {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} are currently blocked.
                        </>
                      ) : (
                        <>
                          All {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} are currently active.
                        </>
                      )}
                    </span>
                  </div>

                  {/* Reason Input (for block) - only show if any user is unblocked */}
                  {unblockedCount > 0 && (
                    <textarea
                      className="textarea textarea-bordered w-full mb-4"
                      placeholder="Reason for blocking (required)..."
                      value={bulkBlockReason}
                      onChange={(e) => setBulkBlockReason(e.target.value)}
                      disabled={isBulkProcessing}
                      rows="3"
                    />
                  )}

                  {/* Action Buttons - Smart Display */}
                  <div className={`flex gap-3 mb-4 ${unblockedCount === 0 ? 'flex-col' : blockedCount === 0 ? 'flex-col' : 'flex-row'}`}>
                    {/* Show Block button only if there are unblocked users */}
                    {unblockedCount > 0 && (
                      <button
                        className={`btn btn-error ${isBulkProcessing ? 'loading' : ''}`}
                        onClick={handleBulkBlock}
                        disabled={isBulkProcessing || !bulkBlockReason.trim()}
                        style={{ flex: blockedCount > 0 ? 1 : 'auto' }}
                      >
                        {isBulkProcessing ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Ban size={16} /> Block {unblockedCount}
                          </>
                        )}
                      </button>
                    )}

                    {/* Show Unblock button only if there are blocked users */}
                    {blockedCount > 0 && (
                      <button
                        className={`btn btn-success ${isBulkProcessing ? 'loading' : ''}`}
                        onClick={handleBulkUnblock}
                        disabled={isBulkProcessing}
                        style={{ flex: unblockedCount > 0 ? 1 : 'auto' }}
                      >
                        {isBulkProcessing ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} /> Unblock {blockedCount}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Show message if no actions available */}
                  {unblockedCount === 0 && blockedCount === 0 && (
                    <div className="alert alert-warning mb-4">
                      <AlertTriangle size={16} />
                      <span className="text-sm">No users to manage. Selection is empty.</span>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Close Button */}
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => {
                  if (!isBulkProcessing) {
                    setShowBulkActions(false);
                    setBulkBlockReason('');
                  }
                }}
                disabled={isBulkProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {viewUserDetails && userDetails && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">User Details</h3>
              <button className="btn btn-sm btn-circle" onClick={() => {
                setViewUserDetails(null);
                setUserDetails(null);
              }}>
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Email</p>
                <p className="font-semibold">{userDetails.user.email}</p>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Full Name</p>
                <p className="font-semibold">{userDetails.user.fullName}</p>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Toxic Count</p>
                <p className="font-semibold text-error">{userDetails.user.toxicMessageCount}</p>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Status</p>
                <p className="font-semibold">
                  {userDetails.user.isBlocked ? (
                    <span className="badge badge-error">Blocked</span>
                  ) : (
                    <span className="badge badge-success">Active</span>
                  )}
                </p>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Total Messages</p>
                <p className="font-semibold">{userDetails.messageCount}</p>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Friends</p>
                <p className="font-semibold">{userDetails.friendCount || 0}</p>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Blocked Messages</p>
                <p className="font-semibold text-error">{userDetails.blockedCount || 0}</p>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <p className="text-sm text-base-content/60">Rephrased Messages</p>
                <p className="font-semibold text-warning">{userDetails.rephrasedCount || 0}</p>
              </div>
            </div>

            {userDetails.user.blockedReason && (
              <div className="alert alert-error mb-4">
                <AlertTriangle size={20} />
                <span><strong>Blocked Reason:</strong> {userDetails.user.blockedReason}</span>
              </div>
            )}

            <h4 className="font-semibold mb-3">Recent Moderation Logs</h4>
            <div className="overflow-x-auto max-h-64">
              <table className="table table-zebra table-xs">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Message</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails.moderationLogs?.length > 0 ? (
                    userDetails.moderationLogs.map(log => (
                      <tr key={log._id}>
                        <td className="text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-xs ${
                            log.action === 'blocked' ? 'badge-error' :
                            log.action === 'rephrased' || log.action === 'bypassed' ? 'badge-warning' :
                            'badge-success'
                          }`}>
                            {log.action === 'bypassed' ? 'rephrased' : log.action}
                          </span>
                        </td>
                        <td className="max-w-xs truncate" title={log.originalMessage}>
                          {log.action === 'blocked' 
                            ? log.originalMessage?.substring(0, 30) 
                            : '*'.repeat(Math.min(log.originalMessage?.length || 0, 30))
                          }
                        </td>
                        <td className="text-xs">{log.moderationMethod || 'unknown'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="text-center text-sm text-base-content/60">No moderation logs</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
