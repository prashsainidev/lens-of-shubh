"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  IndianRupee,
  Trash2,
  Edit,
  AlertCircle,
  RefreshCw,
  Lock,
  Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  projectId?: string | null;
  project?: WeddingProject | null;
  clientName?: string | null;
  phone?: string | null;
  email?: string | null;
  eventType: string; // The function name (e.g. "Haldi", "Mehndi") or standalone ("Portrait")
  eventDate: string;
  venue?: string | null;
  notes?: string | null;
  status: string;
  isBlocked: boolean;
  blockReason?: string | null;
  totalAmount?: string | null;
  advancePaid?: string | null;
  createdAt: string;
}

interface WeddingProject {
  id: string;
  clientName: string;
  phone?: string | null;
  email?: string | null;
  religion: string; // "Hindu" | "Muslim" | "Destination" | "Other"
  status: string;
  totalAmount?: string | null;
  advancePaid?: string | null;
  notes?: string | null;
  createdAt: string;
  bookings?: Booking[];
}

type ViewMode = "month" | "week";

// ─── Preset Configs ──────────────────────────────────────────────────────────

const RELIGION_PRESETS: Record<string, string[]> = {
  Hindu: [
    "Engagement", "Roka", "Haldi", "Mehendi", "Sangeet", "Garba", 
    "Baraat", "Milni", "Jaimala", "Pheras", "Vidaai", "Reception", "Grihapravesh"
  ],
  Muslim: [
    "Manjha", "Mehendi", "Nikah", "Walima", "Rukhsati"
  ],
  Destination: [
    "Pre-Wedding Shoot", "Cocktail Party", "Welcome Dinner", "Pool Party", "Engagement", "Reception"
  ],
  Other: [
    "Engagement", "Pre-Wedding Shoot", "Sangeet", "Wedding Ceremony", "Reception"
  ]
};

const STANDALONE_TYPES = ["Portrait", "Corporate", "Personal"];

const FUNCTION_CATEGORIES: Record<string, string> = {
  // Pre-Wedding Shoots
  "Pre-Wedding Shoot": "shoot",
  
  // Pre-Wedding Functions
  "Engagement": "pre-wedding-event",
  "Roka": "pre-wedding-event",
  "Haldi": "pre-wedding-event",
  "Mehendi": "pre-wedding-event",
  "Sangeet": "pre-wedding-event",
  "Garba": "pre-wedding-event",
  "Manjha": "pre-wedding-event",
  "Cocktail Party": "pre-wedding-event",
  "Welcome Dinner": "pre-wedding-event",
  "Pool Party": "pre-wedding-event",
  
  // Main Ceremonies
  "Pheras": "ceremony",
  "Nikah": "ceremony",
  "Baraat": "ceremony",
  "Milni": "ceremony",
  "Jaimala": "ceremony",
  "Wedding Ceremony": "ceremony",
  
  // Post-Wedding Functions
  "Vidaai": "post-wedding-event",
  "Reception": "post-wedding-event",
  "Walima": "post-wedding-event",
  "Rukhsati": "post-wedding-event",
  "Grihapravesh": "post-wedding-event",
  
  // Standalone Shoot Types
  "Portrait": "portrait",
  "Corporate": "corporate",
  "Personal": "personal",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  shoot:              { bg: "bg-teal-500/15",    text: "text-teal-300",    border: "border-teal-500/30",   dot: "bg-teal-400"    },
  "pre-wedding-event": { bg: "bg-pink-500/15",    text: "text-pink-300",    border: "border-pink-500/30",   dot: "bg-pink-400"    },
  ceremony:           { bg: "bg-amber-500/15",   text: "text-amber-300",   border: "border-amber-500/30",  dot: "bg-amber-400"   },
  "post-wedding-event":{ bg: "bg-purple-500/15",  text: "text-purple-300",  border: "border-purple-500/30", dot: "bg-purple-400"  },
  portrait:           { bg: "bg-indigo-500/15",  text: "text-indigo-300",  border: "border-indigo-500/30", dot: "bg-indigo-400"  },
  corporate:          { bg: "bg-blue-500/15",    text: "text-blue-300",    border: "border-blue-500/30",   dot: "bg-blue-400"    },
  personal:           { bg: "bg-green-500/15",   text: "text-green-300",   border: "border-green-500/30",  dot: "bg-green-400"   },
  Blocked:            { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/30",    dot: "bg-red-500"     },
};

const STATUS_STYLES: Record<string, string> = {
  confirmed:  "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  pending:    "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  completed:  "bg-green-500/15 text-green-300 border border-green-500/30",
  cancelled:  "bg-red-500/15 text-red-400 border border-red-500/30",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(dateStr: string) {
  return new Date(dateStr).toISOString().split("T")[0];
}

function getBookingsForDate(bookings: Booking[], year: number, month: number, day: number) {
  return bookings.filter((b) => {
    const d = new Date(b.eventDate);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

const getClientName = (b: Booking) => b.project ? b.project.clientName : (b.clientName || "");
const getPhone = (b: Booking) => b.project ? b.project.phone : b.phone;
const getEmail = (b: Booking) => b.project ? b.project.email : b.email;
const getTotalAmount = (b: Booking) => b.project ? b.project.totalAmount : b.totalAmount;
const getAdvancePaid = (b: Booking) => b.project ? b.project.advancePaid : b.advancePaid;
const getStatus = (b: Booking) => b.project ? b.project.status : b.status;
const getReligion = (b: Booking) => b.project ? b.project.religion : "Other";

const getEventColors = (b: Booking) => {
  if (b.isBlocked) return CATEGORY_COLORS["Blocked"];
  const cat = FUNCTION_CATEGORIES[b.eventType] || "personal";
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS["personal"];
};


// ─── Empty Form State ─────────────────────────────────────────────────────────

interface FormState {
  type: "standalone" | "project";
  
  // Project / Standalone shared client info
  clientName: string;
  phone: string;
  email: string;
  status: string;
  totalAmount: string;
  advancePaid: string;
  notes: string;
  religion: string; // only for project
  
  // Standalone booking only
  eventType: string;
  eventDate: string;
  venue: string;
  isBlocked: boolean;
  blockReason: string;
  
  // Project bulk functions
  events: Array<{
    id?: string;
    eventType: string;
    eventDate: string;
    venue: string;
    notes: string;
  }>;
}

const BLANK_FORM: FormState = {
  type: "project",
  clientName: "",
  phone: "",
  email: "",
  status: "confirmed",
  totalAmount: "",
  advancePaid: "",
  notes: "",
  religion: "Hindu",
  eventType: "Portrait",
  eventDate: "",
  venue: "",
  isBlocked: false,
  blockReason: "",
  events: [
    { eventType: "", eventDate: "", venue: "", notes: "" }
  ]
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Panel triggers
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<WeddingProject | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form State
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all bookings for a month
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?month=${currentMonth}&year=${currentYear}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setBookings(data);
    } catch {
      setError("Could not load bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Navigate Calendar
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
    setSelectedBooking(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
    setSelectedBooking(null);
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(null);
    setSelectedBooking(null);
  };

  // Calendar cells generation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells: Array<{ day: number; currentMonth: boolean }> = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, currentMonth: true });
  }
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ day: d, currentMonth: false });
  }

  // ─── Grouping Day Bookings for Sidebar Display ─────────────────────────────
  const getGroupedBookings = () => {
    if (!selectedDay) return [];
    const dayBookings = getBookingsForDate(bookings, selectedDay.year, selectedDay.month, selectedDay.day);
    
    const groups: {
      projectId: string | null;
      project: WeddingProject | null;
      bookings: Booking[];
    }[] = [];

    dayBookings.forEach((b) => {
      if (b.isBlocked) {
        groups.push({ projectId: null, project: null, bookings: [b] });
      } else if (b.projectId && b.project) {
        const existing = groups.find((g) => g.projectId === b.projectId);
        if (existing) {
          existing.bookings.push(b);
        } else {
          groups.push({ projectId: b.projectId, project: b.project, bookings: [b] });
        }
      } else {
        groups.push({ projectId: null, project: null, bookings: [b] });
      }
    });

    return groups;
  };

  // ─── Open Add/Edit Forms ────────────────────────────────────────────────────
  const openAddForm = (prefillDate?: string) => {
    setEditingProject(null);
    setEditingBooking(null);
    setForm({
      ...BLANK_FORM,
      eventType: "Portrait",
      eventDate: prefillDate || "",
      events: [
        { eventType: "Pheras", eventDate: prefillDate || "", venue: "", notes: "" }
      ]
    });
    setFormError(null);
    setShowForm(true);
  };

  const openEditProjectForm = (project: WeddingProject) => {
    setEditingProject(project);
    setEditingBooking(null);
    setForm({
      type: "project",
      clientName: project.clientName,
      phone: project.phone || "",
      email: project.email || "",
      status: project.status,
      totalAmount: project.totalAmount || "",
      advancePaid: project.advancePaid || "",
      notes: project.notes || "",
      religion: project.religion || "Hindu",
      eventType: "Portrait",
      eventDate: "",
      venue: "",
      isBlocked: false,
      blockReason: "",
      events: (project.bookings || []).map((b) => ({
        id: b.id,
        eventType: b.eventType,
        eventDate: toInputDate(b.eventDate),
        venue: b.venue || "",
        notes: b.notes || "",
      })),
    });
    setFormError(null);
    setShowForm(true);
    setSelectedBooking(null);
  };

  const openEditBookingForm = (booking: Booking) => {
    if (booking.projectId && booking.project) {
      // If it belongs to a project, we open the project edit form instead!
      openEditProjectForm(booking.project);
      return;
    }

    setEditingProject(null);
    setEditingBooking(booking);
    setForm({
      type: "standalone",
      clientName: booking.clientName || "",
      phone: booking.phone || "",
      email: booking.email || "",
      status: booking.status,
      totalAmount: booking.totalAmount || "",
      advancePaid: booking.advancePaid || "",
      notes: booking.notes || "",
      religion: "Other",
      eventType: booking.eventType,
      eventDate: toInputDate(booking.eventDate),
      venue: booking.venue || "",
      isBlocked: booking.isBlocked,
      blockReason: booking.blockReason || "",
      events: [],
    });
    setFormError(null);
    setShowForm(true);
    setSelectedBooking(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setEditingBooking(null);
    setForm(BLANK_FORM);
    setFormError(null);
  };

  // ─── Save Booking / Project ────────────────────────────────────────────────
  const handleSave = async () => {
    setFormError(null);

    if (form.type === "project") {
      if (!form.clientName.trim()) {
        setFormError("Client name is required.");
        return;
      }
      if (form.events.length === 0) {
        setFormError("Please add at least one wedding function.");
        return;
      }
      const invalidEvent = form.events.find((e) => !e.eventType.trim() || !e.eventDate);
      if (invalidEvent) {
        setFormError("Please fill out both the function name and date for all functions.");
        return;
      }
    } else {
      if (!form.eventDate) {
        setFormError("Please select a date.");
        return;
      }
      if (!form.isBlocked && !form.clientName.trim()) {
        setFormError("Client name is required.");
        return;
      }
    }

    setIsSaving(true);
    try {
      if (form.type === "project") {
        const payload = {
          clientName: form.clientName,
          phone: form.phone || null,
          email: form.email || null,
          religion: form.religion,
          status: form.status,
          totalAmount: form.totalAmount || null,
          advancePaid: form.advancePaid || null,
          notes: form.notes || null,
          events: form.events,
        };

        if (editingProject) {
          const res = await fetch(`/api/projects/${editingProject.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Failed to update project");
        } else {
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Failed to create project");
        }
      } else {
        const payload = {
          clientName: form.isBlocked ? "Blocked" : form.clientName,
          phone: form.phone || null,
          email: form.email || null,
          eventType: form.isBlocked ? "Blocked" : form.eventType,
          eventDate: form.eventDate,
          venue: form.venue || null,
          notes: form.notes || null,
          status: form.status,
          isBlocked: form.isBlocked,
          blockReason: form.blockReason || null,
          totalAmount: form.totalAmount || null,
          advancePaid: form.advancePaid || null,
        };

        if (editingBooking) {
          const res = await fetch(`/api/bookings/${editingBooking.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Failed to update booking");
        } else {
          const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Failed to create booking");
        }
      }

      closeForm();
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      setFormError("Failed to save. Please check your inputs and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Deletion handlers ──────────────────────────────────────────────────────
  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Delete this function? This will only remove this single event. Continue?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSelectedBooking(null);
      setSelectedDay(null);
      fetchBookings();
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Warning: This will delete the entire Wedding Project and ALL its associated functions. This cannot be undone. Continue?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSelectedBooking(null);
      setSelectedDay(null);
      fetchBookings();
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Bulk Event Form Helpers ───────────────────────────────────────────────
  const addFormEventRow = () => {
    // Pick a default event type suggestion based on selected religion
    const suggestions = RELIGION_PRESETS[form.religion] || [];
    const usedTypes = form.events.map((e) => e.eventType);
    const nextSuggestion = suggestions.find((s) => !usedTypes.includes(s)) || suggestions[0] || "";

    setForm((f) => ({
      ...f,
      events: [...f.events, { eventType: nextSuggestion, eventDate: form.eventDate || "", venue: "", notes: "" }]
    }));
  };

  const removeFormEventRow = (index: number) => {
    setForm((f) => ({
      ...f,
      events: f.events.filter((_, idx) => idx !== index)
    }));
  };

  const updateFormEventField = (index: number, field: string, value: any) => {
    setForm((f) => {
      const updatedEvents = [...f.events];
      updatedEvents[index] = { ...updatedEvents[index], [field]: value };
      return { ...f, events: updatedEvents };
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 min-h-0">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white tracking-wide flex items-center gap-2">
            Booking Calendar
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1 tracking-wider uppercase">
            Manage multi-function wedding projects &amp; shoots
          </p>
        </div>
        <button
          onClick={() => openAddForm()}
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B45A] text-black text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Booking
        </button>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchBookings} className="ml-auto flex items-center gap-1 text-xs hover:text-white transition-colors cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* ── Visual Legend ─────────────────────────────────────────────────── */}
      <div className="bg-[#0D0D0C]/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Event Categories &amp; Color Coding</span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[11px] font-mono text-gray-400">Main Ceremonies (Pheras, Nikah, Jaimala)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
            <span className="text-[11px] font-mono text-gray-400">Pre-Wedding Functions (Haldi, Mehendi, Sangeet)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-[11px] font-mono text-gray-400">Pre-Wedding Shoots</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-[11px] font-mono text-gray-400">Post-Wedding (Reception, Vidaai, Walima)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono text-gray-400">Portraits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-[11px] font-mono text-gray-400">Corporate / Personal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[11px] font-mono text-gray-400">Blocked / Unavailable</span>
          </div>
        </div>
      </div>

      {/* ── Calendar Container ────────────────────────────────────────────── */}
      <div className="bg-[#0F0F0E] border border-amber-500/8 rounded-2xl overflow-hidden">

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/8">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#1A1A19] text-gray-400 hover:text-white transition-all cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-base font-serif font-semibold text-white tracking-wide">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={goToday}
              className="text-[10px] font-mono uppercase tracking-wider text-[#C9A84C] border border-[#C9A84C]/20 hover:border-[#C9A84C]/50 rounded-md px-2.5 py-1 transition-all cursor-pointer"
            >
              Today
            </button>
            {isLoading && <RefreshCw className="w-3.5 h-3.5 text-gray-500 animate-spin" />}
          </div>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#1A1A19] text-gray-400 hover:text-white transition-all cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Name Headers */}
        <div className="grid grid-cols-7 border-b border-amber-500/8">
          {DAY_NAMES.map((d) => (
            <div key={d} className={`py-2.5 text-center text-[10px] font-mono uppercase tracking-widest ${d === "Sun" ? "text-red-400/60" : "text-gray-500"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarCells.map((cell, idx) => {
            const cellYear = cell.currentMonth ? currentYear : (idx < 7 ? currentYear - 1 : currentYear);
            const cellMonth = cell.currentMonth ? currentMonth : (idx < 7 ? 11 : 0);
            const dayBookings = cell.currentMonth
              ? getBookingsForDate(bookings, currentYear, currentMonth, cell.day)
              : [];
            const isSelected = selectedDay?.day === cell.day && cell.currentMonth;
            const todayCell = isToday(currentYear, currentMonth, cell.day) && cell.currentMonth;
            const hasBlocked = dayBookings.some((b) => b.isBlocked);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (cell.currentMonth) {
                    setSelectedDay({ year: currentYear, month: currentMonth, day: cell.day });
                    setSelectedBooking(null);
                  }
                }}
                className={`
                  relative min-h-[90px] md:min-h-[110px] p-1.5 md:p-2 border-b border-r border-amber-500/5
                  transition-all cursor-pointer
                  ${!cell.currentMonth ? "opacity-35 cursor-default" : "hover:bg-[#161615]"}
                  ${isSelected ? "bg-[#C9A84C]/5 border-amber-500/20" : ""}
                  ${hasBlocked && cell.currentMonth ? "bg-red-500/5" : ""}
                `}
              >
                {/* Date number */}
                <div className={`
                  inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1.5 transition-all
                  ${todayCell ? "bg-[#C9A84C] text-black font-bold" : cell.currentMonth ? "text-gray-300 hover:text-white" : "text-gray-600"}
                `}>
                  {cell.day}
                </div>

                {/* Blocked indicator */}
                {hasBlocked && (
                  <div className="absolute top-1.5 right-1.5">
                    <Lock className="w-2.5 h-2.5 text-red-400/70" />
                  </div>
                )}

                {/* Event chips */}
                <div className="flex flex-col gap-1">
                  {dayBookings.slice(0, 3).map((b) => {
                    const c = getEventColors(b);
                    const client = getClientName(b);
                    const label = b.isBlocked ? "Blocked" : `${b.eventType} - ${client}`;
                    
                    return (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                          setSelectedDay({ year: currentYear, month: currentMonth, day: cell.day });
                        }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate border ${c.bg} ${c.text} ${c.border} hover:opacity-80 transition-opacity cursor-pointer`}
                        title={label}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                        <span className="truncate hidden md:block">{label}</span>
                        <span className="truncate md:hidden">{b.isBlocked ? "🔒 Blocked" : b.eventType}</span>
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <span className="text-[9px] font-mono text-gray-500 pl-1 font-semibold">+{dayBookings.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Day Detail Panel ──────────────────────────────────────────────── */}
      {selectedDay && (
        <div className="bg-[#0F0F0E] border border-amber-500/8 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-serif font-semibold text-white">
                {new Date(selectedDay.year, selectedDay.month, selectedDay.day).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {getBookingsForDate(bookings, selectedDay.year, selectedDay.month, selectedDay.day).length === 0
                  ? "No events scheduled"
                  : `${getBookingsForDate(bookings, selectedDay.year, selectedDay.month, selectedDay.day).length} event(s) scheduled`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAddForm(`${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, "0")}-${String(selectedDay.day).padStart(2, "0")}`)}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C9A84C] border border-[#C9A84C]/20 hover:bg-[#C9A84C]/5 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Booking
              </button>
              <button onClick={() => { setSelectedDay(null); setSelectedBooking(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1A19] text-gray-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grouped Bookings */}
          {getGroupedBookings().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/5 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">No bookings on this day.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {getGroupedBookings().map((group, gIdx) => {
                if (group.projectId && group.project) {
                  // Wedding Project Card (Grouping multiple events)
                  const proj = group.project;
                  return (
                    <div key={proj.id} className="border border-[#C9A84C]/15 bg-[#141311] rounded-xl p-4">
                      {/* Project Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-widest font-mono text-[#C9A84C]">Wedding Project</span>
                            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[proj.status] || STATUS_STYLES["pending"]}`}>
                              {proj.status}
                            </span>
                          </div>
                          <h4 className="text-base font-serif font-bold text-white mt-1">
                            {proj.clientName}
                          </h4>
                          <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded mt-1.5 inline-block">
                            Preset: {proj.religion} Wedding
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                          <button
                            onClick={() => openEditProjectForm(proj)}
                            className="flex items-center gap-1.5 text-[11px] font-mono text-[#C9A84C] hover:bg-[#C9A84C]/5 border border-[#C9A84C]/25 rounded-md px-2.5 py-1.5 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit Project
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 text-[11px] font-mono text-red-400 hover:bg-red-500/5 border border-red-500/20 rounded-md px-2.5 py-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Project
                          </button>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400 mb-3.5 bg-[#0F0E0D] p-3 rounded-lg border border-white/5">
                        {proj.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span>{proj.phone}</span>
                          </div>
                        )}
                        {proj.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span className="truncate">{proj.email}</span>
                          </div>
                        )}
                        {(proj.totalAmount || proj.advancePaid) && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <IndianRupee className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span>
                              {proj.advancePaid && `Paid: ₹${proj.advancePaid}`}
                              {proj.advancePaid && proj.totalAmount && " · "}
                              {proj.totalAmount && `Total Contract: ₹${proj.totalAmount}`}
                            </span>
                          </div>
                        )}
                        {proj.notes && (
                          <div className="flex items-start gap-2 sm:col-span-2 mt-1 border-t border-white/5 pt-1.5 text-gray-500">
                            <span className="font-semibold text-gray-400 shrink-0">Notes:</span>
                            <span>{proj.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Group Events for this Project */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Today's Functions:</span>
                        {group.bookings.map((b) => {
                          const c = getEventColors(b);
                          return (
                            <div key={b.id} className={`border rounded-lg p-3 ${c.bg} ${c.border} flex flex-col gap-1.5`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold ${c.text} flex items-center gap-1.5`}>
                                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                                  {b.eventType}
                                </span>
                                <button
                                  onClick={() => handleDeleteBooking(b.id)}
                                  disabled={isDeleting}
                                  className="text-red-400/80 hover:text-red-400 text-xs font-mono transition-colors p-1"
                                  title="Delete this function only"
                                >
                                  Delete Function
                                </button>
                              </div>
                              {b.venue && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                  <span>{b.venue}</span>
                                </div>
                              )}
                              {b.notes && (
                                <p className="text-xs text-gray-500 font-mono pl-5 italic">
                                  "{b.notes}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                } else {
                  // Standalone booking or Blocked Date card
                  const b = group.bookings[0];
                  const c = getEventColors(b);
                  return (
                    <div key={b.id} className={`border rounded-xl p-4 ${c.bg} ${c.border}`}>
                      <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest font-mono text-gray-400">
                              {b.isBlocked ? "Maintenance/Blocked" : "Standalone Shoot"}
                            </span>
                            {!b.isBlocked && (
                              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] || STATUS_STYLES["pending"]}`}>
                                {b.status}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-serif font-bold text-white mt-1">
                            {b.isBlocked ? "Date Blocked" : getClientName(b)}
                          </h4>
                          {!b.isBlocked && (
                            <span className="text-xs text-gray-400 mt-1 block">
                              Type: {b.eventType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditBookingForm(b)}
                            className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            disabled={isDeleting}
                            className="flex items-center justify-center w-7 h-7 text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 rounded-md transition-all cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Standalone details */}
                      <div className="flex flex-col gap-2">
                        {b.isBlocked ? (
                          <div className="flex items-start gap-2 text-xs text-gray-400 font-mono">
                            <Lock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-gray-500 font-bold block uppercase text-[10px]">Reason:</span>
                              {b.blockReason || "No details provided"}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                            {getPhone(b) && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                <span>{getPhone(b)}</span>
                              </div>
                            )}
                            {getEmail(b) && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                <span className="truncate">{getEmail(b)}</span>
                              </div>
                            )}
                            {b.venue && (
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                <span>{b.venue}</span>
                              </div>
                            )}
                            {(getTotalAmount(b) || getAdvancePaid(b)) && (
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <IndianRupee className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                <span>
                                  {getAdvancePaid(b) && `Paid: ₹${getAdvancePaid(b)}`}
                                  {getAdvancePaid(b) && getTotalAmount(b) && " · "}
                                  {getTotalAmount(b) && `Total: ₹${getTotalAmount(b)}`}
                                </span>
                              </div>
                            )}
                            {b.notes && (
                              <div className="flex items-start gap-2 sm:col-span-2 mt-1 border-t border-white/5 pt-1.5 text-gray-500">
                                <Clock className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                                <span>{b.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Booking Form Panel (Slide-in Overlay) ─────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111110] border border-amber-500/10 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/8 bg-[#111110] sticky top-0 z-20">
              <div>
                <h3 className="text-base font-serif font-semibold text-white">
                  {editingProject ? "Edit Wedding Project" : editingBooking ? "Edit Booking" : "Create New Booking"}
                </h3>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">
                  Schedule wedding programs, portrait shoots or block dates
                </p>
              </div>
              <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1A19] text-gray-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-5">

              {/* Form Type Selector (Only visible when creating new) */}
              {!editingProject && !editingBooking && (
                <div className="flex border border-white/5 rounded-xl p-1 bg-[#090908] gap-1">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "project" }))}
                    className={`flex-1 text-center py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${form.type === "project" ? "bg-[#C9A84C] text-black font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    💍 Wedding Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "standalone" }))}
                    className={`flex-1 text-center py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${form.type === "standalone" ? "bg-[#C9A84C] text-black font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    📷 Standalone Shoot
                  </button>
                </div>
              )}

              {/* IF STANDALONE TYPE */}
              {form.type === "standalone" ? (
                <>
                  {/* Block Date Toggle */}
                  {!editingBooking && (
                    <label className="flex items-center gap-3 cursor-pointer group bg-[#161615] p-3 rounded-xl border border-white/5">
                      <div
                        onClick={() => setForm((f) => ({ ...f, isBlocked: !f.isBlocked }))}
                        className={`relative w-10 h-5 rounded-full transition-all cursor-pointer shrink-0 ${form.isBlocked ? "bg-red-500" : "bg-[#2A2A28]"}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isBlocked ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                      <div>
                        <span className="text-sm text-gray-200 font-medium">Block this date</span>
                        <p className="text-[10px] text-gray-500 font-mono">Marks date as unavailable on client contact form</p>
                      </div>
                    </label>
                  )}

                  {form.isBlocked ? (
                    /* Blocked Date Fields */
                    <div className="flex flex-col gap-4 border border-red-500/10 bg-red-500/3 p-4 rounded-xl">
                      <FormField label="Blocked Date *" type="date" value={form.eventDate} onChange={(v) => setForm((f) => ({ ...f, eventDate: v }))} />
                      <FormField label="Reason / Notes" placeholder="e.g., Personal Travel, Maintenance, Holiday" value={form.blockReason} onChange={(v) => setForm((f) => ({ ...f, blockReason: v }))} />
                    </div>
                  ) : (
                    /* Standalone Client Fields */
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Client Name *" placeholder="e.g. Priyanshu Sen" value={form.clientName} onChange={(v) => setForm((f) => ({ ...f, clientName: v }))} />
                        <FormField label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                      </div>
                      <FormField label="Email" placeholder="client@example.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Shoot Type</label>
                          <select
                            value={form.eventType}
                            onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                            className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors cursor-pointer"
                          >
                            {STANDALONE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <FormField label="Date *" type="date" value={form.eventDate} onChange={(v) => setForm((f) => ({ ...f, eventDate: v }))} />
                      </div>

                      <FormField label="Venue / Location" placeholder="e.g. Lodhi Garden, Delhi" value={form.venue} onChange={(v) => setForm((f) => ({ ...f, venue: v }))} />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Total Amount (₹)" placeholder="e.g. 15000" value={form.totalAmount} onChange={(v) => setForm((f) => ({ ...f, totalAmount: v }))} />
                        <FormField label="Advance Paid (₹)" placeholder="e.g. 5000" value={form.advancePaid} onChange={(v) => setForm((f) => ({ ...f, advancePaid: v }))} />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                          className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors cursor-pointer"
                        >
                          {["confirmed", "pending", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Shoot Notes</label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                          placeholder="Themes, gear requirements, client references..."
                          rows={3}
                          className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors resize-none placeholder-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* IF WEDDING PROJECT TYPE (BULK MULTI-FUNCTION) */
                <div className="flex flex-col gap-5">
                  <span className="text-xs uppercase tracking-widest font-mono text-[#C9A84C] border-b border-[#C9A84C]/25 pb-1">Client &amp; Project Info</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Groom &amp; Bride Names *" placeholder="e.g. Priya &amp; Rahul" value={form.clientName} onChange={(v) => setForm((f) => ({ ...f, clientName: v }))} />
                    <FormField label="Contact Phone" placeholder="+91 98765 43210" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Contact Email" placeholder="client@example.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Wedding Tradition *</label>
                      <select
                        value={form.religion}
                        onChange={(e) => setForm((f) => ({ ...f, religion: e.target.value }))}
                        className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors cursor-pointer"
                      >
                        <option value="Hindu">Hindu Wedding Presets</option>
                        <option value="Muslim">Muslim Wedding Presets</option>
                        <option value="Destination">Destination / Common presets</option>
                        <option value="Other">Other / Custom</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField label="Contract Amount (₹)" placeholder="e.g. 150000" value={form.totalAmount} onChange={(v) => setForm((f) => ({ ...f, totalAmount: v }))} />
                    <FormField label="Advance Received (₹)" placeholder="e.g. 50000" value={form.advancePaid} onChange={(v) => setForm((f) => ({ ...f, advancePaid: v }))} />
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Project Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors cursor-pointer"
                      >
                        {["confirmed", "pending", "completed", "cancelled"].map((s) => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Project Level Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Special contract terms, photographer team allocation, deliverables..."
                      rows={2}
                      className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors resize-none placeholder-gray-600"
                    />
                  </div>

                  {/* Bulk functions checklist */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mt-4">
                    <span className="text-xs uppercase tracking-widest font-mono text-[#C9A84C]">Wedding Program Functions</span>
                    <button
                      type="button"
                      onClick={addFormEventRow}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#C9A84C] border border-[#C9A84C]/35 rounded px-2.5 py-1 hover:bg-[#C9A84C]/5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Function
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <datalist id="functions-suggestions">
                      {(RELIGION_PRESETS[form.religion] || []).map((preset) => (
                        <option key={preset} value={preset} />
                      ))}
                    </datalist>

                    {form.events.map((event, index) => (
                      <div key={index} className="bg-[#151413] border border-white/5 rounded-xl p-4 flex flex-col gap-3.5 relative">
                        {/* Remove Row Button */}
                        {form.events.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFormEventRow(index)}
                            className="absolute top-3 right-3 text-red-400 hover:text-red-300 font-mono text-xs p-1"
                            title="Remove Function"
                          >
                            Remove
                          </button>
                        )}

                        <span className="text-[10px] font-mono text-[#C9A84C] font-semibold">Function #{index + 1}</span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Function Name with Suggestions */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Function Name *</label>
                            <input
                              type="text"
                              list="functions-suggestions"
                              placeholder="Select or type (e.g. Haldi, Mehndi)"
                              value={event.eventType}
                              onChange={(e) => updateFormEventField(index, "eventType", e.target.value)}
                              className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors placeholder-gray-600"
                            />
                          </div>

                          <FormField
                            label="Date *"
                            type="date"
                            value={event.eventDate}
                            onChange={(v) => updateFormEventField(index, "eventDate", v)}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            label="Venue / Location"
                            placeholder="e.g. Grand Ballroom, Hyatt Regency"
                            value={event.venue}
                            onChange={(v) => updateFormEventField(index, "venue", v)}
                          />
                          <FormField
                            label="Specific Notes"
                            placeholder="e.g. Lighting crew, drone shoot details"
                            value={event.notes}
                            onChange={(v) => updateFormEventField(index, "notes", v)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 sticky bottom-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t border-amber-500/8 flex items-center justify-end gap-3 bg-[#111110] sticky bottom-0 z-20">
              <button onClick={closeForm} className="text-sm font-mono text-gray-400 hover:text-white border border-[#2A2A28] hover:border-gray-600 rounded-xl px-4 py-2 transition-all cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B45A] disabled:opacity-60 text-black text-sm font-semibold px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/5"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {editingProject ? "Save Project" : editingBooking ? "Save Changes" : "Create Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small reusable FormField ─────────────────────────────────────────────────

function FormField({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono uppercase tracking-wider text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors placeholder-gray-600"
      />
    </div>
  );
}
