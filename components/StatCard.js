'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({ title, value, icon: Icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600',
  };

  // Shrink font size based on value length to prevent overflow
  const valueStr = String(value);
  const valueFontSize =
    valueStr.length > 10 ? 'text-sm' :
    valueStr.length > 7  ? 'text-base' :
    valueStr.length > 5  ? 'text-lg' :
    'text-2xl';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={cn('p-4 md:p-6 bg-gradient-to-br flex-shrink-0', colorClasses[color])}>
            <Icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex-1 p-3 md:p-4 min-w-0">
            <p className="text-xs md:text-sm text-slate-600 font-medium truncate">{title}</p>
            <p className={cn('font-bold text-slate-800 mt-1 truncate', valueFontSize)}>{value}</p>
            {trend && (
              <p className="text-xs text-slate-500 mt-1 truncate">{trend}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}