import { useState, useEffect } from "react";
import { SiteAsset } from "@/types";

export function useSiteAsset(key: string) {
  const [asset, setAsset] = useState<SiteAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    
    async function fetchAsset() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/assets?key=${encodeURIComponent(key)}`);
        const data = await res.json();
        if (active) {
          if (data.success) {
            setAsset(data.asset);
          } else {
            setError(data.error || "Failed to load asset");
          }
        }
      } catch {
        if (active) {
          setError("Failed to fetch asset due to network error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchAsset();

    return () => {
      active = false;
    };
  }, [key]);

  return { asset, loading, error };
}
