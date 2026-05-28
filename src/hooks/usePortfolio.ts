import { useState, useEffect } from "react";
import { PortfolioItem } from "@/types";

// Maps frontend filter keys to exact DB category strings
const CATEGORY_MAP: Record<string, string> = {
  wedding: "Wedding",
  portrait: "Portrait",
  prewedding: "Pre Wedding",
};

export function usePortfolio(category?: string) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const mappedCategory = category ? (CATEGORY_MAP[category] ?? "") : "";
        const url = mappedCategory
          ? `/api/portfolio?category=${encodeURIComponent(mappedCategory)}`
          : "/api/portfolio";

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (data.success) {
          const fetched: PortfolioItem[] = data.portfolio || [];
          // Featured items first, then newest
          const sorted = [...fetched].sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setItems(sorted);
        } else {
          setError(data.error || "Failed to load portfolio items.");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Network error. Please check your connection.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => controller.abort();
  }, [category]);

  return { items, loading, error };
}
