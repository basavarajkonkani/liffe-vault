import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
}: StatsCardProps) => {
  return (
    <Card className="glass-card hover-glow fade-in-up transition-smooth group">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate group-hover:text-primary transition-smooth">{value}</p>
            {trend && (
              <p
                className={cn(
                  'text-xs mt-1 sm:mt-2 font-medium transition-smooth',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          <div
            className={cn(
              'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 ml-3 transition-smooth group-hover:scale-110',
              'bg-primary/10 group-hover:bg-primary/20',
              iconColor
            )}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
