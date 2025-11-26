import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { SharedAssetCard, CategoryFilter, StatsCard } from '@/components/vault';
import { SkeletonCard, SkeletonStats } from '@/components/ui/skeleton';
import { FolderOpen, FileText, Share2 } from 'lucide-react';
import api from '@/lib/api';
import type { Asset, ApiResponse } from '@/types';

const NomineeDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Fetch shared assets from API on component mount
  useEffect(() => {
    const fetchSharedAssets = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse<Asset[]>>('/assets');
        
        if (response.data.success && response.data.data) {
          const assetsData = Array.isArray(response.data.data) ? response.data.data : [];
          setAssets(assetsData);
          setFilteredAssets(assetsData);
        }
      } catch (error) {
        console.error('Error fetching shared assets:', error);
        setAssets([]);
        setFilteredAssets([]);
        // Error toast is handled by axios interceptor
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedAssets();
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
  const totalSharedAssets = Array.isArray(assets) ? assets.length : 0;
  const totalDocuments = Array.isArray(assets)
    ? assets.reduce((sum, asset) => sum + (asset.documents?.length || 0), 0)
    : 0;
  const uniqueOwners = Array.isArray(assets)
    ? new Set(assets.map((asset) => asset.owner_id)).size
    : 0;

  // Handle asset card click
  const handleAssetClick = (assetId: string) => {
    navigate(`/shared-assets/${assetId}`);
  };

  // Get recent shared assets (last 6)
  const recentAssets = Array.isArray(filteredAssets) ? filteredAssets.slice(0, 6) : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header - responsive layout */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nominee Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Welcome back, {user?.email}</p>
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
                title="Shared Assets"
                value={totalSharedAssets}
                icon={Share2}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Total Documents"
                value={totalDocuments}
                icon={FileText}
                iconColor="text-green-600"
              />
              <StatsCard
                title="Asset Owners"
                value={uniqueOwners}
                icon={FolderOpen}
                iconColor="text-purple-600"
              />
            </>
          )}
        </div>

        {/* Shared Assets Section - responsive layout */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Shared Assets</h2>
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
        {!isLoading && (!Array.isArray(assets) || assets.length === 0) && (
          <div className="text-center py-12 sm:py-16 glass-card rounded-lg fade-in-up">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Share2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              No shared assets yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
              Assets shared with you by Asset Owners will appear here
            </p>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && Array.isArray(assets) && assets.length > 0 && Array.isArray(filteredAssets) && filteredAssets.length === 0 && (
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
              <SharedAssetCard
                key={asset.id}
                asset={asset}
                onClick={() => handleAssetClick(asset.id)}
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        {!isLoading && Array.isArray(filteredAssets) && filteredAssets.length > 6 && (
          <div className="mt-6 sm:mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/shared-assets')}
              className="gap-2 w-full sm:w-auto"
            >
              View All Shared Assets ({filteredAssets.length})
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NomineeDashboard;
