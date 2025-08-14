import React, { useState } from "react";
import "./module.tooltip.css";

interface TooltipProps {
  /**
   * The children elements over which the tooltip will be displayed.
   */
  children: React.ReactNode;

  /**
   * The content to display inside the tooltip.
   */
  content: React.ReactNode;

  /**
   * The direction in which the tooltip appears relative to the children.
   * Can be one of `"top"`, `"right"`, `"bottom"`, or `"left"`.
   * @default "top"
   */
  direction?: "top" | "right" | "bottom" | "left";

  /**
   * Delay in milliseconds before showing the tooltip.
   * @default 400
   */
  delay?: number;
}

/**
 * A customizable tooltip component for wrapping child elements and providing additional information.
 *
 * @example
 * Basic Usage:
 * ```tsx
 * <Tooltip content="Hello, Tooltip!" direction="right">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 *
 * Truncation Example:
 * ```tsx
 * <Tooltip content={longText} direction="right">
 *   <p className="text-ellipsis truncate max-w-[150px]">{longText}</p>
 * </Tooltip>
 * ```
 *
 * Ensure proper truncation by adding the following CSS:
 * ```css
 * .truncate {
 *   overflow: hidden;
 *   text-overflow: ellipsis;
 *   white-space: nowrap;
 * }
 * ```
 * In Tailwind CSS, you can use utility classes like `truncate` and `max-w-[150px]`.
 */
const Tooltip: React.FC<TooltipProps> = ({ children, content, direction = "top", delay = 400 }) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const [active, setActive] = useState(false);

  const showTip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTip = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    setActive(false);
  };

  return (
    <div
      className="Tooltip-Wrapper"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {active && (
        <div className={`Tooltip-Tip ${direction}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
