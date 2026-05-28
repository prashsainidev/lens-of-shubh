"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  BellRing,
  Clock,
  Images,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface OverviewStats {
  totalInquiries: number;
  newInquiries: number;
  pendingTestimonials: number;
  portfolioItems: number;
}

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

interface Testimonial {
  id: string;
  clientName: string;
  rating: number;
  review: string;
  imageUrl?: string | null;
  approved: boolean;
  createdAt: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentPendingTestimonials, setRecentPendingTestimonials] = useState<Testimonial[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const fetchOverviewData = useCallback(async () => {
    await Promise.resolve(); // Defer to microtask queue to avoid synchronous setState warning inside useEffect
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentInquiries(data.recentInquiries);
        setRecentPendingTestimonials(data.recentPendingTestimonials);
      } else {
        setError(data.error || "Failed to load metrics");
      }
    } catch {
      setError("Server connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleApproveTestimonial = async (id: string) => {
    setModeratingId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      const data = await res.json();
      if (data.success) {
        // Remove from list and update metrics
        setRecentPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
        if (stats) {
          setStats({
            ...stats,
            pendingTestimonials: Math.max(0, stats.pendingTestimonials - 1),
          });
        }
      } else {
        alert(data.error || "Failed to approve testimonial");
      }
    } catch {
      alert("Failed to connect to authentication server");
    } finally {
      setModeratingId(null);
    }
  };

  // Status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            new
          </span>
        );
      case "read":
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 uppercase tracking-wider">
            read
          </span>
        );
      case "replied":
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            replied
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full">
        {/* Shimmer stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#262626] rounded-xl p-6 flex items-center justify-between animate-pulse"
            >
              <div className="flex flex-col gap-3">
                <div className="h-3 w-24 bg-gray-800 rounded" />
                <div className="h-8 w-12 bg-gray-800 rounded" />
                <div className="h-3 w-32 bg-gray-800 rounded" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-800" />
            </div>
          ))}
        </div>

        {/* Shimmer sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#111111] border border-[#262626] rounded-xl p-6 h-96 animate-pulse" />
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6 bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-serif mb-2 text-white">Failed to Load Dashboard</h3>
        <p className="text-sm text-gray-400 max-w-sm mb-6">{error}</p>
        <button
          onClick={fetchOverviewData}
          className="flex items-center gap-2 px-4 py-2 border border-[#262624] hover:border-[#C9A84C] rounded-lg text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#C9A84C] transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      {/* --- SECTION 1: SUMMARY STATS CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Total Inquiries */}
        <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 md:p-6 flex items-center justify-between hover:border-[#C9A84C]/30 transition-all duration-300 shadow-md group">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] md:text-[10px] tracking-wider text-gray-400 uppercase font-semibold">
              Total Inquiries
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-serif text-[#FAFAF8] font-semibold tracking-wide">
              {stats?.totalInquiries || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-500 font-light">Total leads recorded</span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C9A84C]/5 border border-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] shrink-0 group-hover:scale-105 transition-all">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* New Inquiries */}
        <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 md:p-6 flex items-center justify-between hover:border-[#C9A84C]/30 transition-all duration-300 shadow-md group">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] md:text-[10px] tracking-wider text-gray-400 uppercase font-semibold">
              New Inquiries
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-serif text-[#C9A84C] font-semibold tracking-wide">
              {stats?.newInquiries || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-500 font-light">Requires action</span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] shrink-0 group-hover:scale-105 transition-all">
            <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Pending reviews */}
        <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 md:p-6 flex items-center justify-between hover:border-[#C9A84C]/30 transition-all duration-300 shadow-md group">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] md:text-[10px] tracking-wider text-gray-400 uppercase font-semibold">
              Pending Reviews
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-serif text-amber-500 font-semibold tracking-wide">
              {stats?.pendingTestimonials || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-500 font-light">To moderate</span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-all">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Portfolio Items */}
        <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 md:p-6 flex items-center justify-between hover:border-[#C9A84C]/30 transition-all duration-300 shadow-md group">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] md:text-[10px] tracking-wider text-gray-400 uppercase font-semibold">
              Portfolio Items
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-serif text-[#FAFAF8] font-semibold tracking-wide">
              {stats?.portfolioItems || 0}
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-500 font-light">Live showcase assets</span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C9A84C]/5 border border-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] shrink-0 group-hover:scale-105 transition-all">
            <Images className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* --- LOWER ROW: RECENT INQUIRIES & PENDING TESTIMONIALS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* --- SECTION 2: RECENT INQUIRIES --- */}
        <div className="lg:col-span-2 bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif tracking-wide text-white">Recent Inquiries</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-light">Latest booking inquiries from contact form</p>
              </div>
              <Link
                href="/dashboard/inquiries"
                className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#C9A84C] hover:text-amber-500 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-amber-500/10 rounded-xl text-gray-500">
                <p className="text-xs">No recent inquiries yet</p>
              </div>
            ) : (
              <div className="w-full">
                {/* Desktop/Tablet Table View */}
                <div className="hidden sm:block overflow-x-auto w-full">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-amber-500/5 text-gray-500 font-mono text-[9px] tracking-wider uppercase">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold hidden md:table-cell">Email</th>
                        <th className="pb-3 font-semibold">Event Type</th>
                        <th className="pb-3 font-semibold hidden md:table-cell">Date</th>
                        <th className="pb-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInquiries.map((inq) => (
                        <tr
                          key={inq.id}
                          className="border-b border-amber-500/5 last:border-0 hover:bg-[#C9A84C]/5 transition-colors"
                        >
                          <td className="py-3.5 font-medium text-white max-w-[140px] truncate flex items-center gap-2">
                            {inq.status === "new" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse shrink-0" />
                            )}
                            {inq.name}
                          </td>
                          <td className="py-3.5 text-gray-400 max-w-[160px] truncate hidden md:table-cell">{inq.email}</td>
                          <td className="py-3.5 text-gray-300">{inq.eventType || "Other"}</td>
                          <td className="py-3.5 text-gray-400 font-mono text-xs hidden md:table-cell">
                            {inq.eventDate
                              ? new Date(inq.eventDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Flexible"}
                          </td>
                          <td className="py-3.5 text-right">{getStatusBadge(inq.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Card List View */}
                <div className="sm:hidden flex flex-col gap-3">
                  {recentInquiries.map((inq) => (
                    <div key={inq.id} className="p-3 bg-[#070706] border border-amber-500/5 rounded-lg flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                          {inq.status === "new" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                          )}
                          {inq.name}
                        </span>
                        {getStatusBadge(inq.status)}
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>{inq.eventType || "Other"}</span>
                        {inq.eventDate && (
                          <span>
                            {new Date(inq.eventDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- SECTION 3: PENDING TESTIMONIALS --- */}
        <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif tracking-wide text-white">Pending Approval</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-light">Client reviews waiting to go live</p>
              </div>
              <Link
                href="/dashboard/testimonials"
                className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#C9A84C] hover:text-amber-500 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            {recentPendingTestimonials.length === 0 ? (
              <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-amber-500/10 rounded-xl text-gray-500">
                <CheckCircle className="w-8 h-8 text-[#C9A84C]/45 mb-2" />
                <p className="text-xs">Moderation queue empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recentPendingTestimonials.map((t) => (
                  <div
                    key={t.id}
                    className="border border-amber-500/5 rounded-xl p-4 bg-[#070706] flex flex-col gap-3 shadow-sm hover:border-amber-500/15 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-semibold text-white">{t.clientName}</h4>
                        <div className="flex gap-0.5 text-[#C9A84C] text-[10px] mt-1">
                          {Array.from({ length: t.rating }).map((_, idx) => (
                            <span key={idx}>★</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleApproveTestimonial(t.id)}
                        disabled={moderatingId === t.id}
                        className="px-2.5 py-1 text-[9px] font-mono font-medium rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 hover:bg-[#C9A84C]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        suppressHydrationWarning
                      >
                        {moderatingId === t.id ? "..." : "Approve"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed italic font-light">
                      &ldquo;{t.review}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

