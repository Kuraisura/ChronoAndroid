import db from '@/api/backend';

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Timer } from "lucide-react";
import { scheduleTaskNotification } from '@/lib/notifications';
import DatePickerField from '@/components/chrono/DatePickerField';
import TimePickerField from '@/components/chrono/TimePickerField';

export default function TaskDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    start_time: "08:00",
    duration_hours: 1,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    setError('');
    try {
      const task = await db.entities.Task.create({
        title: form.title.trim(),
        description: form.description || "",
        date: form.date,
        start_time: form.start_time,
        duration_hours: Number(form.duration_hours) || 1,
        status: "QUEUED",
      });
      await scheduleTaskNotification(task);
      setOpen(false);
      setForm({
        title: "",
        date: "",
        start_time: "08:00",
        duration_hours: 1,
        description: "",
      });
      onCreated?.();
    } catch (err) {
      setError(err.message || 'We could not save this task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-chrono-cyan px-3.5 py-2 text-[13px] font-semibold text-black transition-transform active:scale-[0.98] no-tap"
        >
          <Plus size={15} strokeWidth={2.5} /> Add
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle className="text-chrono-text">New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={set("title")}
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePickerField id="date" value={form.date} onChange={(date) => setForm((current) => ({ ...current, date }))} allowRecurring />
              <p className="text-[11px] text-chrono-muted">Leave as “Every day” for a repeating task.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Start time</Label>
              <TimePickerField id="time" value={form.start_time} onChange={(start_time) => setForm((current) => ({ ...current, start_time }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dur">Duration (hours)</Label>
            <div className="relative"><Timer size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-chrono-cyan" /><Input id="dur" className="pl-10" type="number" min="0.5" step="0.5" value={form.duration_hours} onChange={set("duration_hours")} /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="Optional notes"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-chrono-cyan text-black hover:bg-chrono-cyan/90"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Add task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
