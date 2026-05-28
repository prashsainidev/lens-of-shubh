"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Phone as PhoneIcon,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle,
} from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  location?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
};

export default function InquiriesDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = useCallback(async () => {
    await Promise.resolve(); // Defer to microtask queue to avoid synchronous setState warning inside useEffect
    setIsLoading(true);
    setError(null);
    try {
      // Build filter param if not 'all'
      const url =
        selectedFilter === "all"
          ? "/api/contact"
          : `/api/contact?status=${selectedFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      } else {
        setError(data.error || "Failed to fetch inquiries");
      }
    } catch {
      setError("Failed to connect to backend server");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local list
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Failed to update inquiry status due to connection error");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry permanently?")) return;
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      } else {
        alert(data.error || "Failed to delete inquiry");
      }
    } catch {
      alert("Failed to delete inquiry due to connection error");
    }
  };

  // Filter local inquiries by search query as well
  const filteredInquiries = inquiries.filter((inq) => {
    const query = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(query) ||
      inq.email.toLowerCase().includes(query) ||
      (inq.phone && inq.phone.includes(query)) ||
      (inq.location && inq.location.toLowerCase().includes(query))
    );
  });

  const getStatusDropdownColor = (status: string) => {
    switch (status) {
      case "new":
        return "border-amber-500/30 text-amber-400 bg-amber-500/5";
      case "read":
        return "border-gray-500/30 text-gray-400 bg-gray-500/5";
      case "replied":
        return "border-emerald-500/30 text-emerald-400 bg-emerald-500/5";
      case "archived":
        return "border-purple-500/30 text-purple-400 bg-purple-500/5";
      default:
        return "border-gray-500/30 text-gray-400 bg-gray-500/5";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 shadow-md">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto flex-nowrap md:flex-wrap gap-1.5 w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {["all", "new", "read", "replied", "archived"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                selectedFilter === filter
                  ? "bg-[#C9A84C] text-[#0A0A08] font-semibold shadow-md border border-[#C9A84C]"
                  : "text-gray-400 hover:text-white bg-[#070706] border border-[#262624] hover:bg-[#151514]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, location..."
            className="w-full bg-[#070706] border border-[#262624] rounded-lg pl-9 pr-4 py-2.5 text-white font-sans text-xs outline-none transition-all focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/10 placeholder:text-gray-600"
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* --- INQUIRIES SHOWCASE SECTION --- */}
      {isLoading ? (
        <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-6 h-96 animate-pulse" />
      ) : error ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-6 bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-serif mb-2 text-white">Failed to Load Inquiries</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-6">{error}</p>
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-2 px-4 py-2 border border-[#262624] hover:border-[#C9A84C] rounded-lg text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#C9A84C] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-8 bg-[#111110]/50 border border-amber-500/10 rounded-xl shadow-lg">
          <CheckCircle className="w-10 h-10 text-gray-500/40 mb-3" />
          <h3 className="text-base font-serif mb-1 text-white">No inquiries found</h3>
          <p className="text-xs text-gray-500 max-w-xs">
            {searchQuery
              ? "Try adjusting your search terms or filters"
              : "Couples submissions queue is completely clear!"}
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-amber-500/5 bg-[#161614]/50 text-gray-400 font-mono text-[10px] tracking-wider uppercase">
                    <th className="p-4 font-medium hidden md:table-cell">Date</th>
                    <th className="p-4 font-medium">Couple</th>
                    <th className="p-4 font-medium hidden md:table-cell">Contact Details</th>
                    <th className="p-4 font-medium">Booking Details</th>
                    <th className="p-4 font-medium hidden md:table-cell">Vision Brief</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      className="border-b border-amber-500/5 last:border-0 hover:bg-[#151514]/30 transition-colors"
                    >
                      {/* Submission Date */}
                      <td className="p-4 font-mono text-xs text-gray-500 hidden md:table-cell">
                        {formatDateTime(inq.createdAt)}
                      </td>

                      {/* Client Name */}
                      <td className="p-4 font-medium text-white font-serif text-base max-w-[140px] truncate">
                        {inq.name}
                      </td>

                      {/* Contact Details */}
                      <td className="p-4 text-xs hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`mailto:${inq.email}`}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#C9A84C]/50" />
                            <span className="truncate max-w-[180px]">{inq.email}</span>
                          </a>
                          {inq.phone && (
                            <a
                              href={`tel:${inq.phone}`}
                              className="flex items-center gap-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                            >
                              <PhoneIcon className="w-3.5 h-3.5 text-[#C9A84C]/50" />
                              <span>{inq.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Booking Details */}
                      <td className="p-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-300 font-medium">{inq.eventType || "Other"}</span>
                          <div className="hidden md:flex items-center gap-2 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="font-mono">
                                {inq.eventDate
                                  ? new Date(inq.eventDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Flexible"}
                              </span>
                            </span>
                            {inq.location && (
                              <span className="flex items-center gap-1 truncate max-w-[120px]">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{inq.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Short Message Text */}
                      <td className="p-4 text-xs text-gray-400 max-w-[200px] truncate italic hidden md:table-cell">
                        &ldquo;{inq.message}&rdquo;
                      </td>

                      {/* Status Dropdown selector */}
                      <td className="p-4">
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                          className={`px-3 py-1.5 text-[10px] font-mono rounded-lg border outline-none font-medium uppercase tracking-wider cursor-pointer transition-colors ${getStatusDropdownColor(
                            inq.status
                          )}`}
                        >
                          <option value="new">new</option>
                          <option value="read">read</option>
                          <option value="replied">replied</option>
                          <option value="archived">archived</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="p-2 border border-[#262624] hover:border-[#C9A84C]/30 rounded-lg text-gray-400 hover:text-[#C9A84C] transition-colors cursor-pointer"
                            title="View Vision Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-2 border border-[#262624] hover:border-red-500/30 rounded-lg text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredInquiries.map((inq) => (
              <div key={inq.id} className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 flex flex-col gap-3 shadow-md">
                {/* Header with Name, Date and Status */}
                <div className="flex justify-between items-start gap-2 border-b border-amber-500/5 pb-3">
                  <div>
                    <h4 className="font-serif text-base text-white font-medium">{inq.name}</h4>
                    <span className="text-[10px] font-mono text-gray-500 mt-0.5 block">
                      {formatDateTime(inq.createdAt)}
                    </span>
                  </div>
                  <select
                    value={inq.status}
                    onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                    className={`px-2 py-1 text-[10px] font-mono rounded-lg border outline-none font-medium uppercase tracking-wider cursor-pointer transition-colors ${getStatusDropdownColor(
                      inq.status
                    )}`}
                  >
                    <option value="new">new</option>
                    <option value="read">read</option>
                    <option value="replied">replied</option>
                    <option value="archived">archived</option>
                  </select>
                </div>

                {/* Booking and Contact Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wide">Event</span>
                    <span className="text-gray-300 font-medium block mt-0.5">{inq.eventType || "Other"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wide">Date</span>
                    <span className="text-gray-300 font-medium block mt-0.5">
                      {inq.eventDate
                        ? new Date(inq.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Flexible"}
                    </span>
                  </div>
                  {inq.location && (
                    <div className="col-span-2">
                      <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wide">Location</span>
                      <span className="text-gray-300 font-medium block mt-0.5">{inq.location}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center border-t border-amber-500/5 pt-3 mt-1">
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${inq.email}`}
                      className="p-2 border border-[#262624] rounded-lg text-gray-400 hover:text-[#C9A84C] transition-colors"
                      title="Email client"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    {inq.phone && (
                      <a
                        href={`tel:${inq.phone}`}
                        className="p-2 border border-[#262624] rounded-lg text-gray-400 hover:text-[#C9A84C] transition-colors"
                        title="Call client"
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedInquiry(inq)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#262624] hover:border-[#C9A84C]/30 rounded-lg text-gray-400 hover:text-[#C9A84C] text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteInquiry(inq.id)}
                      className="p-2 border border-[#262624] hover:border-red-500/30 rounded-lg text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- INQUIRY DETAILS POPUP MODAL --- */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-[#111110] border border-amber-500/15 w-full max-w-lg rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-amber-500/5 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9A84C]">
                  Client Inquiry Details
                </span>
                <h3 className="text-2xl font-serif mt-1 text-white">{selectedInquiry.name}</h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Booking Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1 border-b border-amber-500/5 pb-3">
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wide">Submitted At</span>
                <span className="text-white font-medium">{formatDateTime(selectedInquiry.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-amber-500/5 pb-3">
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wide">Email</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-white font-medium hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>
              <div className="flex flex-col gap-1 border-b border-amber-500/5 pb-3">
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wide">Phone</span>
                {selectedInquiry.phone ? (
                  <a href={`tel:${selectedInquiry.phone}`} className="text-white font-medium hover:underline">
                    {selectedInquiry.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </div>
              <div className="flex flex-col gap-1 border-b border-amber-500/5 pb-3">
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wide">Event Type</span>
                <span className="text-[#C9A84C] font-medium">{selectedInquiry.eventType || "Other"}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-amber-500/5 pb-3">
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wide">Event Date</span>
                <span className="text-white font-medium">
                  {selectedInquiry.eventDate
                    ? new Date(selectedInquiry.eventDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Flexible / To Be Decided"}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2 border-b border-amber-500/5 pb-3">
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wide">Location</span>
                <span className="text-white font-medium">{selectedInquiry.location || "Not specified"}</span>
              </div>
              <div className="flex flex-col gap-2.5 sm:col-span-2">
                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-wide">Client Vision</span>
                <p className="text-gray-300 leading-relaxed italic bg-[#070706] border border-amber-500/5 rounded-xl p-4 max-h-48 overflow-y-auto">
                  &ldquo;{selectedInquiry.message}&rdquo;
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center mt-4 border-t border-amber-500/5 pt-4">
              <select
                value={selectedInquiry.status}
                onChange={(e) => {
                  handleUpdateStatus(selectedInquiry.id, e.target.value);
                  setSelectedInquiry({ ...selectedInquiry, status: e.target.value });
                }}
                className={`px-3 py-1.5 text-[10px] font-mono rounded-lg border outline-none font-medium uppercase tracking-wider cursor-pointer transition-colors ${getStatusDropdownColor(
                  selectedInquiry.status
                )}`}
              >
                <option value="new">new</option>
                <option value="read">read</option>
                <option value="replied">replied</option>
                <option value="archived">archived</option>
              </select>
              <button
                onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
