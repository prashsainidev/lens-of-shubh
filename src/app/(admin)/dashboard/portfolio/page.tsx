"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Upload,
  Trash2,
  AlertCircle,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  CheckCircle,
  X,
  Star,
  Edit2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

const CATEGORIES = ["Wedding", "Portrait", "Pre Wedding", "Cinematic", "Events"];

export default function PortfolioDashboard() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wedding");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit State
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Wedding");
  const [editDescription, setEditDescription] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchPortfolioItems = useCallback(async () => {
    await Promise.resolve(); // Defer to avoid synchronous setState inside useEffect
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (data.success) {
        setItems(data.portfolio);
      } else {
        setError(data.error || "Failed to load portfolio items");
      }
    } catch {
      setError("Failed to connect to backend server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPortfolioItems();
  }, [fetchPortfolioItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setSubmitError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
        setSubmitError(null);
      } else {
        setSubmitError("Please drop an image file.");
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError("Title is required.");
      return;
    }
    if (!file) {
      setSubmitError("Please select an image to upload.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, file, {
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Supabase Storage Upload Error: ${uploadError.message}`);
      }

      // 2. Fetch the Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);

      // 3. Post Metadata to DB API
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          imageUrl: publicUrl,
          category,
          featured,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        // Prepend to items list
        setItems((prev) => [data.item, ...prev]);
        // Reset form fields
        setTitle("");
        setDescription("");
        setFeatured(false);
        setFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(data.error || "Failed to save portfolio metadata");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errMsg = err instanceof Error ? err.message : "Upload failed due to database or storage error";
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this portfolio item permanently?")) return;

    try {
      // 1. Delete from DB API
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        // 2. Attempt to delete from Supabase storage as well (optional helper)
        try {
          // Parse storage file path from URL
          // Typically looks like: .../storage/v1/object/public/portfolio-images/uploads/filename.ext
          const urlParts = imageUrl.split("portfolio-images/");
          if (urlParts.length > 1) {
            const storagePath = decodeURIComponent(urlParts[1]);
            await supabase.storage.from("portfolio-images").remove([storagePath]);
          }
        } catch (storageErr) {
          console.warn("Storage deletion warning:", storageErr);
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.error || "Failed to delete portfolio item");
      }
    } catch {
      alert("Failed to delete portfolio item due to connection error");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, featured: nextFeatured } : item))
        );
      } else {
        alert(data.error || "Failed to update featured status");
      }
    } catch {
      alert("Failed to update featured status due to connection error");
    }
  };

  const handleStartEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditDescription(item.description || "");
    setEditFeatured(item.featured);
    setEditFile(null);
    setEditImagePreview(item.imageUrl);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editTitle.trim()) {
      setEditError("Title is required.");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      let finalImageUrl = editingItem.imageUrl;

      if (editFile) {
        const fileExt = editFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio-images")
          .upload(filePath, editFile, {
            cacheControl: "31536000",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Supabase Storage Upload Error: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);

        finalImageUrl = publicUrl;

        try {
          const urlParts = editingItem.imageUrl.split("portfolio-images/");
          if (urlParts.length > 1) {
            const oldStoragePath = decodeURIComponent(urlParts[1]);
            await supabase.storage.from("portfolio-images").remove([oldStoragePath]);
          }
        } catch (storageErr) {
          console.warn("Storage deletion warning for old image:", storageErr);
        }
      }

      const res = await fetch(`/api/portfolio/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          category: editCategory,
          imageUrl: finalImageUrl,
          featured: editFeatured,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? data.item : item))
        );
        setEditingItem(null);
      } else {
        throw new Error(data.error || "Failed to save portfolio item modifications");
      }
    } catch (err: unknown) {
      console.error("Save edit error:", err);
      const errMsg = err instanceof Error ? err.message : "Saving edit failed due to database or storage error";
      setEditError(errMsg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
      {/* --- LEFT COLUMN: UPLOAD FORM CARD --- */}
      <div className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-6 shadow-xl lg:sticky lg:top-24 animate-pulse-border">
        <div className="border-b border-amber-500/5 pb-4 mb-6">
          <h2 className="text-xl font-serif text-white tracking-wide">Upload Masterpiece</h2>
          <p className="text-xs text-gray-500 mt-1 font-light">Publish new photos/videos to the portfolio showcase</p>
        </div>

        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5" suppressHydrationWarning>
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wedding of Rohan & Priya"
              className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
              required
              suppressHydrationWarning
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all cursor-pointer focus:ring-1 focus:ring-[#C9A84C]/10"
              suppressHydrationWarning
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#111110] text-[#fafaf8]" suppressHydrationWarning>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the shoot location, camera, details..."
              rows={3}
              className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all resize-none focus:ring-1 focus:ring-[#C9A84C]/10"
              suppressHydrationWarning
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3 bg-[#070706] border border-[#262624] rounded-lg p-3" suppressHydrationWarning>
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#C9A84C] bg-black border-[#262624] rounded cursor-pointer"
              suppressHydrationWarning
            />
            <label htmlFor="featured" className="text-xs text-gray-300 select-none cursor-pointer flex-1">
              <strong className="text-white">Featured Item</strong>
              <span className="block text-[10px] text-gray-500 mt-0.5">Showcase on the homepage highlight slider</span>
            </label>
          </div>

          {/* Image Drag & Drop File Uploader */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Image Asset</label>
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-500/10 hover:border-[#C9A84C]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#070706] hover:bg-[#070706]/85 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-600 group-hover:text-[#C9A84C] transition-colors mb-3" />
                <span className="text-xs text-gray-300 font-medium">Click to upload or drag & drop</span>
                <span className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, WEBP formats</span>
              </div>
            ) : (
              <div className="relative bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden p-2 flex flex-col gap-2">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-[#1A1A1A] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Upload Preview" className="max-w-full max-h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono text-gray-500 truncate max-w-[200px]">
                    {file?.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback alerts */}
          {submitError && (
            <div className="flex gap-2.5 items-start bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="flex gap-2.5 items-start bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3.5 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Asset uploaded successfully and live in the portfolio gallery!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#C9A84C] text-[#0A0A08] font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-[#b08f37] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            suppressHydrationWarning
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading Asset & Saving...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Item</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* --- RIGHT COLUMN: PORTFOLIO SHOWCASE GRID --- */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 shadow-md">
          <div>
            <h3 className="text-lg font-serif text-white">Portfolio Gallery ({items.length})</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-light">Manage live photos and videos catalog</p>
          </div>
          <button
            onClick={fetchPortfolioItems}
            className="p-2 border border-amber-500/5 hover:border-[#C9A84C]/30 text-gray-400 hover:text-[#C9A84C] rounded-lg transition-colors cursor-pointer"
            title="Refresh List"
            suppressHydrationWarning
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl aspect-video p-4 animate-pulse flex flex-col justify-end gap-3"
              >
                <div className="h-4 w-2/3 bg-gray-800 rounded" />
                <div className="h-3 w-1/3 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-6 bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-serif mb-2 text-white">Failed to Load Gallery</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">{error}</p>
            <button
              onClick={fetchPortfolioItems}
              className="flex items-center gap-2 px-4 py-2 border border-amber-500/10 hover:border-[#C9A84C] rounded-lg text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#C9A84C] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-8 bg-[#111110]/50 border border-amber-500/10 rounded-xl shadow-lg">
            <ImageIcon className="w-10 h-10 text-gray-500/40 mb-3" />
            <h3 className="text-base font-serif mb-1 text-white">No portfolio items yet</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Upload your first masterpiece using the form on the left to display it live.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl overflow-hidden flex flex-col hover:border-[#C9A84C]/30 transition-all duration-300 shadow-lg group relative"
              >
                {/* Thumbnail Image */}
                <div className="aspect-video relative overflow-hidden bg-[#070706] border-b border-amber-500/5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.featured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-mono font-bold bg-[#C9A84C] text-[#0A0A08] uppercase tracking-wider rounded">
                      Featured
                    </span>
                  )}
                </div>

                {/* Info & Details */}
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2.5 sm:gap-4">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[8px] sm:text-[9px] tracking-wider text-[#C9A84C] uppercase font-semibold">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleToggleFeatured(item.id, item.featured)}
                        className="cursor-pointer bg-transparent border-0 p-0 text-gray-500 hover:text-[#C9A84C] hover:scale-110 transition-all outline-none"
                        title={item.featured ? "Remove from Homepage Highlight" : "Showcase on Homepage Highlight"}
                        suppressHydrationWarning
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            item.featured ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white font-serif tracking-wide truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed font-light">
                        {item.description}
                      </p>
                    )}
                  </div>
 
                  <div className="flex justify-between items-center border-t border-amber-500/5 pt-2.5 sm:pt-3.5">
                    <span className="text-[8px] sm:text-[9px] font-mono text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="flex items-center gap-1 px-2 py-1 border border-amber-500/5 hover:border-[#C9A84C]/50 bg-[#161614] text-gray-300 hover:text-[#C9A84C] rounded-lg text-[9px] font-mono uppercase tracking-wider cursor-pointer transition-colors"
                        title="Edit Asset"
                        suppressHydrationWarning
                      >
                        <Edit2 className="w-3 h-3 text-[#C9A84C]" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.imageUrl)}
                        className="flex items-center gap-1 px-2 py-1 border border-red-500/20 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 rounded-lg text-red-400 text-[9px] font-mono uppercase tracking-wider cursor-pointer transition-colors"
                        title="Delete Asset"
                        suppressHydrationWarning
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* --- EDIT MODAL OVERLAY --- */}
      {editingItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#111110] border border-amber-500/10 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-amber-500/5 pb-4">
              <div>
                <h3 className="text-lg font-serif text-white tracking-wide">Edit Masterpiece</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-light">Modify portfolio details and camera configurations</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4" suppressHydrationWarning>
              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Wedding of Rohan & Priya"
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                  required
                  suppressHydrationWarning
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all cursor-pointer focus:ring-1 focus:ring-[#C9A84C]/10"
                  suppressHydrationWarning
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#111110] text-[#fafaf8]" suppressHydrationWarning>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Description (EXIF Data)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief details about the shoot location, camera, EXIF tags..."
                  rows={3}
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all resize-none focus:ring-1 focus:ring-[#C9A84C]/10"
                  suppressHydrationWarning
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-3 bg-[#070706] border border-[#262624] rounded-lg p-3" suppressHydrationWarning>
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#C9A84C] bg-black border-[#262624] rounded cursor-pointer"
                  suppressHydrationWarning
                />
                <label htmlFor="editFeatured" className="text-xs text-gray-300 select-none cursor-pointer flex-1">
                  <strong className="text-white">Featured Item</strong>
                  <span className="block text-[10px] text-gray-500 mt-0.5">Showcase on the homepage highlight slider</span>
                </label>
              </div>

              {/* Optional New Image upload */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Image Asset (Optional replacement)</label>
                <div className="relative bg-[#070706] border border-[#262624] rounded-xl overflow-hidden p-2 flex flex-col gap-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/5 flex items-center justify-center bg-[#111110]/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editImagePreview || ""} alt="Edit Preview" className="max-w-full max-h-full object-cover" />
                  </div>
                  <div className="flex justify-between items-center gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-2 border border-amber-500/10 hover:border-[#C9A84C]/30 hover:bg-[#070706] text-gray-300 hover:text-white rounded-lg text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
                      suppressHydrationWarning
                    >
                      Choose New Image
                    </button>
                    {editFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditFile(null);
                          setEditImagePreview(editingItem.imageUrl);
                        }}
                        className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer"
                        suppressHydrationWarning
                      >
                        Reset Image
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const selectedFile = e.target.files[0];
                        setEditFile(selectedFile);
                        setEditImagePreview(URL.createObjectURL(selectedFile));
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Feedback Error Alert */}
              {editError && (
                <div className="flex gap-2.5 items-start bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3 justify-end border-t border-amber-500/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-[#262624] hover:border-gray-500 text-gray-400 hover:text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  disabled={isSavingEdit}
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-[#C9A84C] text-[#0A0A08] font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-[#b08f37] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
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
