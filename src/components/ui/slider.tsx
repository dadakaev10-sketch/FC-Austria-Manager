'use client';

interface SliderProps {
  id?: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function Slider({
  id,
  label,
  value,
  min = 1,
  max = 100,
  onChange,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600"
        />
        <div
          className="pointer-events-none absolute left-0 top-0 h-2 rounded-full bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
