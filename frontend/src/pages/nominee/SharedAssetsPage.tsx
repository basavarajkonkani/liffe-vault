import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SharedAssetCard, CategoryFilter } from '@/components/vault';
import { Search, Share2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import type { Asset, ApiResponse } from '@/types';

const SharedAssetsPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Fetch shared assets from API on component mount
  useEffect(() => {
    const fetchSharedAssets = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse<Asset[]>>('/assets');
        
        if (response.data.success && response.data.data) {
          setAssets(response.data.data);
          setFilteredAssets(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching shared assets:', error);
        // Error toast is handled by axios interceptor
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedAssets();
  }, []);

  // Filter assets by search query and category
  useEffect(() => {
    let filtered = assets;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((asset) =>
        asset.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter((asset) => asset.category === categoryFilter);
    }

    setFilteredAssets(filtered);
  }, [searchQuery, categoryFilter, assets]);

  // Handle asset card click
  const handleAssetClick = (assetId: string) => {
    navigate(`/shared-assets/${assetId}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shared Assets</h1>
          <p className="text-gray-600 mt-1">
            View and access assets shared with you by Asset Owners
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search shared assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && assets.length === 0 && (
          <div className="text-center py-12 glass-card rounded-lg">
            <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No shared assets yet
            </h3>
            <p className="text-gray-600 mb-6">
              Assets shared with you by Asset Owners will appear here
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && assets.length > 0 && filteredAssets.length === 0 && (
          <div className="text-center py-12 glass-card rounded-lg">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No assets found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Assets Grid */}
        {!isLoading && filteredAssets.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredAssets.length} of {assets.length} shared{' '}
              {assets.length === 1 ? 'asset' : 'assets'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <SharedAssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={() => handleAssetClick(asset.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SharedAssetsPage;
