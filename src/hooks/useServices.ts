import { useState, useEffect } from "react";
import { Service } from "@/types";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/services", { signal: controller.signal });
        const data = await res.json();
        if (data.success) {
          setServices(data.services || []);
        } else {
          setError(data.error || "Failed to load services.");
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
  }, []);

  return { services, loading, error };
}
