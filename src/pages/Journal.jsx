import { useCallback, useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, Images, Loader2 } from 'lucide-react';
import db from '@/api/backend';
import Card from '@/components/chrono/Card';
import CategoryDialog from '@/components/journal/CategoryDialog';
import JournalEntryDialog from '@/components/journal/JournalEntryDialog';

function formatTime(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function Journal() {
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [active, setActive] = useState('All Entries');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryRows, entryRows] = await Promise.all([
        db.entities.Category.list(),
        db.entities.JournalEntry.list(),
      ]);
      setCategories(categoryRows);
      setEntries(entryRows.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)));
    } catch (err) {
      setError(err.message || 'Journal data could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleBookmark(entry) {
    await db.entities.JournalEntry.update(entry.id, { bookmarked: !entry.bookmarked });
    setEntries((current) => current.map((item) => item.id === entry.id ? { ...item, bookmarked: !item.bookmarked } : item));
  }

  const pills = ['All Entries', ...categories.map((category) => category.name)];
  const filtered = entries.filter((entry) => active === 'All Entries' || entry.category === active);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="text-[26px] font-semibold tracking-tight text-chrono-text">Log</h1>
        <JournalEntryDialog categories={categories} onCreated={load} />
      </div>
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {pills.map((category) => (
          <button key={category} onClick={() => setActive(category)} className={`shrink-0 rounded-[5px] px-3 py-1.5 font-mono text-[11px] font-medium ${active === category ? 'bg-chrono-cyan text-black' : 'bg-chrono-surface2 text-chrono-muted'}`}>
            {category}
          </button>
        ))}
        <CategoryDialog onCreated={load} />
      </div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-chrono-muted" /></div> : (
        <div className="timeline-scroll max-h-[calc(100dvh-14rem)] space-y-4 overflow-y-auto pr-1">
          {filtered.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-chrono-muted">
                <span>{entry.date} · {formatTime(entry.time)}</span>
                <button onClick={() => toggleBookmark(entry)} aria-label="Bookmark entry" className="hover:text-chrono-cyan">
                  {entry.bookmarked ? <BookmarkCheck size={16} className="text-chrono-cyan" /> : <Bookmark size={16} />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2"><h3 className="text-[16px] font-semibold text-chrono-text">{entry.task || 'Journal entry'}</h3>{entry.category && <span className="rounded bg-chrono-surface2 px-2 py-0.5 font-mono text-[9px] text-chrono-cyan">{entry.category}</span>}</div>
              <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-chrono-muted">{entry.note}</p>
              {(entry.photo_urls?.length > 0) && <div className="mt-3 grid grid-cols-3 gap-2">{entry.photo_urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="aspect-[4/3] overflow-hidden rounded-md bg-chrono-surface2">{url ? <img src={url} alt="Journal attachment" className="h-full w-full object-cover" /> : <Images className="m-auto" />}</a>)}</div>}
            </Card>
          ))}
          {filtered.length === 0 && <div className="rounded-xl border border-dashed border-chrono-border p-8 text-center text-[13px] text-chrono-muted">No journal entries yet.</div>}
        </div>
      )}
    </div>
  );
}
