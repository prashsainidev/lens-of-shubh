"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Star,
  Check,
  Trash2,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  EyeOff,
  Plus,
  Upload,
  X,
  MessageSquare,
  FileText,
  Edit,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface Testimonial {
  id: string;
  clientName: string;
  rating: number;
  review: string;
  imageUrl?: string | null;
  type: string;
  extraData?: string | null;
  approved: boolean;
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

export default function TestimonialsDashboard() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedTab, setSelectedTab] = useState<"pending" | "approved">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);



  // Screenshot Uploader Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  
  // General screenshot upload
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  
  // Testimonial Type / Platform
  const [reviewType, setReviewType] = useState<string>("standard");
  const [customPlatform, setCustomPlatform] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploaderError, setUploaderError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Testimonial Form States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewType, setEditReviewType] = useState("standard");
  const [editCustomPlatform, setEditCustomPlatform] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [editUploaderError, setEditUploaderError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchTestimonials = useCallback(async () => {
    await Promise.resolve(); // Defer to avoid synchronous setState inside useEffect
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/testimonials?all=true");
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      } else {
        setError(data.error || "Failed to fetch testimonials");
      }
    } catch {
      setError("Failed to connect to backend server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, approved: true } : t))
        );
      } else {
        alert(data.error || "Failed to approve testimonial");
      }
    } catch {
      alert("Failed to approve testimonial due to connection error");
    } finally {
      setActionId(null);
    }
  };

  const handleHide = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, approved: false } : t))
        );
      } else {
        alert(data.error || "Failed to hide testimonial");
      }
    } catch {
      alert("Failed to hide testimonial due to connection error");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial permanently?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(data.error || "Failed to delete testimonial");
      }
    } catch {
      alert("Failed to delete testimonial due to connection error");
    } finally {
      setActionId(null);
    }
  };

  const uploadFileToSupabase = async (fileToUpload: File, folder: string): Promise<string> => {
    const fileExt = fileToUpload.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(filePath, fileToUpload, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase Upload Error: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setUploaderError("Client name is required.");
      return;
    }
    if (!reviewText.trim()) {
      setUploaderError("Review content is required.");
      return;
    }

    setIsUploading(true);
    setUploaderError(null);

    try {
      let finalImageUrl: string | null = null;

      // 1. Upload Screenshot Proof if selected
      if (file) {
        finalImageUrl = await uploadFileToSupabase(file, "uploads");
      }

      // Determine final platform/type string
      const finalType = reviewType === "other" ? (customPlatform.trim() || "other") : reviewType;

      // 2. Post to backend API
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          rating,
          review: reviewText,
          imageUrl: finalImageUrl,
          type: finalType,
          extraData: null,
          approved: true, // Auto-approve since created by admin
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Prepend new approved testimonial directly to local list
        setTestimonials((prev) => [data.testimonial, ...prev]);
        
        // Reset form states
        setClientName("");
        setRating(5);
        setReviewText("");
        setFile(null);
        setImagePreview(null);
        setReviewType("standard");
        setCustomPlatform("");
        setIsAddModalOpen(false);
      } else {
        throw new Error(data.error || "Failed to save testimonial record in database.");
      }
    } catch (err: unknown) {
      console.error("Testimonial upload error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to upload screenshot review.";
      setUploaderError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setEditClientName(t.clientName);
    setEditRating(t.rating);
    setEditReviewText(t.review);
    
    const standardPlatforms = ["standard", "whatsapp", "instagram", "google review", "facebook"];
    if (standardPlatforms.includes(t.type)) {
      setEditReviewType(t.type);
      setEditCustomPlatform("");
    } else {
      setEditReviewType("other");
      setEditCustomPlatform(t.type);
    }
    
    setEditFile(null);
    setEditImagePreview(t.imageUrl || null);
    setEditImageUrl(t.imageUrl || null);
    setEditUploaderError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    if (!editClientName.trim()) {
      setEditUploaderError("Client name is required.");
      return;
    }
    if (!editReviewText.trim()) {
      setEditUploaderError("Review content is required.");
      return;
    }

    setIsEditUploading(true);
    setEditUploaderError(null);

    try {
      let finalImageUrl = editImageUrl;

      if (editFile) {
        finalImageUrl = await uploadFileToSupabase(editFile, "uploads");
      }

      const finalType = editReviewType === "other" ? (editCustomPlatform.trim() || "other") : editReviewType;

      const res = await fetch(`/api/testimonials/${editingTestimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: editClientName,
          rating: editRating,
          review: editReviewText,
          imageUrl: finalImageUrl,
          type: finalType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === editingTestimonial.id ? data.testimonial : t))
        );
        setIsEditModalOpen(false);
      } else {
        throw new Error(data.error || "Failed to update testimonial record.");
      }
    } catch (err: unknown) {
      console.error("Testimonial edit error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to update review details.";
      setEditUploaderError(errMsg);
    } finally {
      setIsEditUploading(false);
    }
  };

  // Filter based on active tab
  const filteredTestimonials = testimonials.filter((t) =>
    selectedTab === "approved" ? t.approved : !t.approved
  );

  return (
    <div className="flex flex-col gap-6 w-full" suppressHydrationWarning>
      {/* Tabs Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 shadow-md gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedTab("pending")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto ${
              selectedTab === "pending"
                ? "bg-[#C9A84C] text-[#0A0A08] font-semibold shadow-md border border-[#C9A84C]"
                : "text-gray-400 hover:text-white bg-[#070706] border border-[#262624] hover:bg-[#151514]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval</span>
            {testimonials.filter((t) => !t.approved).length > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${selectedTab === "pending" ? "bg-black text-[#C9A84C]" : "bg-[#C9A84C] text-[#0A0A08]"}`}>
                {testimonials.filter((t) => !t.approved).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab("approved")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto ${
              selectedTab === "approved"
                ? "bg-[#C9A84C] text-[#0A0A08] font-semibold shadow-md border border-[#C9A84C]"
                : "text-gray-400 hover:text-white bg-[#070706] border border-[#262624] hover:bg-[#151514]"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved</span>
          </button>
        </div>

        <button
          onClick={() => {
            setReviewType("standard");
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-[#0A0A08] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#b08f37] transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Review</span>
        </button>
      </div>

      {/* Testimonials Cards Grid */}
      {isLoading ? (
        <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-6 h-96 animate-pulse" />
      ) : error ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-6 bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-serif mb-2 text-white">Failed to Load Testimonials</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-6">{error}</p>
          <button
            onClick={fetchTestimonials}
            className="flex items-center gap-2 px-4 py-2 border border-[#262624] hover:border-[#C9A84C] rounded-lg text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#C9A84C] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-8 bg-[#111110]/50 border border-amber-500/10 rounded-xl shadow-lg">
          <CheckCircle className="w-10 h-10 text-gray-500/40 mb-3" />
          <h3 className="text-base font-serif mb-1 text-white">No testimonials found</h3>
          <p className="text-xs text-gray-500 max-w-xs">
            {selectedTab === "pending"
              ? "All client reviews have been moderated!"
              : "No approved testimonials to show."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t) => {
            return (
              <div
                key={t.id}
                className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 sm:p-5 md:p-6 flex flex-col justify-between gap-4 hover:border-[#C9A84C]/30 transition-all duration-300 shadow-md relative"
              >
                {/* Card Header: Client Name, Date, Status */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-base font-medium text-white truncate max-w-[150px]">{t.clientName}</h3>
                    <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                      {formatDateTime(t.createdAt)}
                    </span>
                    {/* Badge template */}
                    <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[9px] font-mono font-semibold rounded uppercase tracking-wider ${
                      t.type === "whatsapp" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      t.type === "instagram" || t.type === "instagram_story" || t.type === "instagram_dm" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                      t.type === "google review" || t.type === "google" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      t.type === "facebook" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                      t.type === "standard" ? "bg-gray-500/10 text-gray-400 border border-gray-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {t.type === "whatsapp" && <MessageSquare className="w-2.5 h-2.5" />}
                      {(t.type === "instagram" || t.type === "instagram_story" || t.type === "instagram_dm") && <Instagram className="w-2.5 h-2.5" />}
                      {t.type === "standard" && <FileText className="w-2.5 h-2.5" />}
                      <span>{
                        t.type === "whatsapp" ? "WhatsApp" : 
                        (t.type === "instagram" || t.type === "instagram_story" || t.type === "instagram_dm") ? "Instagram" : 
                        t.type === "google review" ? "Google Review" :
                        t.type === "facebook" ? "Facebook" :
                        t.type === "standard" ? "Standard" : 
                        t.type
                      }</span>
                    </span>
                  </div>
                  
                  {t.approved ? (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-medium rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      Pending
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex gap-0.5 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < t.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-xs text-gray-300 leading-relaxed italic flex-grow line-clamp-4">
                  &ldquo;{t.review}&rdquo;
                </p>



                {/* Actions Footer */}
                <div className="flex gap-2 mt-2 border-t border-[#1C1C1C] pt-4 w-full">
                  {t.approved ? (
                    <button
                      onClick={() => handleHide(t.id)}
                      disabled={actionId === t.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50"
                      title="Hide from public site"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Hide</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(t.id)}
                      disabled={actionId === t.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50"
                      title="Approve to show on public site"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Approve</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEditModal(t)}
                    disabled={actionId === t.id}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    title="Edit Review Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={actionId === t.id}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* --- MANUAL TESTIMONIAL CONFIGURATION MODAL --- */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#111110] border border-amber-500/15 w-full max-w-lg rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-amber-500/5 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9A84C]">
                  Testimonial Configuration
                </span>
                <h3 className="text-2xl font-serif mt-1 text-white">
                  Add Client Review
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg cursor-pointer bg-transparent border-0 outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-5 overflow-y-auto pr-1.5 max-h-[60vh]">
              
              {/* Review Source / Social Platform Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Review Source / Platform</label>
                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value)}
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all cursor-pointer focus:ring-1 focus:ring-[#C9A84C]/10"
                >
                  <option value="standard" className="bg-[#111110] text-[#fafaf8]">Standard Website Review (No Badge)</option>
                  <option value="whatsapp" className="bg-[#111110] text-[#fafaf8]">WhatsApp Message</option>
                  <option value="instagram" className="bg-[#111110] text-[#fafaf8]">Instagram (Story/Post/DM)</option>
                  <option value="google review" className="bg-[#111110] text-[#fafaf8]">Google Review</option>
                  <option value="facebook" className="bg-[#111110] text-[#fafaf8]">Facebook</option>
                  <option value="other" className="bg-[#111110] text-[#fafaf8]">Other Social Media</option>
                </select>
              </div>

              {/* Custom Platform Input (Only shown if "Other" is selected) */}
              {reviewType === "other" && (
                <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Custom Platform Name</label>
                  <input
                    type="text"
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    placeholder="e.g. WeddingWire, Pinterest, Email"
                    className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                    required
                  />
                </div>
              )}

              {/* Client Name Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Client Name / Identifier</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Arhum & Kashish"
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                  required
                />
              </div>

              {/* Star Rating selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Rating Stars</label>
                <div className="flex gap-1.5 text-[#C9A84C] py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer bg-transparent border-0 p-0 text-[#C9A84C] hover:scale-110 transition-transform"
                      title={`${star} Stars`}
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-700"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Review Text Transcription */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Review Content / Message Text</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Paste review or message content here..."
                  rows={4}
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all resize-none focus:ring-1 focus:ring-[#C9A84C]/10"
                  required
                />
              </div>

              {/* Upload Screenshot Proof */}
              <div className="flex flex-col gap-2 border-t border-amber-500/5 pt-4">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
                  Upload Screenshot Proof (Optional)
                </label>
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-500/10 hover:border-[#C9A84C]/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#070706] hover:bg-[#070706]/85 transition-all group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const selectedFile = e.target.files[0];
                          setFile(selectedFile);
                          setImagePreview(URL.createObjectURL(selectedFile));
                          setUploaderError(null);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-600 group-hover:text-[#C9A84C] transition-colors mb-2" />
                    <span className="text-xs text-gray-300 font-medium">Click to upload or drag & drop</span>
                    <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP formats</span>
                  </div>
                ) : (
                  <div className="relative bg-[#070706] border border-amber-500/5 rounded-xl overflow-hidden p-2 flex flex-col gap-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#262624] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Screenshot Preview" className="max-w-full max-h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setImagePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors cursor-pointer border-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback errors */}
              {uploaderError && (
                <div className="flex gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploaderError}</span>
                </div>
              )}

              {/* Modal footer / Actions */}
              <div className="flex justify-end gap-3 border-t border-amber-500/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#262624] hover:border-gray-500 rounded-lg text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#C9A84C] text-[#0A0A08] font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-[#b08f37] transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Syncing...</span>
                    </>
                  ) : (
                    <span>Save Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT TESTIMONIAL CONFIGURATION MODAL --- */}
      {isEditModalOpen && editingTestimonial && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-[#111110] border border-amber-500/15 w-full max-w-lg rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-amber-500/5 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9A84C]">
                  Testimonial Editor
                </span>
                <h3 className="text-2xl font-serif mt-1 text-white">
                  Edit Client Review
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg cursor-pointer bg-transparent border-0 outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5 overflow-y-auto pr-1.5 max-h-[60vh]">
              
              {/* Review Source / Social Platform Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Review Source / Platform</label>
                <select
                  value={editReviewType}
                  onChange={(e) => setEditReviewType(e.target.value)}
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all cursor-pointer focus:ring-1 focus:ring-[#C9A84C]/10"
                >
                  <option value="standard" className="bg-[#111110] text-[#fafaf8]">Standard Website Review (No Badge)</option>
                  <option value="whatsapp" className="bg-[#111110] text-[#fafaf8]">WhatsApp Message</option>
                  <option value="instagram" className="bg-[#111110] text-[#fafaf8]">Instagram (Story/Post/DM)</option>
                  <option value="google review" className="bg-[#111110] text-[#fafaf8]">Google Review</option>
                  <option value="facebook" className="bg-[#111110] text-[#fafaf8]">Facebook</option>
                  <option value="other" className="bg-[#111110] text-[#fafaf8]">Other Social Media</option>
                </select>
              </div>

              {/* Custom Platform Input (Only shown if "Other" is selected) */}
              {editReviewType === "other" && (
                <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Custom Platform Name</label>
                  <input
                    type="text"
                    value={editCustomPlatform}
                    onChange={(e) => setEditCustomPlatform(e.target.value)}
                    placeholder="e.g. WeddingWire, Pinterest, Email"
                    className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                    required
                  />
                </div>
              )}

              {/* Client Name Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Client Name / Identifier</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  placeholder="e.g. Arhum & Kashish"
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                  required
                />
              </div>

              {/* Star Rating selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Rating Stars</label>
                <div className="flex gap-1.5 text-[#C9A84C] py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="cursor-pointer bg-transparent border-0 p-0 text-[#C9A84C] hover:scale-110 transition-transform"
                      title={`${star} Stars`}
                    >
                      <Star className={`w-6 h-6 ${star <= editRating ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-700"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Review Text Transcription */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Review Content / Message Text</label>
                <textarea
                  value={editReviewText}
                  onChange={(e) => setEditReviewText(e.target.value)}
                  placeholder="Paste review or message content here..."
                  rows={4}
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all resize-none focus:ring-1 focus:ring-[#C9A84C]/10"
                  required
                />
              </div>

              {/* Upload Screenshot Proof */}
              <div className="flex flex-col gap-2 border-t border-amber-500/5 pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
                    Screenshot Proof
                  </label>
                  {editImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditFile(null);
                        setEditImagePreview(null);
                        setEditImageUrl(null);
                      }}
                      className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors bg-transparent border-0 outline-none cursor-pointer"
                    >
                      Remove Existing
                    </button>
                  )}
                </div>
                {!editImagePreview ? (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-500/10 hover:border-[#C9A84C]/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#070706] hover:bg-[#070706]/85 transition-all group"
                  >
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const selectedFile = e.target.files[0];
                          setEditFile(selectedFile);
                          setEditImagePreview(URL.createObjectURL(selectedFile));
                          setEditUploaderError(null);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-600 group-hover:text-[#C9A84C] transition-colors mb-2" />
                    <span className="text-xs text-gray-300 font-medium">Click to upload or drag & drop</span>
                    <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP formats</span>
                  </div>
                ) : (
                  <div className="relative bg-[#070706] border border-amber-500/5 rounded-xl overflow-hidden p-2 flex flex-col gap-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#262624] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editImagePreview} alt="Screenshot Preview" className="max-w-full max-h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditFile(null);
                          setEditImagePreview(null);
                          setEditImageUrl(null);
                          if (editFileInputRef.current) {
                            editFileInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors cursor-pointer border-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback errors */}
              {editUploaderError && (
                <div className="flex gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editUploaderError}</span>
                </div>
              )}

              {/* Modal footer / Actions */}
              <div className="flex justify-end gap-3 border-t border-amber-500/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#262624] hover:border-gray-500 rounded-lg text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditUploading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#C9A84C] text-[#0A0A08] font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-[#b08f37] transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {isEditUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Syncing...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
