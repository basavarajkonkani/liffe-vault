import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

// Temporary inline type definitions
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export const ClaimGuideFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    contact_info: '',
  });
  const [steps, setSteps] = useState<ClaimStep[]>([{ step: 1, description: '' }]);
  const [documents, setDocuments] = useState<string[]>(['']);
  const [links, setLinks] = useState<ClaimLink[]>([{ label: '', url: '' }]);

  useEffect(() => {
    if (isEditMode) {
      fetchClaimGuide();
    }
  }, [id]);

  const fetchClaimGuide = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/claim-guides/${id}`);
      if (response.data.success) {
        const guide: ClaimGuide = response.data.data;
        setFormData({
          category: guide.category,
          title: guide.title,
          contact_info: guide.contact_info || '',
        });
        setSteps(guide.steps.length > 0 ? guide.steps : [{ step: 1, description: '' }]);
        setDocuments(guide.documents.length > 0 ? guide.documents : ['']);
        setLinks(guide.links && guide.links.length > 0 ? guide.links : [{ label: '', url: '' }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.category || !formData.title) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const filteredSteps = steps.filter((s) => s.description.trim() !== '');
    const filteredDocuments = documents.filter((d) => d.trim() !== '');
    const filteredLinks = links.filter((l) => l.label.trim() !== '' && l.url.trim() !== '');

    if (filteredSteps.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one step',
        variant: 'destructive',
      });
      return;
    }

    if (filteredDocuments.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one required document',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      ...formData,
      steps: filteredSteps.map((s, idx) => ({ step: idx + 1, description: s.description })),
      documents: filteredDocuments,
      links: filteredLinks,
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await api.patch(`/claim-guides/${id}`, payload);
        toast({
          title: 'Success',
          description: 'Claim guide updated successfully',
        });
      } else {
        await api.post('/claim-guides', payload);
        toast({
          title: 'Success',
          description: 'Claim guide created successfully',
        });
      }
      navigate('/claim-guides');
    } catch (error) {
      console.error('Error saving claim guide:', error);
      toast({
        title: 'Error',
        description: 'Failed to save claim guide',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, { step: steps.length + 1, description: '' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, description: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description };
    setSteps(newSteps);
  };

  const addDocument = () => {
    setDocuments([...documents, '']);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, value: string) => {
    const newDocuments = [...documents];
    newDocuments[index] = value;
    setDocuments(newDocuments);
  };

  const addLink = () => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {isEditMode ? 'Edit Claim Guide' : 'Create New Claim Guide'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Insurance Policy, Bank Account"
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., How to Claim Life Insurance Policy"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_info">Contact Information</Label>
                <Textarea
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_info: e.target.value })
                  }
                  placeholder="Contact details for relevant authorities/organizations"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claim Process Steps *</CardTitle>
                <Button type="button" onClick={addStep} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 pt-2">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <Textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    className="flex-1"
                  />
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Required Documents *</CardTitle>
                <Button type="button" onClick={addDocument} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={doc}
                    onChange={(e) => updateDocument(index, e.target.value)}
                    placeholder="e.g., Death Certificate (Original)"
                    className="flex-1"
                  />
                  {documents.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocument(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Helpful Links */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Helpful Links & Forms</CardTitle>
                <Button type="button" onClick={addLink} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                    placeholder="Link label"
                    className="flex-1"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    placeholder="URL (or # for placeholder)"
                    className="flex-1"
                  />
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/claim-guides')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Update Guide' : 'Create Guide'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
