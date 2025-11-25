import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Nominee } from '@/types';
import { cn } from '@/lib/utils';

interface NomineeSelectorProps {
  nominees: Nominee[];
  selectedNomineeId: string | null;
  onSelect: (nomineeId: string) => void;
  disabled?: boolean;
}

export function NomineeSelector({
  nominees,
  selectedNomineeId,
  onSelect,
  disabled = false,
}: NomineeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNominees = nominees.filter((nominee) =>
    nominee.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search nominees by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
          disabled={disabled}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto rounded-md border">
        {filteredNominees.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No nominees found matching your search.' : 'No nominees available.'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredNominees.map((nominee) => (
              <button
                key={nominee.id}
                onClick={() => onSelect(nominee.id)}
                disabled={disabled}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
                  selectedNomineeId === nominee.id && 'bg-primary/10 font-medium'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{nominee.user?.email}</span>
                  {selectedNomineeId === nominee.id && (
                    <span className="text-xs text-primary">Selected</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
