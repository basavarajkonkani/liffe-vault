import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { DocumentUpload } from '@/components/vault';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from '@/components/ui';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import type { ApiResponse, Asset } from '@/types';

const categories = ['Legal', 'Financial', 'Medical', 'Personal', 'Other'] as const;

const UploadPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{ title?: string; category?: string; file?: string }>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { title?: string; category?: string; file?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Asset title is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setFileError('');
    
    if (file && file.size > 50 * 1024 * 1024) {
      setFileError('File size exceeds 50 MB limit');
      setSelectedFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Step 1: Create the asset
      const assetResponse = await api.post<ApiResponse<Asset>>('/assets', {
        title: title.trim(),
        category,
      });

      setUploadProgress(30);

      if (!assetResponse.data.success || !assetResponse.data.data) {
        throw new Error('Failed to create asset');
      }

      const assetId = assetResponse.data.data.id;

      // Step 2: Upload the document
      const formData = new FormData();
      formData.append('document', selectedFile!);

      setUploadProgress(50);

      await api.post(`/assets/${assetId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              50 + (progressEvent.loaded / progressEvent.total) * 50
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      setUploadProgress(100);

      // Show success toast
      toast({
        title: 'Success',
        description: 'Asset uploaded successfully',
      });

      // Navigate back to vault after a short delay
      setTimeout(() => {
        navigate('/vault');
      }, 500);
    } catch (error: any) {
      console.error('Error uploading asset:', error);
      
      // Error toast is handled by axios interceptor, but we can add specific handling
      if (error.response?.data?.error) {
        toast({
          title: 'Upload Failed',
          description: error.response.data.error,
          variant: 'destructive',
        });
      }
      
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/vault');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 gap-2"
            disabled={isUploading}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Upload New Asset</h1>
          <p className="text-gray-600 mt-1">
            Add a new document to your secure vault
          </p>
        </div>

        {/* Upload Form */}
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
            <CardDescription>
              Provide information about the asset you're uploading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Asset Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Property Deed, Insurance Policy"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) {
                      setErrors({ ...errors, title: undefined });
                    }
                  }}
                  disabled={isUploading}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(value: string) => {
                    setCategory(value);
                    if (errors.category) {
                      setErrors({ ...errors, category: undefined });
                    }
                  }}
                  disabled={isUploading}
                >
                  <SelectTrigger
                    id="category"
                    className={errors.category ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>
                  Document <span className="text-destructive">*</span>
                </Label>
                <DocumentUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  error={fileError || errors.file}
                  maxSizeMB={50}
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium text-primary">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Asset
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UploadPage;
