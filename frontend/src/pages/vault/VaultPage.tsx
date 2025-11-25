import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { AssetCard, CategoryFilter } from '@/components/vault';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonCard } from '@/components/ui/skeleton';
import { FolderOpen, Upload, Search } from 'lucide-react';
import api from '@/lib/api';
import type { Asset, ApiResponse } from '@/types';

const VaultPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Fetch assets from API on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse<Asset[]>>('/assets');
        
        if (response.data.success && response.data.data) {
          setAssets(response.data.data);
          setFilteredAssets(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        // Error toast is handled by axios interceptor
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Filter assets by search query and category
  useEffect(() => {
    let filtered = assets;

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter((asset) => asset.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((asset) =>
        asset.title.toLowerCase().includes(query)
      );
    }

    setFilteredAssets(filtered);
  }, [searchQuery, categoryFilter, assets]);

  // Handle asset card click
  const handleAssetClick = (assetId: string) => {
    navigate(`/vault/${assetId}`);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header - responsive layout */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Vault</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your digital assets and documents
            </p>
          </div>
          <Button onClick={handleUploadClick} className="gap-2 w-full sm:w-auto">
            <Upload className="w-4 h-4" />
            <span>Upload New Asset</span>
          </Button>
        </div>

        {/* Search and Filter Bar - responsive layout */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search assets by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/40 h-10 sm:h-11"
            />
          </div>
          <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && assets.length === 0 && (
          <div className="text-center py-12 sm:py-16 glass-card rounded-lg fade-in-up">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              No assets yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Get started by uploading your first asset to securely store and manage your important documents
            </p>
            <Button onClick={handleUploadClick} className="gap-2" size="lg">
              <Upload className="w-4 h-4" />
              Upload New Asset
            </Button>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && assets.length > 0 && filteredAssets.length === 0 && (
          <div className="text-center py-12 sm:py-16 glass-card rounded-lg fade-in-up">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              No assets found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">
              Try adjusting your search or filter criteria to find what you're looking for
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

        {/* Assets Grid - responsive columns */}
        {!isLoading && filteredAssets.length > 0 && (
          <>
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
              Showing {filteredAssets.length} of {assets.length} assets
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard
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

export default VaultPage;
