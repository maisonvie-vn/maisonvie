import React from "react";
import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rect",
}) => {
  return (
    <div
      className={clsx(
        "skeleton-shimmer",
        {
          "h-4 w-full rounded": variant === "text",
          "rounded-xl": variant === "rect",
          "rounded-full": variant === "circle",
        },
        className,
      )}
    />
  );
};
export default Skeleton;
