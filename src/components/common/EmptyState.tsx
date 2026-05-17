import React from "react";
import Button from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl space-y-5">
      <div className="w-16 h-16 bg-[#F9F5EE] text-[#C89A3D] rounded-full flex items-center justify-center border border-[#EFEAE0]">
        {icon || (
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-base font-medium text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500 font-light leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
