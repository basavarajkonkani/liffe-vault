import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import { DocumentList } from '@/components/vault';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import type { Asset, ApiResponse } from '@/types';
import { cn } from '@/lib/utils';

const categoryColors: Record<Asset['category'], string> = {
  Legal: 'bg-blue-100 text-blue-800 border-blue-200',
  Financial: 'bg-green-100 text-green-800 border-green-200',
  Medical: 'bg-red-100 text-red-800 border-red-200',
  Personal: 'bg-purple-100 text-purple-800 border-purple-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const AssetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch asset details from API
  const fetchAsset = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
      
      if (response.data.success && response.data.data) {
        setAsset(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
      // Error toast is handled by axios interceptor
      // Navigate back to vault if asset not found
      navigate('/vault');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id, navigate]);

  // Handle delete asset
  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      const response = await api.delete<ApiResponse<void>>(`/assets/${id}`);
      
      if (response.data.success) {
        toast({
          title: 'Asset Deleted',
          description: 'The asset has been successfully deleted.',
        });
        navigate('/vault');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      // Error toast is handled by axios interceptor
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle edit asset
  const handleEdit = () => {
    navigate(`/vault/${id}/edit`);
  };

  // Handle document deleted - refresh asset data
  const handleDocumentDeleted = () => {
    fetchAsset();
  };

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
          <Button onClick={() => navigate('/vault')} className="gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Button>
        </div>
      </Layout>
    );
  }

  const documentCount = asset.documents?.length || 0;
  const nomineeCount = asset.linked_nominees?.length || 0;
  const isOwner = user?.id === asset.owner_id;
  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(isAdmin ? '/admin/assets' : '/vault')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAdmin ? 'Back to Asset Management' : 'Back to Vault'}
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
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(asset.created_at)}</span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            )}
            {isAdmin && !isOwner && (
              <Badge variant="secondary" className="text-sm">
                Admin View Only
              </Badge>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Linked Nominees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {nomineeCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {nomineeCount === 1 ? 'nominee' : 'nominees'}
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
              isOwner={isOwner}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Asset</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{asset.title}"? This action
                cannot be undone. All documents associated with this asset will
                also be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Asset
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AssetDetailPage;
