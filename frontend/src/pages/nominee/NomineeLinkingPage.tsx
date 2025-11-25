import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, Users } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NomineeSelector, LinkedNomineesList } from '@/components/nominee';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import type { Asset, Nominee, LinkedNominee, ApiResponse } from '@/types';

export function NomineeLinkingPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [linkedNominees, setLinkedNominees] = useState<LinkedNominee[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingNominees, setIsLoadingNominees] = useState(true);
  const [isLoadingLinked, setIsLoadingLinked] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Fetch user's assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoadingAssets(true);
        const response = await api.get<ApiResponse<Asset[]>>('/assets');
        if (response.data.success && response.data.data) {
          setAssets(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

  // Fetch available nominees
  useEffect(() => {
    const fetchNominees = async () => {
      try {
        setIsLoadingNominees(true);
        const response = await api.get<ApiResponse<Nominee[]>>('/nominees');
        if (response.data.success && response.data.data) {
          setNominees(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch nominees:', error);
        toast({
          title: 'Error',
          description: 'Failed to load nominees. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingNominees(false);
      }
    };

    fetchNominees();
  }, []);

  // Fetch linked nominees when asset is selected
  useEffect(() => {
    if (!selectedAssetId) {
      setLinkedNominees([]);
      return;
    }

    const fetchLinkedNominees = async () => {
      try {
        setIsLoadingLinked(true);
        const response = await api.get<ApiResponse<LinkedNominee[]>>(
          `/nominees/asset/${selectedAssetId}`
        );
        if (response.data.success && response.data.data) {
          setLinkedNominees(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch linked nominees:', error);
      } finally {
        setIsLoadingLinked(false);
      }
    };

    fetchLinkedNominees();
  }, [selectedAssetId]);

  const handleLinkNominee = async () => {
    if (!selectedAssetId || !selectedNomineeId) {
      toast({
        title: 'Missing Information',
        description: 'Please select both an asset and a nominee.',
        variant: 'destructive',
      });
      return;
    }

    // Check if nominee is already linked
    const isAlreadyLinked = linkedNominees.some(
      (ln) => ln.nominee_id === selectedNomineeId
    );

    if (isAlreadyLinked) {
      toast({
        title: 'Already Linked',
        description: 'This nominee is already linked to the selected asset.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLinking(true);
      const response = await api.post<ApiResponse<LinkedNominee>>('/nominees/link', {
        asset_id: selectedAssetId,
        nominee_id: selectedNomineeId,
      });

      if (response.data.success && response.data.data) {
        setLinkedNominees([...linkedNominees, response.data.data]);
        setSelectedNomineeId(null);
        toast({
          title: 'Success',
          description: 'Nominee linked successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to link nominee:', error);
      toast({
        title: 'Error',
        description: 'Failed to link nominee. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkNominee = async (linkedNomineeId: string) => {
    try {
      setIsUnlinking(true);
      const response = await api.delete<ApiResponse<void>>(
        `/nominees/link/${linkedNomineeId}`
      );

      if (response.data.success) {
        setLinkedNominees(linkedNominees.filter((ln) => ln.id !== linkedNomineeId));
        toast({
          title: 'Success',
          description: 'Nominee unlinked successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to unlink nominee:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlink nominee. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const selectedAsset = Array.isArray(assets) ? assets.find((a) => a.id === selectedAssetId) : undefined;

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/vault')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vault
        </Button>
        <h1 className="text-3xl font-bold">Manage Nominee Access</h1>
        <p className="mt-2 text-muted-foreground">
          Link nominees to your assets to grant them access to specific documents.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Link Nominee */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="mr-2 h-5 w-5" />
              Link Nominee to Asset
            </CardTitle>
            <CardDescription>
              Select an asset and a nominee to grant access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset-select">Select Asset</Label>
              <Select
                value={selectedAssetId}
                onValueChange={setSelectedAssetId}
                disabled={isLoadingAssets}
              >
                <SelectTrigger id="asset-select">
                  <SelectValue placeholder="Choose an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.title} ({asset.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assets.length === 0 && !isLoadingAssets && (
                <p className="text-sm text-muted-foreground">
                  No assets found. Create an asset first.
                </p>
              )}
            </div>

            {/* Nominee Selection */}
            {selectedAssetId && (
              <div className="space-y-2">
                <Label>Select Nominee</Label>
                {isLoadingNominees ? (
                  <div className="rounded-md border p-8 text-center">
                    <p className="text-sm text-muted-foreground">Loading nominees...</p>
                  </div>
                ) : (
                  <NomineeSelector
                    nominees={nominees}
                    selectedNomineeId={selectedNomineeId}
                    onSelect={setSelectedNomineeId}
                    disabled={isLinking}
                  />
                )}
              </div>
            )}

            {/* Link Button */}
            {selectedAssetId && (
              <Button
                onClick={handleLinkNominee}
                disabled={!selectedNomineeId || isLinking}
                className="w-full"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                {isLinking ? 'Linking...' : 'Link Nominee'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Linked Nominees */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Linked Nominees
            </CardTitle>
            <CardDescription>
              {selectedAsset
                ? `Nominees with access to "${selectedAsset.title}"`
                : 'Select an asset to view linked nominees'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedAssetId ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Select an asset to view and manage linked nominees
                </p>
              </div>
            ) : isLoadingLinked ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <LinkedNomineesList
                linkedNominees={linkedNominees}
                onUnlink={handleUnlinkNominee}
                isLoading={isUnlinking}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </Layout>
  );
}
