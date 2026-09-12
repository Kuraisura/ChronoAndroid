import { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { WheelPicker, WheelPickerWrapper } from '@ncdai/react-wheel-picker';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const options = (length) => Array.from({ length }, (_, value) => ({ value: String(value).padStart(2, '0'), label: String(value).padStart(2, '0') }));
const displayTime = (value) => {
  const [hour, minute] = (value || '00:00').split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export default function TimePickerField({ id, value, onChange }) {
  const initial = (value || '08:00').split(':');
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(initial[0]);
  const [minute, setMinute] = useState(initial[1]);
  const hours = useMemo(() => options(24), []);
  const minutes = useMemo(() => options(60), []);
  const pickerClasses = { optionItem: 'wheel-option', highlightWrapper: 'wheel-highlight' };
  const openPicker = (next) => { if (next) { const parts = (value || '08:00').split(':'); setHour(parts[0]); setMinute(parts[1]); } setOpen(next); };
  return (
    <Dialog open={open} onOpenChange={openPicker}>
      <DialogTrigger asChild><button id={id} type="button" className="picker-trigger"><Clock3 size={18} strokeWidth={2.2} /><span>{displayTime(value)}</span></button></DialogTrigger>
      <DialogContent className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden border-chrono-border bg-chrono-surface p-0">
        <DialogHeader className="px-5 pt-5"><DialogTitle className="text-chrono-text">Choose time</DialogTitle></DialogHeader>
        <div className="px-5 pb-2">
          <div className="mb-2 flex justify-center gap-16 font-mono text-[10px] uppercase tracking-[0.18em] text-chrono-muted"><span>Hour</span><span>Minute</span></div>
          <WheelPickerWrapper className="wheel-wrapper">
            <WheelPicker options={hours} value={hour} onValueChange={setHour} infinite visibleCount={5} classNames={pickerClasses} />
            <div className="z-10 font-mono text-xl font-bold text-chrono-cyan">:</div>
            <WheelPicker options={minutes} value={minute} onValueChange={setMinute} infinite visibleCount={5} classNames={pickerClasses} />
          </WheelPickerWrapper>
        </div>
        <DialogFooter className="border-t border-chrono-borderSoft bg-chrono-bg/50 px-5 py-4"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" onClick={() => { onChange(`${hour}:${minute}`); setOpen(false); }} className="bg-chrono-cyan text-black">Set time</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
