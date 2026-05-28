"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AssetCard {
  key: string;
  label: string;
  description: string;
}

const ASSET_KEYS: AssetCard[] = [
  {
    key: "hero-bg",
    label: "Hero Background Image",
    description: "The full-screen background photo displayed in the Hero banner of the home page.",
  },
  {
    key: "about-photo-1",
    label: "About Main Photo",
    description: "The first active portrait in the About Me slideshow.",
  },
  {
    key: "about-photo-2",
    label: "About Side Photo",
    description: "The second portrait in the About Me slideshow.",
  },
];

export default function AssetsDashboard() {
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload states per key
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRefs = {
    "hero-bg": useRef<HTMLInputElement>(null),
    "about-photo-1": useRef<HTMLInputElement>(null),
    "about-photo-2": useRef<HTMLInputElement>(null),
  };

  const fetchAssets = async () => {
    await Promise.resolve(); // Defer to avoid synchronous setState inside useEffect
    setIsLoading(true);
    setError(null);
    try {
      const fetched: Record<string, string> = {};
      for (const card of ASSET_KEYS) {
        const res = await fetch(`/api/assets?key=${card.key}`);
        const data = await res.json();
        if (data.success && data.asset) {
          fetched[card.key] = data.asset.imageUrl;
        }
      }
      setAssets(fetched);
    } catch {
      setError("Failed to load site assets from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssets();
  }, []);

  const handleUpload = async (key: string, file: File) => {
    if (!file) return;

    setUploadingKey(key);
    setSuccessKey(null);
    setUploadError(null);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `site-assets/${key}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, file, {
          cacheControl: "31536000",
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(`Supabase Storage Upload Error: ${uploadErr.message}`);
      }

      // 2. Fetch the Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);

      // 3. Patch to DB API
      const res = await fetch("/api/assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          imageUrl: publicUrl,
          altText: `Lens of Shubh ${key}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessKey(key);
        setAssets((prev) => ({ ...prev, [key]: publicUrl }));
        setTimeout(() => setSuccessKey(null), 4000);
      } else {
        throw new Error(data.error || "Failed to update asset metadata");
      }
    } catch (err: unknown) {
      console.error("Asset upload error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to upload image asset";
      setUploadError(errMsg);
    } finally {
      setUploadingKey(null);
    }
  };

  const triggerFileSelect = (key: "hero-bg" | "about-photo-1" | "about-photo-2") => {
    fileInputRefs[key].current?.click();
  };

  return (
    <div className="flex flex-col gap-6 w-full" suppressHydrationWarning>
      {/* Header bar */}
      <div className="flex justify-between items-center bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl p-4 shadow-md">
        <div>
          <h2 className="text-xl font-serif text-white tracking-wide">Manage Site Assets</h2>
          <p className="text-xs text-gray-500 mt-1">Configure and replace dynamic background & portrait images</p>
        </div>
        <button
          onClick={fetchAssets}
          className="p-2 border border-[#262624] hover:border-[#C9A84C]/30 text-gray-400 hover:text-[#C9A84C] rounded-lg transition-colors cursor-pointer"
          title="Refresh Assets"
          suppressHydrationWarning
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#262626] rounded-xl p-6 h-80 animate-pulse flex flex-col justify-between"
            >
              <div className="h-4 w-1/2 bg-gray-800 rounded" />
              <div className="h-32 w-full bg-gray-800 rounded my-4" />
              <div className="h-10 w-full bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-serif mb-2 text-white">Failed to Load Assets</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-6">{error}</p>
          <button
            onClick={fetchAssets}
            className="flex items-center gap-2 px-4 py-2 border border-[#262624] hover:border-[#C9A84C] rounded-lg text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-[#C9A84C] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ASSET_KEYS.map((assetCard) => {
            const key = assetCard.key as "hero-bg" | "about-photo-1" | "about-photo-2";
            const imageUrl = assets[key];
            const isUploading = uploadingKey === key;
            const isSuccess = successKey === key;

            return (
              <div
                key={key}
                className="bg-[#111110]/50 backdrop-blur-md border border-amber-500/10 hover:border-[#C9A84C]/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group"
              >
                <div>
                  <div className="border-b border-amber-500/5 pb-3 mb-4">
                    <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">
                      Key: {key}
                    </span>
                    <h3 className="text-base font-serif text-white font-medium mt-1">
                      {assetCard.label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {assetCard.description}
                    </p>
                  </div>

                  {/* Asset Preview Container */}
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#262624] bg-[#070706] flex items-center justify-center mb-5 group-hover:border-[#C9A84C]/20 transition-all">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={assetCard.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                        <span className="text-[10px] font-mono text-gray-500">No Image Seeded</span>
                        <span className="text-[9px] text-gray-600 mt-1">Uses Gradient Fallback</span>
                      </div>
                    )}

                    {/* Drag and Drop / Overlay Upload */}
                    <div
                      onClick={() => triggerFileSelect(key)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-center cursor-pointer transition-opacity duration-300"
                    >
                      <Upload className="w-8 h-8 text-[#C9A84C] mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform" />
                      <span className="text-xs text-white font-medium">Replace Image</span>
                      <span className="text-[10px] text-gray-400 mt-1">Click or drag image file</span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRefs[key]}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUpload(key, e.target.files[0]);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  {/* Status states */}
                  {isUploading && (
                    <div className="flex gap-2 items-center justify-center text-xs text-[#C9A84C] bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl py-2.5 mb-3 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Supabase...</span>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="flex gap-2 items-center justify-center text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl py-2.5 mb-3">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Updated successfully!</span>
                    </div>
                  )}

                  {uploadError && !isUploading && (
                    <div className="flex gap-2.5 items-start text-left text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl p-3 mb-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <button
                    onClick={() => triggerFileSelect(key)}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#262624] hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 text-gray-300 hover:text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    suppressHydrationWarning
                  >
                    <span>Replace Asset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
