import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Loader2, Search, Eye, ArrowUpDown } from 'lucide-react';
import api from '@/lib/api';
import type { Asset, ApiResponse } from '@/types';

interface PaginatedAssetsResponse {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
}

type SortField = 'title' | 'owner' | 'created_at';
type SortOrder = 'asc' | 'desc';

const AssetsManagementPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const assetsPerPage = 10;

  // Fetch all assets with pagination
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse<PaginatedAssetsResponse>>(
          `/admin/assets?page=${currentPage}&limit=${assetsPerPage}`
        );
        
        if (response.data.success && response.data.data) {
          setAssets(response.data.data.assets);
          setFilteredAssets(response.data.data.assets);
          setTotalAssets(response.data.data.total);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        // Error toast is handled by axios interceptor
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [currentPage]);

  // Filter and sort assets
  useEffect(() => {
    let result = [...assets];

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.title.toLowerCase().includes(query) ||
          asset.owner?.email.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter((asset) => asset.category === categoryFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'owner':
          compareValue = (a.owner?.email || '').localeCompare(b.owner?.email || '');
          break;
        case 'created_at':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredAssets(result);
  }, [searchQuery, categoryFilter, sortField, sortOrder, assets]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Legal':
        return 'bg-blue-100 text-blue-800';
      case 'Financial':
        return 'bg-green-100 text-green-800';
      case 'Medical':
        return 'bg-red-100 text-red-800';
      case 'Personal':
        return 'bg-purple-100 text-purple-800';
      case 'Other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle view asset details
  const handleViewDetails = (assetId: string) => {
    navigate(`/vault/${assetId}`);
  };

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with default descending order
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalAssets / assetsPerPage);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600 mt-1">View and manage all assets in the system</p>
        </div>

        {/* Filters and Search */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by title or owner email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assets Table */}
        <div className="glass-card rounded-lg p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Assets Table */}
          {!isLoading && filteredAssets.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('title')}
                          className="gap-2 hover:bg-transparent"
                        >
                          Title
                          <ArrowUpDown className="w-4 h-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('owner')}
                          className="gap-2 hover:bg-transparent"
                        >
                          Owner
                          <ArrowUpDown className="w-4 h-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('created_at')}
                          className="gap-2 hover:bg-transparent"
                        >
                          Created Date
                          <ArrowUpDown className="w-4 h-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.title}</TableCell>
                        <TableCell>{asset.owner?.email || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(asset.category)} variant="outline">
                            {asset.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {asset.documents?.length || 0} document{asset.documents?.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>{formatDate(asset.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(asset.id)}
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
                    Showing {(currentPage - 1) * assetsPerPage + 1} to{' '}
                    {Math.min(currentPage * assetsPerPage, totalAssets)} of {totalAssets} assets
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
          {!isLoading && assets.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-600">There are no assets in the system yet.</p>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && assets.length > 0 && filteredAssets.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No assets match your filters
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssetsManagementPage;
