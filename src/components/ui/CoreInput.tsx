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
  /** Label above the field — 15px medium #1A181B (Figma: Form-field-title) */
  label?: string;
  /** Floating label (auth-style). Overrides standard label layout. */
  floatingLabel?: boolean;
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
      floatingLabel,
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

    // ── Floating label (auth variant — unchanged) ──────────────────────────
    if (floatingLabel) {
      return (
        <div className={["w-full", className].filter(Boolean).join(" ")}>
          <div className="relative">
            <input
              ref={ref}
              type={inputType}
              placeholder=" "
              disabled={disabled}
              className={[
                "peer h-14 w-full bg-[#F5F5F5] rounded-xl px-4 pt-5 pb-2",
                "border-2 outline-none",
                "text-[14px] text-[#0F172A]",
                "transition-all duration-150",
                error
                  ? "border-[#EF4444]"
                  : "border-transparent focus:border-[#0F172A]",
                hasRightIcon ? "pr-12" : "",
                disabled ? "opacity-50 cursor-not-allowed" : "",
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

    // ── Standard mode (Figma: Text field / dropdown text field) ──────────────
    //
    // Figma specs:
    //   Label:       15px w500 #1A181B, gap 4px below
    //   Field:       bg-white, border #D6D7E0 0.55px, radius-8
    //   Regular:     h-12 (48px)  |  Slim: h-11 (44px)
    //   Placeholder: 16px w500 #DFD9E2
    //   Input text:  16px w500 #272932
    //   Hover:       border-#D6F3FF
    //   Focus:       outer ring 2px #33C2FF, inner border #616161
    //   Clicked:     border-#00ABF5
    //   Error:       bg-#FEE9E8, border-#8E1F0B, error text #8E1F0B 14px w500
    //   Disabled:    opacity-50 cursor-not-allowed
    //   Dropdown:    + arrow-down icon on right

    const fieldHeight = slim ? "h-11" : "h-12";

    return (
      <div className={["w-full", className].filter(Boolean).join(" ")}>
        {/* Label — 15px w500 #1A181B */}
        {label && (
          <label className="block text-[15px] font-medium text-[#1A181B] mb-1">
            {label}
          </label>
        )}

        {/* Input wrapper — handles focus ring as outer glow */}
        <div
          className={[
            "relative rounded-[8px]",
            // Focus ring: outer 2px #33C2FF glow (Figma: Frame 1 stroke)
            "focus-within:ring-2 focus-within:ring-[#33C2FF] focus-within:ring-offset-0",
            // Error outer styling
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
              error
                ? "border border-[#8E1F0B]"
                : "border border-[#D6D7E0]",
              "outline-none",
              // Typography
              "text-[16px] font-medium text-[#272932]",
              "placeholder:text-[#DFD9E2] placeholder:font-medium",
              // Transitions
              "transition-all duration-150",
              // Hover: border turns light blue
              !error ? "hover:border-[#D6F3FF]" : "",
              // Focus: inner border turns dark grey (outer ring handled by wrapper)
              !error ? "focus:border-[#616161]" : "",
              // Clicked/active: border #00ABF5
              // (applied via :active — can be done with JS if needed)
              // Left icon padding
              hasLeftIcon ? "pl-10" : "",
              // Right icon padding
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

          {/* Dropdown chevron (Figma: arrow-down-01, stroke #1A181B) */}
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

        {/* Error message — 14px w500 #8E1F0B (Figma: error) */}
        {error && (
          <p className="text-[14px] font-medium text-[#8E1F0B] mt-1">{error}</p>
        )}
        {/* Helper text */}
        {!error && helperText && (
          <p className="text-[12px] text-[#94A3B8] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

CoreInput.displayName = "CoreInput";

export { CoreInput };
