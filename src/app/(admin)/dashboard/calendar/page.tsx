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
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  clientName: string;
  phone?: string | null;
  email?: string | null;
  eventType: string;
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

type ViewMode = "month" | "week";

// ─── Config ───────────────────────────────────────────────────────────────────

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Wedding:       { bg: "bg-amber-500/15",   text: "text-amber-300",   border: "border-amber-500/30",  dot: "bg-amber-400"   },
  "Pre-Wedding": { bg: "bg-teal-500/15",    text: "text-teal-300",    border: "border-teal-500/30",   dot: "bg-teal-400"    },
  Portrait:      { bg: "bg-purple-500/15",  text: "text-purple-300",  border: "border-purple-500/30", dot: "bg-purple-400"  },
  Corporate:     { bg: "bg-blue-500/15",    text: "text-blue-300",    border: "border-blue-500/30",   dot: "bg-blue-400"    },
  Personal:      { bg: "bg-green-500/15",   text: "text-green-300",   border: "border-green-500/30",  dot: "bg-green-400"   },
  Blocked:       { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/30",    dot: "bg-red-500"     },
};

const STATUS_STYLES: Record<string, string> = {
  confirmed:  "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  pending:    "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  completed:  "bg-green-500/15 text-green-300 border border-green-500/30",
  cancelled:  "bg-red-500/15 text-red-400 border border-red-500/30",
};

const EVENT_TYPES = ["Wedding", "Pre-Wedding", "Portrait", "Corporate", "Personal"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

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

// ─── Blank form state ─────────────────────────────────────────────────────────

const BLANK_FORM = {
  clientName: "",
  phone: "",
  email: "",
  eventType: "Wedding",
  eventDate: "",
  venue: "",
  notes: "",
  status: "confirmed",
  isBlocked: false,
  blockReason: "",
  totalAmount: "",
  advancePaid: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [viewMode] = useState<ViewMode>("month");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Panels
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form state
  const [form, setForm] = useState(BLANK_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Fetch bookings for current month ──────────────────────────────────────
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

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
    setSelectedBooking(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
    setSelectedBooking(null);
  };
  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(null);
    setSelectedBooking(null);
  };

  // ── Calendar grid data ────────────────────────────────────────────────────
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

  // ── Form handlers ─────────────────────────────────────────────────────────
  const openAddForm = (prefillDate?: string) => {
    setEditingBooking(null);
    setForm({ ...BLANK_FORM, eventDate: prefillDate || "" });
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (booking: Booking) => {
    setEditingBooking(booking);
    setForm({
      clientName:  booking.clientName,
      phone:       booking.phone || "",
      email:       booking.email || "",
      eventType:   booking.eventType,
      eventDate:   toInputDate(booking.eventDate),
      venue:       booking.venue || "",
      notes:       booking.notes || "",
      status:      booking.status,
      isBlocked:   booking.isBlocked,
      blockReason: booking.blockReason || "",
      totalAmount: booking.totalAmount || "",
      advancePaid: booking.advancePaid || "",
    });
    setFormError(null);
    setShowForm(true);
    setSelectedBooking(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBooking(null);
    setForm(BLANK_FORM);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!form.eventDate) { setFormError("Please select a date."); return; }
    if (!form.isBlocked && !form.clientName.trim()) { setFormError("Client name is required."); return; }

    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        clientName: form.isBlocked ? "Blocked" : form.clientName,
        phone: form.phone || null,
        email: form.email || null,
        venue: form.venue || null,
        notes: form.notes || null,
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
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
      }
      closeForm();
      fetchBookings();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      setSelectedBooking(null);
      setSelectedDay(null);
      fetchBookings();
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 min-h-0">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-white tracking-wide">
            Booking Calendar
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1 tracking-wider uppercase">
            Manage shoots, events &amp; blocked dates
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

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_COLORS).map(([type, c]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{type}</span>
          </div>
        ))}
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
                  relative min-h-[80px] md:min-h-[96px] p-1.5 md:p-2 border-b border-r border-amber-500/5
                  transition-all cursor-pointer
                  ${!cell.currentMonth ? "opacity-30 cursor-default" : "hover:bg-[#161615]"}
                  ${isSelected ? "bg-[#C9A84C]/5 border-amber-500/20" : ""}
                  ${hasBlocked && cell.currentMonth ? "bg-red-500/3" : ""}
                `}
              >
                {/* Date number */}
                <div className={`
                  inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 transition-all
                  ${todayCell ? "bg-[#C9A84C] text-black font-bold" : cell.currentMonth ? "text-gray-300 hover:text-white" : "text-gray-600"}
                `}>
                  {cell.day}
                </div>

                {/* Blocked indicator */}
                {hasBlocked && (
                  <div className="absolute top-1 right-1">
                    <Lock className="w-2.5 h-2.5 text-red-400/70" />
                  </div>
                )}

                {/* Event chips */}
                <div className="flex flex-col gap-0.5">
                  {dayBookings.slice(0, 2).map((b) => {
                    const colorKey = b.isBlocked ? "Blocked" : b.eventType;
                    const c = EVENT_COLORS[colorKey] || EVENT_COLORS["Personal"];
                    return (
                      <div
                        key={b.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); setSelectedDay({ year: currentYear, month: currentMonth, day: cell.day }); }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate border ${c.bg} ${c.text} ${c.border} hover:opacity-80 transition-opacity cursor-pointer`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                        <span className="truncate hidden md:block">{b.isBlocked ? "Blocked" : b.clientName}</span>
                        <span className="truncate md:hidden">{b.isBlocked ? "🔒" : b.clientName.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                  {dayBookings.length > 2 && (
                    <span className="text-[9px] font-mono text-gray-500 pl-1">+{dayBookings.length - 2} more</span>
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
          <div className="flex items-center justify-between mb-4">
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
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <button onClick={() => { setSelectedDay(null); setSelectedBooking(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1A19] text-gray-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bookings for selected day */}
          {getBookingsForDate(bookings, selectedDay.year, selectedDay.month, selectedDay.day).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="w-8 h-8 text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">No bookings on this day.</p>
              <button
                onClick={() => openAddForm(`${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, "0")}-${String(selectedDay.day).padStart(2, "0")}`)}
                className="mt-3 text-xs text-[#C9A84C] hover:underline cursor-pointer"
              >
                + Add a booking
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {getBookingsForDate(bookings, selectedDay.year, selectedDay.month, selectedDay.day).map((b) => {
                const colorKey = b.isBlocked ? "Blocked" : b.eventType;
                const c = EVENT_COLORS[colorKey] || EVENT_COLORS["Personal"];
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(selectedBooking?.id === b.id ? null : b)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:border-amber-500/20 ${c.bg} ${c.border} ${selectedBooking?.id === b.id ? "ring-1 ring-amber-500/30" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <span className={`text-sm font-semibold ${c.text}`}>
                          {b.isBlocked ? "Blocked Date" : b.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!b.isBlocked && (
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] || STATUS_STYLES["pending"]}`}>
                            {b.status}
                          </span>
                        )}
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                          {b.isBlocked ? "Blocked" : b.eventType}
                        </span>
                      </div>
                    </div>

                    {/* Expanded detail view */}
                    {selectedBooking?.id === b.id && (
                      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {b.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                        {b.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span className="truncate">{b.email}</span>
                          </div>
                        )}
                        {b.venue && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span>{b.venue}</span>
                          </div>
                        )}
                        {b.isBlocked && b.blockReason && (
                          <div className="flex items-center gap-2 text-xs text-gray-400 sm:col-span-2">
                            <Lock className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span>{b.blockReason}</span>
                          </div>
                        )}
                        {(b.totalAmount || b.advancePaid) && (
                          <div className="flex items-center gap-2 text-xs text-gray-400 sm:col-span-2">
                            <IndianRupee className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <span>
                              {b.advancePaid && `Advance: ₹${b.advancePaid}`}
                              {b.advancePaid && b.totalAmount && " · "}
                              {b.totalAmount && `Total: ₹${b.totalAmount}`}
                            </span>
                          </div>
                        )}
                        {b.notes && (
                          <div className="flex items-start gap-2 text-xs text-gray-400 sm:col-span-2">
                            <Clock className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                            <span>{b.notes}</span>
                          </div>
                        )}
                        {/* Actions */}
                        <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditForm(b); }}
                            className="flex items-center gap-1.5 text-xs font-mono text-[#C9A84C] border border-[#C9A84C]/20 hover:bg-[#C9A84C]/5 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 text-xs font-mono text-red-400 border border-red-500/20 hover:bg-red-500/5 rounded-lg px-3 py-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Booking Form Panel (Slide-in Overlay) ─────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111110] border border-amber-500/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/8 sticky top-0 bg-[#111110] z-10">
              <div>
                <h3 className="text-base font-serif font-semibold text-white">
                  {editingBooking ? "Edit Booking" : "Add New Booking"}
                </h3>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">
                  {editingBooking ? "Update booking details" : "Schedule a new shoot or block a date"}
                </p>
              </div>
              <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1A19] text-gray-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Block Date Toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setForm((f) => ({ ...f, isBlocked: !f.isBlocked }))}
                  className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${form.isBlocked ? "bg-red-500" : "bg-[#2A2A28]"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isBlocked ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <div>
                  <span className="text-sm text-gray-200 font-medium">Block this date</span>
                  <p className="text-[10px] text-gray-500 font-mono">Marks date as unavailable (vacation/personal)</p>
                </div>
              </label>

              {form.isBlocked ? (
                /* Block date fields */
                <>
                  <FormField label="Date *" type="date" value={form.eventDate} onChange={(v) => setForm((f) => ({ ...f, eventDate: v }))} />
                  <FormField label="Reason (optional)" placeholder="e.g. Personal travel, Family event" value={form.blockReason} onChange={(v) => setForm((f) => ({ ...f, blockReason: v }))} />
                </>
              ) : (
                /* Full booking fields */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Client Name *" placeholder="e.g. Rahul & Priya" value={form.clientName} onChange={(v) => setForm((f) => ({ ...f, clientName: v }))} />
                    <FormField label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                  </div>
                  <FormField label="Email" placeholder="client@example.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Event Type Select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Event Type</label>
                      <select
                        value={form.eventType}
                        onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                        className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors cursor-pointer"
                      >
                        {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <FormField label="Date *" type="date" value={form.eventDate} onChange={(v) => setForm((f) => ({ ...f, eventDate: v }))} />
                  </div>
                  <FormField label="Venue / Location" placeholder="e.g. The Leela Palace, Delhi" value={form.venue} onChange={(v) => setForm((f) => ({ ...f, venue: v }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Total Amount (₹)" placeholder="e.g. 45000" value={form.totalAmount} onChange={(v) => setForm((f) => ({ ...f, totalAmount: v }))} />
                    <FormField label="Advance Paid (₹)" placeholder="e.g. 10000" value={form.advancePaid} onChange={(v) => setForm((f) => ({ ...f, advancePaid: v }))} />
                  </div>
                  {/* Status Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors cursor-pointer"
                    >
                      {["confirmed", "pending", "completed", "cancelled"].map((s) => (
                        <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Additional details, special requests..."
                      rows={3}
                      className="bg-[#1A1A19] border border-amber-500/10 text-gray-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/30 transition-colors resize-none placeholder-gray-600"
                    />
                  </div>
                </>
              )}

              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t border-amber-500/8 flex items-center justify-end gap-3 sticky bottom-0 bg-[#111110]">
              <button onClick={closeForm} className="text-sm font-mono text-gray-400 hover:text-white border border-[#2A2A28] hover:border-gray-600 rounded-xl px-4 py-2 transition-all cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B45A] disabled:opacity-60 text-black text-sm font-semibold px-5 py-2 rounded-xl transition-all cursor-pointer"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {editingBooking ? "Save Changes" : "Create Booking"}
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
