import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User } from 'lucide-react';
import type { Asset } from '@/types';
import { cn } from '@/lib/utils';

interface SharedAssetCardProps {
  asset: Asset;
  onClick?: () => void;
}

const categoryColors: Record<Asset['category'], string> = {
  Legal: 'bg-blue-100 text-blue-800 border-blue-200',
  Financial: 'bg-green-100 text-green-800 border-green-200',
  Medical: 'bg-red-100 text-red-800 border-red-200',
  Personal: 'bg-purple-100 text-purple-800 border-purple-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const SharedAssetCard = ({ asset, onClick }: SharedAssetCardProps) => {
  const documentCount = asset.documents?.length || 0;
  const ownerEmail = asset.owner?.email || 'Unknown Owner';

  return (
    <Card
      className={cn(
        'glass-card hover-lift cursor-pointer fade-in',
        onClick && 'hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
            {asset.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn('ml-2 shrink-0', categoryColors[asset.category])}
          >
            {asset.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="truncate">Shared by {ownerEmail}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>
              {documentCount} {documentCount === 1 ? 'document' : 'documents'}
            </span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Created {new Date(asset.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
