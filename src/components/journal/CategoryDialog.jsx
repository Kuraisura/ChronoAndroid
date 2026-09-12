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
import { Plus, Loader2 } from "lucide-react";

export default function CategoryDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await db.entities.Category.create({ name: name.trim() });
      setOpen(false);
      setName("");
      onCreated?.();
    } catch (err) {
      setError(err.code === '23505' ? 'That category already exists.' : err.message || 'We could not save this category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="New category"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-chrono-surface2 text-chrono-muted transition-colors hover:bg-chrono-elevated hover:text-chrono-text no-tap"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="text-chrono-text">New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="catname">Category name</Label>
            <Input
              id="catname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Security"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-chrono-cyan text-black hover:bg-chrono-cyan/90"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
