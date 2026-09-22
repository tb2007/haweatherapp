import { ReactNode } from 'react';

interface Props {
  title: string;
  hours: number;
  children: (hours: number) => ReactNode;
}

export function ChartContainer({ title, hours, children }: Props) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children(hours)}
    </div>
  );
}
