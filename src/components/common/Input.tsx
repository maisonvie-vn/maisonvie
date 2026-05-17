import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, type = "text", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          className={clsx(
            "w-full px-4 py-2.5 rounded-xl border bg-white/50 text-sm font-light transition-all duration-200 outline-none",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-200 focus:border-[#C89A3D] focus:ring-1 focus:ring-[#C89A3D]",
            className,
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-light">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
