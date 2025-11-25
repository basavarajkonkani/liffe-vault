import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { AssetCard, CategoryFilter, StatsCard } from '@/components/vault';
import { SkeletonCard, SkeletonStats } from '@/components/ui/skeleton';
import { FolderOpen, FileText, HardDrive, Upload } from 'lucide-react';
import api from '@/lib/api';
import type { Asset, ApiResponse } from '@/types';

const OwnerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Fetch assets from API on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse<{ assets: Asset[] }>>('/assets');
        
        if (response.data.success && response.data.data) {
          // Handle both formats: { assets: [] } or direct array
          const assetsData = Array.isArray(response.data.data) 
            ? response.data.data 
            : response.data.data.assets || [];
          
          setAssets(assetsData);
          setFilteredAssets(assetsData);
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

  // Filter assets by category
  useEffect(() => {
    if (!Array.isArray(assets)) {
      setFilteredAssets([]);
      return;
    }
    
    if (categoryFilter === 'All') {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(assets.filter((asset) => asset.category === categoryFilter));
    }
  }, [categoryFilter, assets]);

  // Calculate statistics
  const totalAssets = Array.isArray(assets) ? assets.length : 0;
  const totalDocuments = Array.isArray(assets) ? assets.reduce(
    (sum, asset) => sum + (asset.documents?.length || 0),
    0
  ) : 0;
  const storageUsed = Array.isArray(assets) ? assets.reduce(
    (sum, asset) =>
      sum +
      (asset.documents?.reduce((docSum, doc) => docSum + doc.file_size, 0) || 0),
    0
  ) : 0;

  // Format storage size
  const formatStorage = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Handle asset card click
  const handleAssetClick = (assetId: string) => {
    navigate(`/vault/${assetId}`);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    navigate('/upload');
  };

  // Get recent assets (last 6)
  const recentAssets = Array.isArray(filteredAssets) ? filteredAssets.slice(0, 6) : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header - responsive layout */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asset Owner Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Welcome back, {user?.email}</p>
          </div>
          <Button
            onClick={handleUploadClick}
            className="gap-2 w-full sm:w-auto"
            size="lg"
          >
            <Upload className="w-4 h-4" />
            <span className="sm:inline">Upload New Asset</span>
          </Button>
        </div>

        {/* Statistics Cards - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {isLoading ? (
            <>
              <SkeletonStats />
              <SkeletonStats />
              <SkeletonStats />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Assets"
                value={totalAssets}
                icon={FolderOpen}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Total Documents"
                value={totalDocuments}
                icon={FileText}
                iconColor="text-green-600"
              />
              <StatsCard
                title="Storage Used"
                value={formatStorage(storageUsed)}
                icon={HardDrive}
                iconColor="text-purple-600"
              />
            </>
          )}
        </div>

        {/* Recent Assets Section - responsive layout */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Recent Assets</h2>
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
          <div className="text-center py-12 glass-card rounded-lg">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No assets yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by uploading your first asset
            </p>
            <Button onClick={handleUploadClick} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload New Asset
            </Button>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && assets.length > 0 && filteredAssets.length === 0 && (
          <div className="text-center py-12 glass-card rounded-lg">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No assets in this category
            </h3>
            <p className="text-gray-600">
              Try selecting a different category filter
            </p>
          </div>
        )}

        {/* Assets Grid - responsive columns */}
        {!isLoading && recentAssets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recentAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => handleAssetClick(asset.id)}
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        {!isLoading && filteredAssets.length > 6 && (
          <div className="mt-6 sm:mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/vault')}
              className="gap-2 w-full sm:w-auto"
            >
              View All Assets ({filteredAssets.length})
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OwnerDashboard;
