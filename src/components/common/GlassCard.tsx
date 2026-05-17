import React from "react";
import clsx from "clsx";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accent?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  accent = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "rounded-2xl p-6 transition-all duration-300",
        accent ? "glass-panel-accent" : "glass-panel",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
