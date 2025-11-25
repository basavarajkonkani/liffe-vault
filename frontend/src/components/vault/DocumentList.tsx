import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, FileText, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { Document, ApiResponse } from '@/types';

interface DocumentListProps {
  documents: Document[];
  isOwner: boolean;
  onDocumentDeleted?: () => void;
}

const DocumentList = ({ documents, isOwner, onDocumentDeleted }: DocumentListProps) => {
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle document download
  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await api.get<ApiResponse<{ url: string }>>(
        `/documents/${documentId}/download`
      );

      if (response.data.success && response.data.data?.url) {
        // Open signed URL in new tab for download
        window.open(response.data.data.url, '_blank');
        toast({
          title: 'Download Started',
          description: `Downloading ${fileName}`,
        });
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      // Error toast is handled by axios interceptor
    }
  };

  // Handle delete document
  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      setDeletingDocumentId(documentToDelete.id);
      const response = await api.delete<ApiResponse<void>>(
        `/documents/${documentToDelete.id}`
      );

      if (response.data.success) {
        toast({
          title: 'Document Deleted',
          description: `${documentToDelete.file_name} has been successfully deleted.`,
        });
        
        // Call the callback to refresh the asset data
        if (onDocumentDeleted) {
          onDocumentDeleted();
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      // Error toast is handled by axios interceptor
    } finally {
      setDeletingDocumentId(null);
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDocumentToDelete(null);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {document.file_name}
                  </div>
                </TableCell>
                <TableCell>{formatFileSize(document.file_size)}</TableCell>
                <TableCell>{formatDate(document.uploaded_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(document.id, document.file_name)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(document)}
                        disabled={deletingDocumentId === document.id}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingDocumentId === document.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{documentToDelete?.file_name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={!!deletingDocumentId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!!deletingDocumentId}
              className="gap-2"
            >
              {deletingDocumentId ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentList;
