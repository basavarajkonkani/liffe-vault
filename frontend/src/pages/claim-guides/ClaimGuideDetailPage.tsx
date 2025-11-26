import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  Phone,
  ExternalLink,
  Edit,
  Trash2,
} from 'lucide-react';
import api from '@/lib/api';

// Temporary inline type definition
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
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ClaimGuideDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [guide, setGuide] = useState<ClaimGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClaimGuide();
    }
  }, [id]);

  const fetchClaimGuide = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/claim-guides/${id}`);
      if (response.data.success) {
        setGuide(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching claim guide:', error);
      toast({
        title: 'Error',
        description: 'Failed to load claim guide',
        variant: 'destructive',
      });
      navigate('/claim-guides');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/claim-guides/${id}`);
      toast({
        title: 'Success',
        description: 'Claim guide deleted successfully',
      });
      navigate('/claim-guides');
    } catch (error) {
      console.error('Error deleting claim guide:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete claim guide',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/claim-guides')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </Button>
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/claim-guides/${id}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Guide Header */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2">{guide.category}</Badge>
                <CardTitle className="text-3xl mb-2">{guide.title}</CardTitle>
                <CardDescription className="text-base">
                  Follow these steps to successfully claim your assets
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Steps Section */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Claim Process Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guide.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Required Documents */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.documents.map((doc, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{doc}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {guide.contact_info && (
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{guide.contact_info}</p>
            </CardContent>
          </Card>
        )}

        {/* Helpful Links */}
        {guide.links && guide.links.length > 0 && (
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Helpful Links & Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guide.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {link.label}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expected Timeline */}
        <Card className="glass-card bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="h-5 w-5" />
              Important Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              Processing times may vary depending on the organization and completeness of
              documentation. Always keep copies of all submitted documents and maintain
              communication records with reference numbers.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Claim Guide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this claim guide? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
