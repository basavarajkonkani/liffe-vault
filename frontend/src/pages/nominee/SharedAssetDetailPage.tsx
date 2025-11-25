import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Loader2,
} from 'lucide-react';
import { DocumentList } from '@/components/vault';
import api from '@/lib/api';
import type { Asset, ApiResponse } from '@/types';
import { cn } from '@/lib/utils';

const categoryColors: Record<Asset['category'], string> = {
  Legal: 'bg-blue-100 text-blue-800 border-blue-200',
  Financial: 'bg-green-100 text-green-800 border-green-200',
  Medical: 'bg-red-100 text-red-800 border-red-200',
  Personal: 'bg-purple-100 text-purple-800 border-purple-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const SharedAssetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch asset details from API
  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
        
        if (response.data.success && response.data.data) {
          setAsset(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching shared asset:', error);
        // Error toast is handled by axios interceptor
        // Navigate back to shared assets if asset not found
        navigate('/shared-assets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [id, navigate]);

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!asset) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Asset not found
          </h3>
          <Button onClick={() => navigate('/shared-assets')} className="gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Shared Assets
          </Button>
        </div>
      </Layout>
    );
  }

  const documentCount = asset.documents?.length || 0;
  const ownerEmail = asset.owner?.email || 'Unknown Owner';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/shared-assets')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shared Assets
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {asset.title}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(categoryColors[asset.category])}
                >
                  {asset.category}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Shared by {ownerEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(asset.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            This asset has been shared with you. You can view and download documents, but cannot edit or delete them.
          </p>
        </div>

        {/* Statistics Card */}
        <div className="mb-8">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {documentCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {documentCount === 1 ? 'document' : 'documents'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={asset.documents || []}
              isOwner={false}
              onDocumentDeleted={() => {}}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SharedAssetDetailPage;
