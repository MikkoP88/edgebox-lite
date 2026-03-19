import { useEffect, useState, type RefObject } from "react";
import type { Dimensions } from "../edgeBoxTypes";

export interface UseEdgeBoxMeasuredSizeOptions {
  disabled?: boolean;
}

export function useEdgeBoxMeasuredSize<TElement extends HTMLElement>(
  elementRef: RefObject<TElement>,
  options: UseEdgeBoxMeasuredSizeOptions = {},
): Dimensions | null {
  const { disabled = false } = options;
  const [size, setSize] = useState<Dimensions | null>(null);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const element = elementRef.current;
    if (!element) return;

    const updateMeasuredSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      setSize((prev) => {
        const next = {
          width: rect.width,
          height: rect.height,
        };

        if (
          prev
          && Math.abs(prev.width - next.width) < 0.5
          && Math.abs(prev.height - next.height) < 0.5
        ) {
          return prev;
        }

        return next;
      });
    };

    updateMeasuredSize();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateMeasuredSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [disabled, elementRef]);

  return size;
}
