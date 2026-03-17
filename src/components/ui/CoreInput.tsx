"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import type { IconSvgObject } from "./CoreButton";

interface CoreInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: IconSvgObject;
  passwordToggle?: boolean;
}

const CoreInput = forwardRef<HTMLInputElement, CoreInputProps>(
  (
    {
      label,
      error,
      helperText,
      iconLeft,
      passwordToggle,
      className,
      type,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType =
      passwordToggle ? (showPassword ? "text" : "password") : type;

    const hasRightIcon = passwordToggle;
    const hasLeftIcon = !!iconLeft;

    return (
      <div className={["w-full", className].filter(Boolean).join(" ")}>
        {label && (
          <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          {hasLeftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon
                icon={iconLeft!}
                size={18}
                color="#94A3B8"
                strokeWidth={1.5}
              />
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            className={[
              "h-12 w-full rounded-xl px-4",
              "bg-[#F2F7F9]",
              "border-2 border-transparent outline-none",
              "text-[14px] text-[#0F172A] font-normal",
              "placeholder:text-[#94A3B8]",
              "transition-all duration-150",
              "focus:border-[#00B3FF] focus:shadow-[0_0_0_3px_rgba(0,179,255,0.10)]",
              error
                ? "border-[#EF4444] shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                : "",
              hasLeftIcon ? "pl-10" : "",
              hasRightIcon ? "pr-11" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...rest}
          />

          {passwordToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffIcon : ViewIcon}
                size={18}
                color="#94A3B8"
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>

        {error && (
          <p className="text-[12px] text-[#EF4444] mt-1.5">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[12px] text-[#94A3B8] mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

CoreInput.displayName = "CoreInput";

export { CoreInput };
