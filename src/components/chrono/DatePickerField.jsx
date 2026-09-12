import { useState } from 'react';
import { CalendarDays, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const parseDate = (value) => value ? new Date(`${value}T00:00:00`) : undefined;
const serializeDate = (value) => value ? format(value, 'yyyy-MM-dd') : '';

export default function DatePickerField({ id, value, onChange, allowRecurring = false }) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" className="picker-trigger">
          <CalendarDays size={18} strokeWidth={2.2} />
          <span>{selected ? format(selected, 'EEE, MMM d, yyyy') : allowRecurring ? 'Every day' : 'Choose a date'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-[min(22rem,calc(100vw-2rem))] border-chrono-border bg-chrono-surface p-2 shadow-2xl">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected || new Date()}
          onSelect={(date) => { if (date) { onChange(serializeDate(date)); setOpen(false); } }}
          captionLayout="dropdown-buttons"
          fromYear={new Date().getFullYear() - 5}
          toYear={new Date().getFullYear() + 10}
          fixedWeeks
          initialFocus
        />
        {allowRecurring && value && <Button type="button" variant="ghost" className="mt-1 w-full text-chrono-muted" onClick={() => { onChange(''); setOpen(false); }}><RotateCcw size={14} className="mr-2" />Repeat every day</Button>}
      </PopoverContent>
    </Popover>
  );
}
