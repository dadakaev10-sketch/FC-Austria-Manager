import { cn } from '@/lib/utils';

interface PlayerStatsBarProps {
  label: string;
  value: number;
  maxValue?: number;
  className?: string;
}

export function PlayerStatsBar({
  label,
  value,
  maxValue = 100,
  className,
}: PlayerStatsBarProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="tabular-nums text-gray-500">
          {value}/{maxValue}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
