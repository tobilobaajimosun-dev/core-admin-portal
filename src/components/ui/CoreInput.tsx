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
  floatingLabel?: boolean;
  error?: string;
  helperText?: string;
  iconLeft?: IconSvgObject;
  passwordToggle?: boolean;
}

const CoreInput = forwardRef<HTMLInputElement, CoreInputProps>(
  (
    {
      label,
      floatingLabel,
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

    if (floatingLabel) {
      return (
        <div className={["w-full", className].filter(Boolean).join(" ")}>
          <div className="relative">
            <input
              ref={ref}
              type={inputType}
              placeholder=" "
              className={[
                "peer h-14 w-full bg-[#F5F5F5] rounded-xl px-4 pt-5 pb-2",
                "border-2 outline-none",
                "text-[14px] text-[#0F172A]",
                "transition-all duration-150",
                error
                  ? "border-[#EF4444]"
                  : "border-transparent focus:border-[#0F172A]",
                hasRightIcon ? "pr-12" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              {...rest}
            />
            {label && (
              <label
                className={[
                  "absolute left-4 top-1/2 -translate-y-1/2",
                  "text-[14px] text-[#94A3B8] font-normal",
                  "pointer-events-none transition-all duration-150",
                  "peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-[#475569] peer-focus:font-medium",
                  "peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:text-[#475569] peer-[&:not(:placeholder-shown)]:font-medium",
                ].join(" ")}
              >
                {label}
              </label>
            )}
            {passwordToggle && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffIcon : ViewIcon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </button>
            )}
          </div>
          {error && (
            <p className="text-[12px] text-[#EF4444] mt-1">{error}</p>
          )}
          {!error && helperText && (
            <p className="text-[12px] text-[#94A3B8] mt-1">{helperText}</p>
          )}
        </div>
      );
    }

    // Standard mode — unchanged
    return (
      <div className={["w-full", className].filter(Boolean).join(" ")}>
        {label && (
          <label className="block text-[12px] font-medium text-[#475569] mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {hasLeftIcon && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon
                icon={iconLeft!}
                size={15}
                color="#94A3B8"
                strokeWidth={1.5}
              />
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            className={[
              "h-9 w-full rounded-lg px-3",
              "bg-[#F8FAFC]",
              "border border-[#E2E8F0] outline-none",
              "text-[13px] text-[#0F172A] font-normal",
              "placeholder:text-[#94A3B8]",
              "transition-all duration-150",
              "focus:border-[#00B3FF] focus:ring-2 focus:ring-[rgba(0,179,255,0.12)]",
              error
                ? "border-[#EF4444] ring-2 ring-[rgba(239,68,68,0.08)]"
                : "",
              hasLeftIcon ? "pl-8" : "",
              hasRightIcon ? "pr-9" : "",
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffIcon : ViewIcon}
                size={15}
                color="currentColor"
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>

        {error && (
          <p className="text-[12px] text-[#EF4444] mt-1">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[12px] text-[#94A3B8] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

CoreInput.displayName = "CoreInput";

export { CoreInput };
