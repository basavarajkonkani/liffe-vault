import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Layout } from '@/components/layout';
import { StatsCard } from '@/components/vault';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SkeletonStats, SkeletonTable } from '@/components/ui/skeleton';
import { Users, FolderOpen, HardDrive, Search, Eye } from 'lucide-react';
import api from '@/lib/api';
import type { User, ApiResponse } from '@/types';

interface AdminStats {
  totalUsers: number;
  totalAssets: number;
  storageUsed: number;
}

interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAssets: 0,
    storageUsed: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  // Fetch system statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        // Fetch stats from admin endpoint
        const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
        
        if (response.data.success && response.data.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Error toast is handled by axios interceptor
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch all users with pagination
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await api.get<ApiResponse<PaginatedUsersResponse>>(
          `/admin/users?page=${currentPage}&limit=${usersPerPage}`
        );
        
        if (response.data.success && response.data.data) {
          setUsers(response.data.data.users);
          setFilteredUsers(response.data.data.users);
          setTotalUsers(response.data.data.total);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Error toast is handled by axios interceptor
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Filter users by email search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter((user) => user.email.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, users]);

  // Format storage size
  const formatStorage = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'owner':
        return 'default';
      case 'nominee':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Handle view user details
  const handleViewDetails = (_userId: string) => {
    // TODO: Navigate to user details page or open modal
    toast({
      title: 'User Details',
      description: 'User details view coming soon',
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header - responsive layout */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Welcome back, {user?.email}</p>
        </div>

        {/* Statistics Cards - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {isLoadingStats ? (
            <>
              <SkeletonStats />
              <SkeletonStats />
              <SkeletonStats />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Total Assets"
                value={stats.totalAssets}
                icon={FolderOpen}
                iconColor="text-green-600"
              />
              <StatsCard
                title="Storage Used"
                value={formatStorage(stats.storageUsed)}
                icon={HardDrive}
                iconColor="text-purple-600"
              />
            </>
          )}
        </div>

        {/* User Management Section - responsive padding */}
        <div className="glass-card rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">User Management</h2>
          </div>

          {/* Search Bar - responsive sizing */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoadingUsers && <SkeletonTable rows={5} />}

          {/* Users Table */}
          {!isLoadingUsers && filteredUsers.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(user.id)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
                    {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={!canGoPrevious}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!canGoNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoadingUsers && users.length === 0 && (
            <div className="text-center py-12 sm:py-16 fade-in-up">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                There are no users in the system yet.
              </p>
            </div>
          )}

          {/* No Search Results */}
          {!isLoadingUsers && users.length > 0 && filteredUsers.length === 0 && (
            <div className="text-center py-12 sm:py-16 fade-in-up">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                No users match your search
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                Try adjusting your search query to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
