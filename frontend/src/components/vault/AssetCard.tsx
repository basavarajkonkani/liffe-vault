import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users } from 'lucide-react';
import type { Asset } from '@/types';
import { cn } from '@/lib/utils';

interface AssetCardProps {
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

export const AssetCard = ({ asset, onClick }: AssetCardProps) => {
  const documentCount = asset.documents?.length || 0;
  const nomineeCount = asset.linked_nominees?.length || 0;

  return (
    <Card
      className={cn(
        'glass-card hover-lift cursor-pointer fade-in-up touch-manipulation group',
        onClick && 'hover:border-primary/50 active:scale-[0.98] transition-smooth'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3 p-4 sm:p-6 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-smooth">
            {asset.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn('shrink-0 text-xs transition-smooth', categoryColors[asset.category])}
          >
            {asset.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1.5 transition-smooth group-hover:text-primary">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>
              {documentCount} {documentCount === 1 ? 'doc' : 'docs'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 transition-smooth group-hover:text-primary">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>
              {nomineeCount} {nomineeCount === 1 ? 'nominee' : 'nominees'}
            </span>
          </div>
        </div>
        <div className="mt-2 sm:mt-3 text-xs text-gray-500">
          Created {new Date(asset.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
