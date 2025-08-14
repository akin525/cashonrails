// useResizeObserver.ts
import { useEffect, useState, RefObject } from "react";
import ResizeObserver from "resize-observer-polyfill";

interface Dimensions {
  width: number;
  height: number;
}

// Update the type to be more specific about null
const useResizeObserver = (
  // Change the type to accept null since React.useRef can be null
  ref: RefObject<HTMLDivElement | null>
): Dimensions | undefined => {
  const [dimensions, setDimensions] = useState<Dimensions>();

  useEffect(() => {
    const observeTarget = ref.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        setDimensions({
          width: entry.contentRect.width+70,
          height: entry.contentRect.height,
        });
      });
    });

    resizeObserver.observe(observeTarget);

    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);

  return dimensions;
};

export default useResizeObserver;