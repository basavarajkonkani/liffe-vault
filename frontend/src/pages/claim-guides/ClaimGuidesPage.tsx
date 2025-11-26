import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  TrendingUp,
  Landmark,
  Home,
  Wallet,
  Shield,
  Plus,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';

// Temporary inline type definition to avoid module resolution issues
interface ClaimStep {
  step: number;
  description: string;
}

interface ClaimLink {
  label: string;
  url: string;
}

interface ClaimGuide {
  id: string;
  category: string;
  title: string;
  steps: ClaimStep[];
  documents: string[];
  contact_info?: string;
  links?: ClaimLink[];
  created_at: string;
  updated_at: string;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

const categoryIcons: Record<string, React.ElementType> = {
  'Insurance Policy': Shield,
  'Bank Account': Building2,
  'Mutual Funds': TrendingUp,
  'Fixed Deposits': Landmark,
  'Property/Real Estate': Home,
  'Digital Wallet / Online Services': Wallet,
  'Govt Schemes / Pension': FileText,
};

export const ClaimGuidesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [guides, setGuides] = useState<ClaimGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaimGuides();
  }, []);

  const fetchClaimGuides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/claim-guides');
      if (response.data.success) {
        setGuides(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching claim guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuideClick = (guideId: string) => {
    navigate(`/claim-guides/${guideId}`);
  };

  const handleAddGuide = () => {
    navigate('/claim-guides/new');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claim Guides</h1>
            <p className="text-gray-600 mt-2">
              Step-by-step guides to help you claim different types of assets
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={handleAddGuide} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Guide
            </Button>
          )}
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => {
            const Icon = categoryIcons[guide.category] || FileText;
            return (
              <Card
                key={guide.id}
                className="glass-card hover:shadow-xl transition-smooth cursor-pointer group"
                onClick={() => handleGuideClick(guide.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-smooth" />
                  </div>
                  <CardTitle className="text-xl mt-4">{guide.category}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {guide.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{guide.steps.length} steps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{guide.documents.length} required documents</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {guides.length === 0 && (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Claim Guides Available
              </h3>
              <p className="text-gray-600 mb-4">
                There are no claim guides available at the moment.
              </p>
              {user?.role === 'admin' && (
                <Button onClick={handleAddGuide} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Guide
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
