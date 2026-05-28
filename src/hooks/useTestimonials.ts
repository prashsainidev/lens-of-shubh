import { useState, useEffect } from "react";
import { Testimonial } from "@/types";

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/testimonials", { signal: controller.signal });
        const data = await res.json();
        if (data.success) {
          setTestimonials(data.testimonials || []);
        } else {
          setError(data.error || "Failed to load testimonials.");
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

  return { testimonials, loading, error };
}
