import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Check, Loader2, RefreshCw } from 'lucide-react';
import db from '@/api/backend';
import Card from '@/components/chrono/Card';
import StatusChip from '@/components/chrono/StatusChip';
import TaskDialog from '@/components/schedule/TaskDialog';
import { cancelTaskNotification, scheduleTaskNotification } from '@/lib/notifications';

const formatTime = (value) => {
  const [hour, minute] = (value || '00:00').split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
};
const duration = (hours) => `${Math.floor(hours || 0)}h ${String(Math.round(((hours || 0) % 1) * 60)).padStart(2, '0')}m`;
const dateLabel = (value) => {
  if (!value) return 'Every day';
  const date = new Date(`${value}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (+date === +today) return 'Today';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
};

export default function Schedule() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadTasks = useCallback(async () => {
    setError('');
    try { setTasks(await db.entities.Task.list()); }
    catch (err) { setError(err.message || 'Tasks could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  const groups = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    const map = new Map();
    for (const task of sorted) {
      const key = task.date || 'recurring';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    }
    return [...map.entries()].sort(([a], [b]) => a === 'recurring' ? -1 : b === 'recurring' ? 1 : a.localeCompare(b));
  }, [tasks]);

  async function toggleDone(task) {
    const status = task.status === 'COMPLETED' ? 'QUEUED' : 'COMPLETED';
    await db.entities.Task.update(task.id, { status });
    if (status === 'COMPLETED') await cancelTaskNotification(task.id); else await scheduleTaskNotification(task);
    await loadTasks();
  }

  return (
    <section className="animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div><h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-chrono-text">Schedule</h1><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-chrono-muted">{tasks.length} task{tasks.length === 1 ? '' : 's'} across {groups.length} date group{groups.length === 1 ? '' : 's'}</p></div>
        <TaskDialog onCreated={loadTasks} />
      </div>
      <div className="mb-3 mt-6 flex items-center justify-between"><span className="label-caps text-chrono-muted">Timeline by date</span><span className="flex items-center gap-1.5 text-[10px] text-chrono-subtle"><RefreshCw size={11} /> scroll or drag</span></div>
      <div className="relative"><div className="absolute bottom-0 left-[7px] top-0 w-px bg-chrono-border" />
        <div className="timeline-scroll max-h-[calc(100dvh-15rem)] space-y-6 overflow-y-auto pb-10 pl-6 pr-1">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-chrono-cyan" /></div> : error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div> : groups.length === 0 ? <div className="flex flex-col items-center py-14 text-center"><CalendarClock className="text-chrono-muted" size={32} /><p className="mt-3 text-sm text-chrono-muted">No tasks yet. Add your first time block.</p></div> : groups.map(([key, items]) => (
            <section key={key} className="relative">
              <div className="sticky top-0 z-10 -ml-6 mb-2 flex items-center gap-3 bg-chrono-bg/95 py-2 pl-6 backdrop-blur"><span className="absolute left-[2px] h-3 w-3 rounded-full border-2 border-chrono-bg bg-chrono-cyan shadow-[0_0_10px_rgba(0,229,255,.55)]" /><div><h2 className="text-[13px] font-semibold text-chrono-text">{dateLabel(key === 'recurring' ? '' : key)}</h2><p className="font-mono text-[9px] uppercase tracking-widest text-chrono-muted">{items.length} task{items.length === 1 ? '' : 's'}</p></div></div>
              <div className="space-y-2.5">{items.map((task) => {
                const done = task.status === 'COMPLETED';
                return <Card key={task.id} className={`p-4 transition-opacity ${done ? 'opacity-60' : ''}`}><div className="flex items-start gap-3"><div className="w-[4.25rem] shrink-0"><div className="font-mono text-[12px] font-semibold text-chrono-cyan">{formatTime(task.start_time)}</div><div className="mt-1 font-mono text-[9px] text-chrono-muted">{duration(task.duration_hours)}</div></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className={`text-[15px] font-semibold leading-tight text-chrono-text ${done ? 'line-through' : ''}`}>{task.title}</h3>{task.status !== 'QUEUED' && <StatusChip label={task.status} tone="cyan" />}</div>{task.description && <p className="mt-1.5 text-[12px] leading-relaxed text-chrono-muted">{task.description}</p>}</div><button onClick={() => toggleDone(task)} aria-label={done ? 'Mark task queued' : 'Mark task complete'} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 ${done ? 'border-chrono-cyan bg-chrono-cyan text-black' : 'border-chrono-muted bg-chrono-surface2 text-chrono-muted hover:border-chrono-cyan hover:text-chrono-cyan'}`}><Check size={17} strokeWidth={2.5} /></button></div></Card>;
              })}</div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
