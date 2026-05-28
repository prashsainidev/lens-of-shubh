"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Edit3,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Sparkles,
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  popular: boolean;
  createdAt: string;
}

export default function ServicesDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null); // null means "Add New" mode

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [popular, setPopular] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    await Promise.resolve(); // Defer to avoid synchronous setState inside useEffect
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      } else {
        setError(data.error || "Failed to load services");
      }
    } catch {
      setError("Failed to connect to backend server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
  }, [fetchServices]);

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description);
    setPrice(service.price);
    setFeatures(service.features.length > 0 ? [...service.features] : [""]);
    setPopular(service.popular);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingService(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setFeatures([""]);
    setPopular(false);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleAddFeatureField = () => {
    setFeatures((prev) => [...prev, ""]);
  };

  const handleRemoveFeatureField = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price.trim()) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    // Filter out empty features
    const cleanedFeatures = features.filter((feat) => feat.trim() !== "");
    if (cleanedFeatures.length === 0) {
      setSubmitError("Please add at least one feature item.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      title,
      description,
      price,
      features: cleanedFeatures,
      popular,
    };

    try {
      if (editingService) {
        // Edit mode (PATCH)
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? data.service : s))
          );
          setIsModalOpen(false);
        } else {
          throw new Error(data.error || "Failed to update package details");
        }
      } else {
        // Create mode (POST)
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) => [data.service, ...prev]);
          setIsModalOpen(false);
        } else {
          throw new Error(data.error || "Failed to create new package");
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Request failed due to connection error";
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing package permanently?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.error || "Failed to delete package");
      }
    } catch {
      alert("Failed to delete package due to connection error");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 shadow-md">
        <div>
          <h2 className="text-xl font-serif text-white tracking-wide">Pricing Packages ({services.length})</h2>
          <p className="text-xs text-gray-500 mt-1">Configure Wedding, Portrait, and Cinema service packages</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-[#0A0A08] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#b08f37] transition-all cursor-pointer border-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      {/* Grid of service cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#262626] rounded-xl p-6 h-80 animate-pulse flex flex-col justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="h-4 w-1/3 bg-gray-800 rounded" />
                <div className="h-6 w-2/3 bg-gray-800 rounded" />
                <div className="h-3 w-full bg-gray-800 rounded" />
              </div>
              <div className="h-10 w-full bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-6 bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-serif mb-2 text-white">Failed to Load Packages</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-6">{error}</p>
          <button
            onClick={fetchServices}
            className="flex items-center gap-2 px-4 py-2 border border-[#262624] hover:border-[#C9A84C] rounded-lg text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#C9A84C] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center text-center p-8 bg-[#111110]/50 border border-amber-500/10 rounded-xl shadow-lg">
          <Briefcase className="w-10 h-10 text-gray-500/40 mb-3" />
          <h3 className="text-base font-serif mb-1 text-white">No services configured</h3>
          <p className="text-xs text-gray-500 max-w-xs mb-4">
            Get started by creating your first photography pricing package.
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#C9A84C]/30 hover:border-[#C9A84C] bg-[#C9A84C]/5 rounded-lg text-xs font-mono uppercase tracking-wider text-[#C9A84C] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Package</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-[#111110]/50 backdrop-blur-md border rounded-2xl p-4 sm:p-6 flex flex-col justify-between hover:border-[#C9A84C]/30 transition-all duration-300 shadow-xl relative ${
                service.popular ? "border-[#C9A84C]/30 shadow-[#C9A84C]/5 bg-[#161614]/50" : "border-amber-500/10"
              }`}
            >
              {service.popular && (
                <span className="absolute -top-3 left-6 px-3 py-1 text-[9px] font-mono font-bold bg-[#C9A84C] text-[#0A0A08] uppercase tracking-widest rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-black" />
                  <span>Popular</span>
                </span>
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-serif text-white font-semibold">
                    {service.price}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 border border-[#262624] hover:border-[#C9A84C]/30 rounded-lg text-gray-400 hover:text-[#C9A84C] bg-[#070706] transition-colors cursor-pointer"
                      title="Edit Service Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-1.5 border border-[#262626] hover:border-red-500/35 rounded-lg text-gray-400 hover:text-red-400 bg-[#0A0A0A] transition-colors cursor-pointer"
                      title="Delete Service Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold font-serif text-white tracking-wide mb-2">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                  {service.description}
                </p>

                <div className="border-t border-[#1A1A1A] pt-4 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1 block">Included Features</span>
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-gray-300">
                      <span className="text-[#C9A84C] text-sm shrink-0 leading-none">✓</span>
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#1A1A1A] pt-4 mt-6">
                <span className="text-[10px] font-mono text-gray-600">
                  Last Updated: {new Date(service.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT POPUP MODAL --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#111110] border border-amber-500/15 w-full max-w-lg rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 max-md:fixed max-md:inset-0 max-md:my-0 max-md:rounded-none max-md:max-h-full max-md:h-full max-md:w-full max-md:p-6 max-md:overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-amber-500/5 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9A84C]">
                  Package Configuration
                </span>
                <h3 className="text-2xl font-serif mt-1 text-white">
                  {editingService ? "Edit Service Package" : "Create Pricing Package"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Package Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Premium Wedding Package"
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Price Display</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. Rs. 40,000"
                    className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                    required
                  />
                </div>

                {/* Popular Toggle */}
                <div className="flex flex-col gap-1.5 justify-end pb-1.5">
                  <div className="flex items-center gap-3 bg-[#070706] border border-[#262624] rounded-lg p-2.5">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={popular}
                      onChange={(e) => setPopular(e.target.checked)}
                      className="w-4 h-4 accent-[#C9A84C] bg-black border-[#262624] rounded cursor-pointer"
                    />
                    <label htmlFor="popular" className="text-xs text-gray-300 select-none cursor-pointer">
                      Featured / Popular
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize package features, target events, coverage limits..."
                  rows={2}
                  className="w-full bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-4 py-2.5 text-xs text-white outline-none transition-all resize-none focus:ring-1 focus:ring-[#C9A84C]/10"
                  required
                />
              </div>

              {/* Dynamic Features List */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">Package Features</label>
                  <button
                    type="button"
                    onClick={handleAddFeatureField}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#C9A84C] hover:text-amber-400 transition-colors uppercase cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`Feature Item #${idx + 1} (e.g. 2 Photographers + 1 Videographer)`}
                        className="flex-1 bg-[#070706] border border-[#262624] focus:border-[#C9A84C] rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-all focus:ring-1 focus:ring-[#C9A84C]/10"
                        required
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureField(idx)}
                          className="p-2 border border-[#262624] hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-lg bg-[#070706] transition-colors cursor-pointer"
                          title="Remove feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Error banner */}
              {submitError && (
                <div className="flex gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Modal footer / Actions */}
              <div className="flex justify-end gap-3 border-t border-amber-500/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#262624] hover:border-gray-500 rounded-lg text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1.5 px-5 py-2 bg-[#C9A84C] text-[#0A0A08] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#b08f37] transition-colors cursor-pointer disabled:opacity-50 border-0"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Package</span>
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
