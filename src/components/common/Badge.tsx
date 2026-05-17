import React from "react";
import clsx from "clsx";

type BadgeVariant =
  | "vip"
  | "retail"
  | "agency"
  | "high"
  | "medium"
  | "low"
  | "success"
  | "info"
  | "warning"
  | "error";

interface BadgeProps {
  variant: BadgeVariant | string;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  className,
}) => {
  const getVariantStyles = (v: string) => {
    switch (v) {
      case "vip":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "retail":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "agency":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "high":
      case "error":
        return "bg-red-50 text-red-700 border border-red-100";
      case "medium":
      case "warning":
        return "bg-yellow-50 text-yellow-700 border border-yellow-100";
      case "low":
      case "info":
        return "bg-sky-50 text-sky-700 border border-sky-100";
      case "success":
        return "bg-green-50 text-green-700 border border-green-100";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase",
        getVariantStyles(variant),
        className,
      )}
    >
      {children}
    </span>
  );
};
export default Badge;
