import { useState, ReactNode } from 'react';
import { TimeRangePicker } from '../ui/TimeRangePicker';

interface Props {
  title: string;
  defaultHours?: number;
  children: (hours: number) => ReactNode;
}

export function ChartContainer({ title, defaultHours = 24, children }: Props) {
  const [hours, setHours] = useState(defaultHours);

  return (
    <div className="rounded-xl bg-slate-800 p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        <TimeRangePicker hours={hours} onChange={setHours} />
      </div>
      {children(hours)}
    </div>
  );
}
