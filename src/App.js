import React, { useEffect, useMemo, useRef, useState } from "react";

// ------------------------------- Utilities ---------------------------------

const LS = {
  data: "studybuddypro.data.v1",
  theme: "studybuddypro.theme.v1",
};

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const formatDate = (tsOrStr) => {
  if (!tsOrStr) return "";
  const d = typeof tsOrStr === "string" ? new Date(tsOrStr) : new Date(tsOrStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

const pct = (num, den) => (den === 0 ? 0 : Math.round((num / den) * 100));

const SUBJECT_COLORS = [
  { k: "purple", ring: "ring-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  { k: "green", ring: "ring-green-500", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
  { k: "red", ring: "ring-red-500", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
  { k: "orange", ring: "ring-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  { k: "blue", ring: "ring-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
];

function mdToHtml(src) {
  if (!src) return "";
  let s = src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
  s = s.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
  s = s.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
  s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  s = s.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.*?)\*/g, "<em>$1</em>");
  s = s.replace(/`([^`]+)`/g, "<code class='px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800'>$1</code>");
  s = s.replace(/^\> (.*)$/gm, "<blockquote class='pl-3 border-l-2 border-slate-300 dark:border-slate-700'>$1</blockquote>");
  // lists
  s = s.replace(/^(?:- |\* )(.*(?:\n(?:- |\* ).*)*)/gm, (m) => {
    const items = m.split(/\n/).map(li => "<li>" + li.replace(/^(- |\* )/, "") + "</li>").join("");
    return "<ul class='list-disc pl-5'>" + items + "</ul>";
  });
  s = s.replace(/^(?:\d+\. )(.*(?:\n(?:\d+\. ).*)*)/gm, (m) => {
    const items = m.split(/\n/).map(li => "<li>" + li.replace(/^\d+\. /, "") + "</li>").join("");
    return "<ol class='list-decimal pl-5'>" + items + "</ol>";
  });
  // paragraphs
  s = s.replace(/^(?!<h\d|<ul|<ol|<blockquote)(.+)$/gm, "<p>$1</p>");
  return s;
}

// ------------------------------- Data Models -------------------------------

const exampleData = () => {
  const mathId = uid();
  const sciId = uid();
  const folderConcepts = uid();
  const folderHW = uid();
  return {
    subjects: [
      {
        id: mathId,
        name: "Mathematics",
        colorKey: "purple",
        folders: [
          { id: folderConcepts, name: "Concepts" },
          { id: folderHW, name: "Homework" },
        ],
        notes: [
          { id: uid(), folderId: folderConcepts, title: "Limits & Continuity", content: "# Limits\n- Definition\n- Epsilon/Delta\n\n**Tip:** practice!", tags: ["calc"], updatedAt: Date.now() - 86400000 },
          { id: uid(), folderId: folderHW, title: "Week 3 Exercises", content: "1. Page 42 #1-10\n2. Review proofs", tags: ["hw"], updatedAt: Date.now() - 3600000 },
        ],
        assignments: [
          { id: uid(), title: "Derivative Rules Sheet", description: "Summarize product/quotient/chain.", dueDate: new Date(Date.now() + 3*864e5).toISOString().slice(0,10), priority: "High", status: "In Progress", checklist: [{ id: uid(), text: "Product Rule", done: true }, { id: uid(), text: "Quotient Rule", done: false }], attachments: [], createdAt: Date.now(), updatedAt: Date.now() },
        ],
        files: [],
        canvasStrokes: [],
      },
      {
        id: sciId,
        name: "Science",
        colorKey: "green",
        folders: [{ id: uid(), name: "Notes" }],
        notes: [],
        assignments: [],
        files: [],
        canvasStrokes: [],
      },
    ],
    activeSubjectId: null,
  };
};

// ------------------------------ Root Component -----------------------------

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(LS.theme) || "light");
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(LS.data);
    return saved ? JSON.parse(saved) : exampleData();
  });
  const [search, setSearch] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [recentToggleTimes, setRecentToggleTimes] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LS.data, JSON.stringify(data));
  }, [data]);

  const subjects = data.subjects;
  const activeSubject = useMemo(() => {
    const id = data.activeSubjectId || subjects[0]?.id;
    return subjects.find(s => s.id === id) || subjects[0] || null;
  }, [subjects, data.activeSubjectId]);

  const setActiveSubjectId = (id) => setData(d => ({ ...d, activeSubjectId: id }));

  const addSubject = () => {
    const colorKey = SUBJECT_COLORS[(subjects.length) % SUBJECT_COLORS.length].k;
    const s = {
      id: uid(),
      name: "New Subject",
      colorKey,
      folders: [{ id: uid(), name: "General" }],
      notes: [],
      assignments: [],
      files: [],
      canvasStrokes: [],
    };
    setData(d => ({ ...d, subjects: [...d.subjects, s], activeSubjectId: s.id }));
  };

  const updateSubject = (id, patch) => {
    setData(d => ({
      ...d,
      subjects: d.subjects.map(s => s.id === id ? { ...s, ...patch } : s),
    }));
  };

  const removeSubject = (id) => {
    setData(d => {
      const filtered = d.subjects.filter(s => s.id !== id);
      return { ...d, subjects: filtered, activeSubjectId: filtered[0]?.id || null };
    });
  };

  const globalStats = useMemo(() => {
    const allAssignments = subjects.flatMap(s => s.assignments);
    const done = allAssignments.filter(a => a.status === "Done").length;
    const upcoming = allAssignments
      .filter(a => a.status !== "Done" && a.dueDate)
      .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0,5);
    const noteCount = subjects.reduce((acc, s) => acc + s.notes.length, 0);
    return { assignmentCount: allAssignments.length, done, noteCount, upcoming };
  }, [subjects]);

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const hits = [];
    for (const s of subjects) {
      for (const n of s.notes) {
        if ((n.title + " " + n.content).toLowerCase().includes(q)) {
          hits.push({ type: "note", subjectId: s.id, subject: s.name, id: n.id, title: n.title });
        }
      }
      for (const a of s.assignments) {
        const bucket = [a.title, a.description, a.priority, a.status].join(" ");
        if (bucket.toLowerCase().includes(q)) {
          hits.push({ type: "assignment", subjectId: s.id, subject: s.name, id: a.id, title: a.title });
        }
      }
    }
    return hits.slice(0, 20);
  }, [subjects, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-900/50 border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <img 
          src="/images/study_buddy.png" 
          alt="Study Buddy Icon" 
          className="h-9 w-9 rounded-xl object-cover"
        />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Study Buddy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Founded by Flynn Zipsin</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-slate-700/60 text-xs">
              Notes <span className="font-semibold">{globalStats.noteCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-slate-700/60 text-xs">
              Assignments <span className="font-semibold">{globalStats.assignmentCount}</span>
            </div>
          </div>
          <input
            placeholder="Search notes & assignments…"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="h-9 w-48 md:w-64 rounded-md border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          {/* Dark/Light Mode Button with spam protection */}
<div className="relative">
  <button
    onClick={() => {
      const now = Date.now();
      if (!window._themeClicks) window._themeClicks = [];
      window._themeClicks.push(now);
      window._themeClicks = window._themeClicks.filter(t => now - t < 3000);
      if (window._themeClicks.length > 8) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        return;
      }

      const next = theme === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(LS.theme, next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }}
    className="h-9 px-3 rounded-md border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/60 text-sm"
  >
    {theme === "dark" ? "Light" : "Dark"}
  </button>

  {showWarning && (
    <div className="absolute right-0 mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded shadow min-w-[220px] text-center">
      Don't give yourself an epileptic seizure...
    </div>
  )}
</div>


        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 grid grid-cols-12 gap-4">
        {/* Sidebar Subjects */}
        <aside className="col-span-12 md:col-span-3 xl:col-span-2">
          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm">Subjects</h2>
              <button onClick={addSubject} className="text-purple-600 dark:text-purple-400 text-sm hover:underline">+ Add</button>
            </div>
            <div className="space-y-1">
              {subjects.map((s) => {
                const color = SUBJECT_COLORS.find(c=>c.k===s.colorKey) || SUBJECT_COLORS[0];
                const isActive = activeSubject?.id === s.id;
                return (
                  <div key={s.id} className={`group rounded-xl border ${isActive ? `ring-2 ${color.ring}`:"border-slate-200/70 dark:border-slate-800"} bg-white/70 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 transition`}>
                    <button onClick={()=>setActiveSubjectId(s.id)} className="w-full px-3 py-2 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
                      <span className="flex-1 text-left text-sm truncate">{s.name}</span>
                    </button>
                    <div className="px-3 pb-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <select
                        value={s.colorKey}
                        onChange={e=>updateSubject(s.id,{ colorKey: e.target.value })}
                        className="h-8 text-xs rounded-md bg-slate-100 dark:bg-slate-800 px-2"
                      >
                        {SUBJECT_COLORS.map(c => <option key={c.k} value={c.k}>{c.k}</option>)}
                      </select>
                      <input
                        className="h-8 w-16 text-xs rounded-md bg-slate-100 dark:bg-slate-800 px-2"
                        value={s.name}
                        onChange={e=>updateSubject(s.id,{ name: e.target.value })}
                      />
                      <button onClick={()=>removeSubject(s.id)} className="h-8 px-2 rounded-md bg-red-500 text-white text-xs">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search Hits */}
          {searchHits.length>0 && (
            <div className="mt-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-3">
              <h3 className="font-semibold text-sm mb-2">Search results</h3>
              <ul className="space-y-1 max-h-60 overflow-auto pr-1">
                {searchHits.map((h)=> (
                  <li key={h.type + h.id} className="text-xs">
                    <button
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={()=> setActiveSubjectId(h.subjectId)}
                    >
                      <span className="font-medium">{h.title}</span>
                      <span className="opacity-60 ml-1">in {h.subject}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Main Column */}
        <section className="col-span-12 md:col-span-9 xl:col-span-10 grid gap-4">
          {/* Dashboard */}
          <Dashboard stats={globalStats} />

          {/* Subject Workspace */}
          {activeSubject ? (
            <SubjectWorkspace
              key={activeSubject.id}
              subject={activeSubject}
              onChange={(patch)=>updateSubject(activeSubject.id, patch)}
            />
          ) : (
            <div className="rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50">
              <p>No subjects yet. Create one to begin.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ------------------------------ Dashboard View -----------------------------

function Dashboard({ stats }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Overview</h2>
        <div className="text-xs opacity-70">Up next</div>
      </div>
      <div className="grid md:grid-cols-4 gap-3 mt-3">
        <StatCard label="Total Assignments" value={stats.assignmentCount} />
        <StatCard label="Completed" value={stats.done} />
        <StatCard label="Notes" value={stats.noteCount} />
        <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
          <h3 className="text-sm font-semibold mb-2">Due soon</h3>
          {stats.upcoming.length === 0 && <p className="text-xs opacity-70">Nothing due in the next few tasks.</p>}
          <ul className="space-y-2 max-h-28 overflow-auto pr-1">
            {stats.upcoming.map((a) => (
              <li key={a.id} className="text-xs flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-medium">{a.title}</span>
                <span className="opacity-70 ml-auto">{formatDate(a.dueDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
      <div className="text-xs opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

// ---------------------------- Subject Workspace ----------------------------

function SubjectWorkspace({ subject, onChange }) {
  const [tab, setTab] = useState("notes"); // notes | assignments | files

  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-3 md:p-4">
      <header className="flex flex-wrap items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold mr-3">{subject.name}</h2>
        <TabButton active={tab==="notes"} onClick={()=>setTab("notes")}>Notes</TabButton>
        <TabButton active={tab==="assignments"} onClick={()=>setTab("assignments")}>Assignments</TabButton>
        <TabButton active={tab==="files"} onClick={()=>setTab("files")}>Files</TabButton>
      </header>

      {tab === "notes" && <NotesPanel subject={subject} onChange={onChange} />}
      {tab === "assignments" && <AssignmentsPanel subject={subject} onChange={onChange} />}
      {tab === "files" && <FilesPanel subject={subject} onChange={onChange} />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-3 rounded-full text-sm border transition ${active ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent" : "bg-white/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-900"}`}
    >
      {children}
    </button>
  );
}

// -------------------------------- Notes Panel ------------------------------

function NotesPanel({ subject, onChange }) {
  const [folderName, setFolderName] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [activeNoteId, setActiveNoteId] = useState(subject.notes[0]?.id || null);
  const [filterFolder, setFilterFolder] = useState("all");

  useEffect(()=>{
    if (!activeNoteId && subject.notes[0]) setActiveNoteId(subject.notes[0].id);
  }, [subject.notes, activeNoteId]);

  const addFolder = () => {
    if (!folderName.trim()) return;
    onChange({ folders: [...subject.folders, { id: uid(), name: folderName.trim() }] });
    setFolderName("");
  };

const removeFolder = () => {
  if (filterFolder === "all") return;
  
  onChange({
    folders: subject.folders.filter(f => f.id !== filterFolder),
    notes: subject.notes.filter(n => n.folderId !== filterFolder)
  });
  
  setFilterFolder("all");
};

  const addNote = () => {
    const folderId = subject.folders[0]?.id;
    const note = { id: uid(), folderId, title: newNoteTitle || "New Note", content: "", tags: [], updatedAt: Date.now() };
    onChange({ notes: [note, ...subject.notes] });
    setNewNoteTitle("");
    setActiveNoteId(note.id);
  };

  const updateNote = (id, patch) => {
    onChange({ notes: subject.notes.map(n => n.id===id ? { ...n, ...patch, updatedAt: Date.now() } : n) });
  };

  const removeNote = (id) => {
    const next = subject.notes.filter(n => n.id !== id);
    onChange({ notes: next });
    if (activeNoteId === id) setActiveNoteId(next[0]?.id || null);
  };

  const filteredNotes = subject.notes.filter(n => filterFolder==="all" ? true : n.folderId === filterFolder);

  const activeNote = subject.notes.find(n => n.id === activeNoteId) || null;

  return (
    <div className="grid md:grid-cols-12 gap-3">
      {/* Folders & Notes List */}
      <div className="md:col-span-4 rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
        <div className="mb-3">
          <h3 className="text-sm font-semibold mb-2">Folders</h3>
          <div className="flex gap-2 mb-2">
            <input value={folderName} onChange={e=>setFolderName(e.target.value)} placeholder="New folder" className="h-9 w-30 text-xs rounded-md bg-slate-100 dark:bg-slate-800 px-2" />
            <button onClick={addFolder} className="h-9 px-2 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm">Add</button>
            <button onClick={removeFolder} className="h-9 px-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm">Remove</button>
          </div>
        <div className="flex gap-2 overflow-auto pb-2">
          <button onClick={()=>setFilterFolder("all")} className={`h-8 px-3 rounded-full text-xs border ${filterFolder==="all"?"bg-slate-900 text-white dark:bg-white dark:text-slate-900":"bg-white dark:bg-slate-900/50"}`}>All</button>
          {subject.folders.map(f => (
            <button key={f.id} onClick={()=>setFilterFolder(f.id)} className={`h-8 px-3 rounded-full text-xs border ${filterFolder===f.id?"bg-slate-900 text-white dark:bg-white dark:text-slate-900":"bg-white dark:bg-slate-900/50"}`}>{f.name}</button>
          ))}
        </div>
        </div>

        <div className="mb-2 flex gap-2">
          <input value={newNoteTitle} onChange={e=>setNewNoteTitle(e.target.value)} placeholder="New note title" className="flex-1 h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm" />
          <button onClick={addNote} className="h-9 px-3 rounded-md bg-purple-600 text-white text-sm">+ Note</button>
        </div>

        <div className="border rounded-md border-slate-200/70 dark:border-slate-800 overflow-hidden">
  <ul className="space-y-1 max-h-80 overflow-auto p-1">
    {filteredNotes.map(n => (
      <li key={n.id}>
        <button onClick={()=>setActiveNoteId(n.id)} className={`w-full text-left px-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 ${activeNoteId===n.id?"ring-2 ring-purple-500":""}`}>
          <div className="text-sm font-medium truncate">{n.title}</div>
          <div className="text-xs opacity-60">{formatDate(n.updatedAt)}</div>
        </button>
      </li>
    ))}
    {filteredNotes.length===0 && <li className="text-xs opacity-70 p-2">No notes here yet.</li>}
  </ul>
</div>
      </div>

      {/* Editor */}
      <div className="md:col-span-8 rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
        {activeNote ? (
          <NoteEditor
            note={activeNote}
            folders={subject.folders}
            onChange={(patch)=>updateNote(activeNote.id, patch)}
            onDelete={()=>removeNote(activeNote.id)}
          />
        ) : (
          <div className="text-sm opacity-70">Select or create a note to start.</div>
        )}
      </div>
    </div>
  );
}

function NoteEditor({ note, folders, onChange, onDelete }) {
  const [mode, setMode] = useState("edit"); // edit | preview
  const [content, setContent] = useState(note.content);
  useEffect(()=>setContent(note.content), [note.id]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="flex-1 h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm"
          value={note.title}
          onChange={e=>onChange({ title: e.target.value })}
        />
        <select
          className="h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm"
          value={note.folderId}
          onChange={e=>onChange({ folderId: e.target.value })}
        >
          {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <button onClick={()=>setMode(mode==="edit"?"preview":"edit")} className="h-9 px-3 rounded-md border text-sm">{mode==="edit"?"Preview":"Edit"}</button>
        <button onClick={onDelete} className="h-9 px-3 rounded-md bg-red-600 text-white text-sm">Delete</button>
      </div>

      <div className="flex items-center gap-1">
        <div className="ml-auto text-xs opacity-70">{wordCount} words</div>
      </div>

      {mode === "edit" ? (
      <div
  id="editor-div"
  contentEditable
  dangerouslySetInnerHTML={{ __html: content }}
  onBlur={(e) => {
    const newContent = e.target.innerHTML;
    setContent(newContent);
    onChange({ content: newContent });
  }}
  className="min-h-[320px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-3 text-sm overflow-auto outline-none"
  style={{ whiteSpace: 'pre-wrap' }}
  suppressContentEditableWarning={true}
/>
      ) : (
        <div className="pred pred-slate max-w-none dark:pred-invert border rounded-lg p-4 bg-white dark:bg-slate-900">
          <div dangerouslySetInnerHTML={{ __html: mdToHtml(content) }} />
        </div>
      )}
    </div>
  );
}

// --------------------------- Assignments Manager ---------------------------

function AssignmentsPanel({ subject, onChange }) {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "Medium" });
  const [filter, setFilter] = useState({ status: "All", priority: "All" });

  const addAssignment = () => {
    if (!form.title.trim()) return;
    const a = {
      id: uid(),
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || "",
      priority: form.priority || "Medium",
      status: "Not Started",
      checklist: [],
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onChange({ assignments: [a, ...subject.assignments] });
    setForm({ title: "", description: "", dueDate: "", priority: "Medium" });
  };

  const updateAssignment = (id, patch) => {
    onChange({ assignments: subject.assignments.map(a => a.id===id? { ...a, ...patch, updatedAt: Date.now() } : a) });
  };

  const removeAssignment = (id) => {
    onChange({ assignments: subject.assignments.filter(a => a.id !== id) });
  };

  const addChecklistItem = (aid) => {
    const item = { id: uid(), text: "New item", done: false };
    updateAssignment(aid, {
      checklist: subject.assignments.find(a=>a.id===aid).checklist.concat(item)
    });
  };

  const handleFile = (aid, files) => {
    const arr = Array.from(files || []);
    const mapped = arr.map(f => ({
      id: uid(),
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
      addedAt: Date.now(),
    }));
    const a = subject.assignments.find(a=>a.id===aid);
    updateAssignment(aid, { attachments: (a.attachments || []).concat(mapped) });
  };

  const filtered = subject.assignments.filter(a => {
    const statusOk = filter.status==="All" || a.status===filter.status;
    const prioOk = filter.priority==="All" || a.priority===filter.priority;
    return statusOk && prioOk;
  });

  return (
    <div className="grid md:grid-cols-12 gap-3">
      {/* Add form */}
      <div className="md:col-span-4 rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
        <h3 className="text-sm font-semibold mb-2">New Assignment</h3>
        <div className="space-y-2">
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm" />
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="w-full rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm h-24" />
          <div className="flex gap-2">
            <input type="date" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} className="h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm flex-1" />
            <select value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})} className="h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm">
              {["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={addAssignment} className="h-9 w-full rounded-md bg-purple-600 text-white text-sm">Add</button>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Filters</h4>
          <div className="flex gap-2">
            <select value={filter.status} onChange={e=>setFilter({...filter, status:e.target.value})} className="h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm">
              {["All","Not Started","In Progress","Done"].map(s=><option key={s}>{s}</option>)}
            </select>
            <select value={filter.priority} onChange={e=>setFilter({...filter, priority:e.target.value})} className="h-9 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm">
              {["All","Low","Medium","High"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="md:col-span-8 rounded-xl border border-slate-200/70 dark:border-slate-800 p-3">
        <div className="grid gap-3">
          {filtered.map((a)=> (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onChange={(patch)=>updateAssignment(a.id, patch)}
              onDelete={()=>removeAssignment(a.id)}
              onAddChecklist={()=>addChecklistItem(a.id)}
              onFiles={(files)=>handleFile(a.id, files)}
            />
          ))}
          {filtered.length===0 && <div className="text-sm opacity-70">No assignments match filters.</div>}
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment, onChange, onDelete, onAddChecklist, onFiles }) {
  const completed = assignment.checklist.filter(i=>i.done).length;
  const total = assignment.checklist.length;
  const progress = total ? pct(completed, total) : assignment.status==="Done" ? 100 : 0;
  const days = daysUntil(assignment.dueDate);
  const dueClass = days==null ? "" : days<0 ? "text-red-600" : days<=3 ? "text-orange-600" : "text-green-600";

  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3 bg-white/80 dark:bg-slate-900/50">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="h-9 w-28 text-xs rounded-md bg-slate-100 dark:bg-slate-800 px-2"
          value={assignment.title}
          onChange={e=>onChange({ title: e.target.value })}
        />
        <select value={assignment.status} onChange={e=>onChange({ status: e.target.value })} className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
          {["Not Started","In Progress","Done"].map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={assignment.priority} onChange={e=>onChange({ priority: e.target.value })} className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
          {["Low","Medium","High"].map(s=><option key={s}>{s}</option>)}
        </select>
        <input type="date" value={assignment.dueDate} onChange={e=>onChange({ dueDate: e.target.value })} className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        <button onClick={onDelete} className="h-9 px-3 rounded-md bg-red-600 text-white text-sm">Delete</button>
      </div>

      <textarea
        value={assignment.description}
        onChange={e=>onChange({ description: e.target.value })}
        placeholder="Description"
        className="w-full rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm h-20 mt-2"
      />

      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-2 bg-purple-600" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs opacity-70">{progress}%</div>
        <div className={`text-xs ml-auto ${dueClass}`}>
          {assignment.dueDate ? (days<0 ? `Overdue ${Math.abs(days)}d` : `${days}d left`) : "No due date"}
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-semibold">Checklist</div>
          <button onClick={onAddChecklist} className="h-8 px-2 rounded-md border text-xs">+ Item</button>
        </div>
        <ul className="space-y-1">
          {assignment.checklist.map(item => (
            <li key={item.id} className="flex items-center gap-2">
              <input type="checkbox" checked={item.done} onChange={e=>onChange({ checklist: assignment.checklist.map(i=>i.id===item.id?{...i, done:e.target.checked}:i) })} />
              <input value={item.text} onChange={e=>onChange({ checklist: assignment.checklist.map(i=>i.id===item.id?{...i, text:e.target.value}:i) })} className="flex-1 h-8 rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-sm" />
              <button onClick={()=>onChange({ checklist: assignment.checklist.filter(i=>i.id!==item.id) })} className="text-xs px-2 h-8 rounded-md bg-red-500 text-white">Remove</button>
            </li>
          ))}
          {assignment.checklist.length===0 && <li className="text-xs opacity-70">No items yet.</li>}
        </ul>
      </div>

      {/* Attachments */}
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-semibold">Attachments</div>
          <input type="file" multiple onChange={e=>onFiles(e.target.files)} className="text-xs" />
        </div>
        <ul className="grid md:grid-cols-2 gap-2">
          {(assignment.attachments||[]).map(f => (
            <li key={f.id} className="rounded-md border border-slate-200/70 dark:border-slate-800 p-2 flex items-center gap-2 text-xs">
              <span className="truncate flex-1">{f.name}</span>
              <a href={f.url} download className="px-2 py-1 rounded-md border">Download</a>
              <button onClick={()=>onChange({ attachments: assignment.attachments.filter(x=>x.id!==f.id) })} className="px-2 py-1 rounded-md bg-red-500 text-white">Remove</button>
            </li>
          ))}
          {(assignment.attachments||[]).length===0 && <li className="text-xs opacity-70">No files uploaded.</li>}
        </ul>
      </div>
    </div>
  );
}

// -------------------------------- Files Panel ------------------------------

function FilesPanel({ subject, onChange }) {
  const onFiles = (files) => {
    const arr = Array.from(files || []);
    const mapped = arr.map(f => ({
      id: uid(),
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
      addedAt: Date.now(),
    }));
    onChange({ files: (subject.files || []).concat(mapped) });
  };

  const remove = (id) => onChange({ files: subject.files.filter(f => f.id !== id) });

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input type="file" multiple onChange={(e)=>onFiles(e.target.files)} className="text-sm" />

      </div>
      <ul className="grid md:grid-cols-3 gap-3">
        {(subject.files||[]).map(f => (
          <li key={f.id} className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/50">
            <div className="text-sm font-medium truncate">{f.name}</div>
            <div className="text-xs opacity-70">{(f.size/1024).toFixed(1)} KB</div>
            <div className="flex gap-2 mt-2">
              <a href={f.url} download className="h-8 px-2 rounded-md border text-xs flex items-center">Download</a>
              <button onClick={()=>remove(f.id)} className="h-8 px-2 rounded-md bg-red-600 text-white text-xs">Remove</button>
            </div>
          </li>
        ))}
        {(subject.files||[]).length===0 && <li className="text-sm opacity-70">No files yet. Upload to populate.</li>}
      </ul>
    </div>
  );
}
