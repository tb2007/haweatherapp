import { ReactNode } from 'react';

interface Props {
  title: string;
  hours: number;
  children: (hours: number) => ReactNode;
}

export function ChartContainer({ title, hours, children }: Props) {
  return (
    <div className="rounded-xl bg-slate-800 p-4 shadow">
      <h3 className="mb-4 text-sm font-semibold text-slate-300">{title}</h3>
      {children(hours)}
    </div>
  );
}
