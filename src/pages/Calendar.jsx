import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import db from '@/api/backend';
import { Calendar } from '@/components/ui/calendar';
import Card from '@/components/chrono/Card';
import StatusChip from '@/components/chrono/StatusChip';

const displayTime = (value) => { const [h, m] = (value || '00:00').split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

export default function CalendarPage() {
  const [selected, setSelected] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { db.entities.Task.list().then(setTasks).catch((err) => setError(err.message)); }, []);
  const key = format(selected, 'yyyy-MM-dd');
  const dayTasks = useMemo(() => tasks.filter((task) => !task.date || task.date === key).sort((a, b) => a.start_time.localeCompare(b.start_time)), [tasks, key]);
  const taskDays = useMemo(() => tasks.filter((task) => task.date).map((task) => new Date(`${task.date}T00:00:00`)), [tasks]);

  return (
    <section className="animate-fade-in space-y-5">
      <div><h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-chrono-text">Calendar</h1><p className="mt-2 text-[12px] text-chrono-muted">Choose any date to inspect its schedule.</p></div>
      <Card className="overflow-hidden p-2"><Calendar mode="single" selected={selected} onSelect={(date) => date && setSelected(date)} modifiers={{ hasTasks: taskDays }} modifiersClassNames={{ hasTasks: 'after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-chrono-cyan' }} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear() - 5} toYear={new Date().getFullYear() + 10} fixedWeeks className="w-full" /></Card>
      <div className="flex items-end justify-between gap-3"><div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-chrono-muted">Selected date</p><h2 className="mt-1 text-[19px] font-semibold text-chrono-text">{format(selected, 'EEEE, MMMM d')}</h2></div><StatusChip label={`${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'}`} tone="cyan" /></div>
      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div> : <div className="relative"><div className="absolute bottom-0 left-[7px] top-0 w-px bg-chrono-border" /><div className="timeline-scroll max-h-[calc(100dvh-34rem)] min-h-40 space-y-2.5 overflow-y-auto pb-6 pl-6 pr-1">{dayTasks.length === 0 ? <div className="flex flex-col items-center py-10 text-center text-chrono-muted"><CalendarIcon size={28} /><p className="mt-2 text-sm">Nothing scheduled for this date.</p></div> : dayTasks.map((task) => <Card key={task.id} className="relative flex items-center gap-3 p-3.5"><span className="absolute -left-[22px] top-5 h-3 w-3 rounded-full border-2 border-chrono-bg bg-chrono-cyan" /><div className="w-[4.5rem] shrink-0 font-mono text-[11px] font-semibold text-chrono-cyan">{displayTime(task.start_time)}</div><div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold text-chrono-text">{task.title}</div>{task.description && <div className="truncate text-[11px] text-chrono-muted">{task.description}</div>}</div><StatusChip label={task.status} tone={task.status === 'COMPLETED' ? 'cyan' : 'muted'} /></Card>)}</div></div>}
    </section>
  );
}
