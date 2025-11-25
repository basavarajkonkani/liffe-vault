import { UserX, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { LinkedNominee } from '@/types';

interface LinkedNomineesListProps {
  linkedNominees: LinkedNominee[];
  onUnlink: (linkedNomineeId: string) => void;
  isLoading?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

export function LinkedNomineesList({
  linkedNominees,
  onUnlink,
  isLoading = false,
}: LinkedNomineesListProps) {
  if (linkedNominees.length === 0) {
    return (
      <Card className="p-8 text-center">
        <UserX className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No nominees linked to this asset yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {linkedNominees.map((linkedNominee) => (
        <Card
          key={linkedNominee.id}
          className="flex items-center justify-between p-4 transition-all hover:shadow-md"
        >
          <div className="flex-1">
            <p className="font-medium">{linkedNominee.nominee?.user?.email}</p>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              Linked {formatRelativeTime(linkedNominee.linked_at)}
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onUnlink(linkedNominee.id)}
            disabled={isLoading}
          >
            <UserX className="mr-2 h-4 w-4" />
            Unlink
          </Button>
        </Card>
      ))}
    </div>
  );
}
