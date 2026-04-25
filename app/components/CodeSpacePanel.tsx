"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, FilePlus2, NotebookPen, Search, Trash2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogSecondaryAction,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Badge } from "@/app/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatRemovalBadge, getBadgeToneClass } from "@/lib/retention";

type NoteItem = {
  _id: string;
  title: string;
  content: string;
  expiresAt?: string;
  _createdAt: string;
  _updatedAt: string;
};

type CodeSpacePanelProps = {
  workspaceKey: string;
};

const CodeSpacePanel = ({ workspaceKey }: CodeSpacePanelProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isInitialLoading, setInitialLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isWipeOpen, setWipeOpen] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/code-notes?key=${encodeURIComponent(workspaceKey)}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load notes');
      }

      const nextNotes = (data.notes ?? []) as NoteItem[];
      setNotes(nextNotes);
      setActiveId((current) => (current && nextNotes.some((note) => note._id === current) ? current : nextNotes[0]?._id ?? null));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to load notes',
        variant: 'destructive',
      });
      setNotes([]);
      setActiveId(null);
    } finally {
      setInitialLoading(false);
    }
  }, [toast, workspaceKey]);

  useEffect(() => {
    setMounted(true);
    void loadNotes();
  }, [loadNotes]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;

    return notes.filter((note) => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query));
  }, [notes, search]);

  const activeNote = useMemo(() => notes.find((note) => note._id === activeId) ?? null, [activeId, notes]);

  useEffect(() => {
    setDraftTitle(activeNote?.title ?? '');
    setDraftContent(activeNote?.content ?? '');
  }, [activeNote]);

  const refreshAndSelect = useCallback(async (nextActiveId?: string | null) => {
    await loadNotes();
    if (nextActiveId !== undefined) {
      setActiveId(nextActiveId);
    }
  }, [loadNotes]);

  const isEmptyNote = (note: Pick<NoteItem, 'title' | 'content'>) => {
    return note.title.trim().length === 0 && note.content.trim().length === 0;
  };

  const createNote = useCallback(async () => {
    const existingEmpty = notes.find((note) => isEmptyNote(note));

    if (existingEmpty) {
      setActiveId(existingEmpty._id);
      toast({
        title: 'Empty note already exists',
        description: 'Fill the current blank note before creating another one.',
        variant: 'default',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/code-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: workspaceKey, title: '', content: '' }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to create note');
      }

      toast({
        title: 'Note created',
        description: 'A new note is ready in Code Space.',
        variant: 'success',
      });

      const created = data.note as NoteItem;
      if (created?._id) {
        setNotes((current) => [created, ...current]);
        setActiveId(created._id);
      } else {
        await refreshAndSelect();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to create note',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [notes, refreshAndSelect, toast, workspaceKey]);

  useEffect(() => {
    const onCreateNote = (event: Event) => {
      const customEvent = event as CustomEvent<{ workspaceKey?: string }>;
      if (customEvent.detail?.workspaceKey && customEvent.detail.workspaceKey !== workspaceKey) return;
      void createNote();
    };

    window.addEventListener('sanityhub:create-note', onCreateNote);
    return () => window.removeEventListener('sanityhub:create-note', onCreateNote);
  }, [createNote, workspaceKey]);

  const saveActive = async () => {
    if (!activeId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/code-notes/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draftTitle, content: draftContent }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save note');
      }

      const updatedNote = data?.note as NoteItem | undefined;
      if (updatedNote?._id) {
        setNotes((current) => current.map((note) => (note._id === updatedNote._id ? { ...note, ...updatedNote } : note)));
      } else {
        await loadNotes();
      }

      toast({
        title: 'Note saved',
        description: 'Your changes were stored.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to save note',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteActive = async () => {
    if (!activeId) return;

    try {
      const response = await fetch(`/api/code-notes/${activeId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to delete note');
      }

      const nextNotes = notes.filter((note) => note._id !== activeId);
      setNotes(nextNotes);
      setActiveId(nextNotes[0]?._id ?? null);

      toast({
        title: 'Note removed',
        description: 'The selected note has been deleted.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to delete note',
        variant: 'destructive',
      });
    }
  };

  const wipeAllNotes = async () => {
    try {
      const response = await fetch(`/api/code-notes?key=${encodeURIComponent(workspaceKey)}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to wipe notes');
      }

      setNotes([]);
      setActiveId(null);
      setWipeOpen(false);

      toast({
        title: 'All notes deleted',
        description: 'Code Space has been cleared.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to wipe notes',
        variant: 'destructive',
      });
    }
  };

  const copyActive = async () => {
    if (!activeNote) return;

    const payload = `# ${activeNote.title}\n\n${activeNote.content}`;
    try {
      await navigator.clipboard.writeText(payload);
      toast({
        title: 'Copied',
        description: 'Current note copied to clipboard.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not access clipboard.',
        variant: 'destructive',
      });
    }
  };

  const isDraftDirty = Boolean(
    activeNote && (draftTitle !== activeNote.title || draftContent !== activeNote.content),
  );

  if (!mounted || isInitialLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border/70 bg-card/60" />;
  }

  return (
    <section className="space-y-4">
      <Card id='code-space' className="border-border/50 bg-gradient-to-br from-emerald-500/10 via-card to-card/95 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-3xl">
              <NotebookPen className="h-6 w-6 text-emerald-600" />
              Code Space Notes
            </CardTitle>
            <Badge className="rounded-full border border-border/70 bg-background text-muted-foreground">
              {notes.length} note{notes.length === 1 ? '' : 's'}
            </Badge>
          </div>
          <CardDescription>
            Keep snippets, quick reminders, and copy-paste notes for key 
            {
             <span
              className="font-bold text-white"
             >
                {" " + workspaceKey + ". "}
             </span>
            }
            All notes expires in 10 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes"
                className="h-11 w-full rounded-2xl pl-9"
              />
            </div>
            <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={copyActive} disabled={!activeNote}>
              <Copy className="h-4 w-4" />
              Copy note
            </Button>
            <Button type="button" className="h-11 rounded-2xl" onClick={createNote} disabled={isSaving}>
              <FilePlus2 className="h-4 w-4" />
              New note
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setWipeOpen(true)}
              disabled={notes.length === 0}
            >
              Wipe notes
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="order-1 rounded-[1.2rem] border border-border/70 bg-background/60 p-2 lg:order-1">
              {filteredNotes.length === 0 ? (
                <p className="px-3 py-5 text-sm text-muted-foreground">No matching notes.</p>
              ) : (
                <div className="space-y-2 pr-1 lg:max-h-[460px] lg:overflow-y-auto">
                  {filteredNotes.map((note) => {
                    const badge = formatRemovalBadge(note.expiresAt);
                    return (
                      <button
                        key={note._id}
                        type="button"
                        onClick={() => setActiveId(note._id)}
                        className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
                          note._id === activeId
                            ? 'bg-emerald-500/15 text-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{note.title || 'Untitled note'}</p>
                          <Badge className={`rounded-full border px-2 py-0.5 text-[10px] ${getBadgeToneClass(badge.tone)}`}>
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{note.content || 'No content yet'}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="order-2 space-y-3 rounded-[1.2rem] border border-border/70 bg-background/60 p-4 lg:order-2">
              {activeNote ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge className={`rounded-full border px-3 py-1 text-xs ${getBadgeToneClass(formatRemovalBadge(activeNote.expiresAt).tone)}`}>
                      {formatRemovalBadge(activeNote.expiresAt).label}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(activeNote._updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <Input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    className="h-11 rounded-xl font-semibold"
                    placeholder="Note title"
                  />
                  <textarea
                    value={draftContent}
                    onChange={(event) => setDraftContent(event.target.value)}
                    placeholder="Write your note, snippet, or checklist..."
                    className="min-h-[280px] w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(activeNote._createdAt).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" variant="outline" className="rounded-full" onClick={() => void saveActive()} disabled={isSaving || !isDraftDirty}>
                        Save note
                      </Button>
                      <Button type="button" variant="destructive" className="rounded-full" onClick={deleteActive}>
                        <Trash2 className="h-4 w-4" />
                        Delete note
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No note selected yet. Create a blank note to start writing.</p>
                  <Button type="button" className="rounded-full" onClick={createNote} disabled={isSaving}>
                    <FilePlus2 className="h-4 w-4" />
                    Create first note
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isWipeOpen} onOpenChange={setWipeOpen}>
        <AlertDialogContent className="max-w-md gap-0 border-border/70 bg-card p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
          <div className="h-1.5 bg-gradient-to-r from-destructive via-red-600 to-destructive" />
          <AlertDialogHeader className="space-y-2 px-6 pb-3 pt-6 text-left">
            <AlertDialogTitle>Wipe all notes?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              This permanently deletes every note in this Code Space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 px-6 pb-6 pt-1 sm:justify-end">
            <AlertDialogSecondaryAction className="h-11 rounded-full border-border/70">Cancel</AlertDialogSecondaryAction>
            <Button
              type="button"
              variant="destructive"
              className="h-11 rounded-full"
              onClick={() => void wipeAllNotes()}
              disabled={notes.length === 0}
            >
              Wipe notes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default CodeSpacePanel;
