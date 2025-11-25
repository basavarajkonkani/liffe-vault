import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Asset } from '@/types';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const categories: Array<Asset['category'] | 'All'> = [
  'All',
  'Legal',
  'Financial',
  'Medical',
  'Personal',
  'Other',
];

export const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[180px] glass-card border-white/40 h-10 sm:h-11 touch-manipulation">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category} value={category} className="touch-manipulation">
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
