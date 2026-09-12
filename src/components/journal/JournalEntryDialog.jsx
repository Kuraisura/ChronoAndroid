import { useState } from 'react';
import db from '@/api/backend';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import DatePickerField from '@/components/chrono/DatePickerField';
import TimePickerField from '@/components/chrono/TimePickerField';

export default function JournalEntryDialog({ categories, onCreated }) {
  const today = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: today, time: '08:00', task: '', note: '', category: '' });
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await db.entities.JournalEntry.create({ ...form, photos: [], photo_urls: [], photo_layout: {} });
      setOpen(false);
      setForm({ date: today, time: '08:00', task: '', note: '', category: '' });
      onCreated?.();
    } catch (err) {
      setError(err.message || 'We could not save this journal entry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><button className="inline-flex items-center gap-1.5 rounded-md bg-chrono-cyan px-3.5 py-2 text-[13px] font-semibold text-black"><Plus size={15} /> Add</button></DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[430px]">
        <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-3">
            <div className="space-y-2"><Label htmlFor="journal-date">Date</Label><DatePickerField id="journal-date" value={form.date} onChange={(date) => setForm((current) => ({ ...current, date }))} /></div>
            <div className="space-y-2"><Label htmlFor="journal-time">Time</Label><TimePickerField id="journal-time" value={form.time} onChange={(time) => setForm((current) => ({ ...current, time }))} /></div>
          </div>
          <div><Label htmlFor="journal-task">Activity</Label><Input id="journal-task" value={form.task} onChange={set('task')} required /></div>
          <div><Label htmlFor="journal-category">Category</Label><select id="journal-category" value={form.category} onChange={set('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></div>
          <div className="space-y-2"><Label htmlFor="journal-note">Note</Label><Textarea id="journal-note" value={form.note} onChange={set('note')} rows={5} className="resize-y overflow-y-auto leading-relaxed" required /></div>
          <DialogFooter><Button disabled={loading} type="submit">{loading ? <Loader2 className="animate-spin" size={16} /> : 'Save entry'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
