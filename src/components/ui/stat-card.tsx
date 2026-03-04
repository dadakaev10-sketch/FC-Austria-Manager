import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Card } from './card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-emerald-600 bg-emerald-100',
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn('mt-1 text-xs font-medium', {
                'text-green-600': changeType === 'positive',
                'text-red-600': changeType === 'negative',
                'text-gray-500': changeType === 'neutral',
              })}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
