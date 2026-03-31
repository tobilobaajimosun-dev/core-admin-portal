"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  ViewOffIcon,
  ArrowDown01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import type { IconSvgObject } from "./CoreButton";

interface CoreInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label above the field — 14px w500 #1A181B (Figma: Form-field-title) */
  label?: string;
  /** Error message — shown below field, triggers error styles */
  error?: string;
  /** Helper text — shown below field when no error */
  helperText?: string;
  /** Icon on the left inside the field */
  iconLeft?: IconSvgObject;
  /** Show password show/hide toggle */
  passwordToggle?: boolean;
  /**
   * Slim variant — 44px height instead of default 48px
   * (Figma: slim-default / slim-focus / slim-error etc.)
   */
  slim?: boolean;
  /**
   * Dropdown variant — adds chevron arrow on the right
   * (Figma: dropdown text field)
   */
  dropdown?: boolean;
}

const CoreInput = forwardRef<HTMLInputElement, CoreInputProps>(
  (
    {
      label,
      error,
      helperText,
      iconLeft,
      passwordToggle,
      slim,
      dropdown,
      className,
      type,
      disabled,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType =
      passwordToggle ? (showPassword ? "text" : "password") : type;

    const hasRightIcon = passwordToggle || dropdown;
    const hasLeftIcon = !!iconLeft;

    // ── Standard mode ─────────────────────────────────────────────────────────
    //
    // Figma specs (Components canvas 103:168 — Text field / dropdown text field):
    //   Label:       14px w500 #1A181B, 4px gap below
    //   Field:       bg-white, border #D6D7E0 0.55px, radius 8px
    //   Regular:     h-12 (48px)  |  Slim: h-11 (44px)
    //   Text/Placeholder: 15px w500 #DFD9E2 (placeholder), #272932 (typed)
    //   Hover:       border-#D6F3FF
    //   Focus:       outer ring 2px #33C2FF + inner border #616161
    //   Error:       bg-#FEE9E8, border+text #8E1F0B, error msg 14px w500
    //   Disabled:    opacity-50 cursor-not-allowed
    //   Dropdown:    + arrow-down-01 icon on right (#1A181B stroke)

    const fieldHeight = slim ? "h-11" : "h-12";

    return (
      <div className={["w-full", className].filter(Boolean).join(" ")}>
        {/* Label — 14px w500 #1A181B */}
        {label && (
          <label className="block text-[14px] font-medium text-[#1A181B] mb-1">
            {label}
          </label>
        )}

        {/* Wrapper handles the outer focus ring */}
        <div
          className={[
            "relative rounded-[8px]",
            "focus-within:ring-2 focus-within:ring-[#33C2FF] focus-within:ring-offset-0",
            error ? "ring-2 ring-[#8E1F0B] ring-offset-0" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {hasLeftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
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
            disabled={disabled}
            className={[
              fieldHeight,
              "w-full rounded-[8px] px-3",
              // Background
              error ? "bg-[#FEE9E8]" : "bg-white",
              // Border
              error ? "border border-[#8E1F0B]" : "border border-[#D6D7E0]",
              "outline-none",
              // Typography — 15px w500 (Figma)
              "text-[15px] font-medium text-[#272932]",
              "placeholder:text-[#DFD9E2] placeholder:font-medium",
              "transition-all duration-150",
              // States
              !error ? "hover:border-[#D6F3FF]" : "",
              !error ? "focus:border-[#616161]" : "",
              // Padding adjustments for icons
              hasLeftIcon ? "pl-10" : "",
              hasRightIcon ? "pr-10" : "",
              // Disabled
              disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...rest}
          />

          {/* Password toggle */}
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
                color="currentColor"
                strokeWidth={1.5}
              />
            </button>
          )}

          {/* Dropdown arrow (Figma: arrow-down-01, stroke #1A181B) */}
          {dropdown && !passwordToggle && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={20}
                color={disabled ? "#B5B5B5" : "#1A181B"}
                strokeWidth={1.5}
              />
            </span>
          )}
        </div>

        {/* Error message — 14px w500 #8E1F0B */}
        {error && (
          <p className="text-[14px] font-medium text-[#8E1F0B] mt-1">{error}</p>
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
