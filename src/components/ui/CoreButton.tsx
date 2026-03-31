"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons-pro/core-stroke-rounded";
import { ButtonHTMLAttributes, forwardRef } from "react";

// IconSvgObject is what HugeiconsIcon's `icon` prop expects
type IconSvgObject =
  | ([string, { [key: string]: string | number }])[]
  | readonly (readonly [string, { readonly [key: string]: string | number }])[];

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[10px] transition-all duration-150 font-semibold text-sm",
  {
    variants: {
      variant: {
        // Primary — blue filled (Figma: primary)
        primary:
          "bg-[#00B3FF] text-white hover:bg-[#009FE6] active:text-[#C1E7F7]",
        // Default — white outlined (Figma: default)
        default:
          "bg-white text-[#272932] border border-[#DBDBDB] hover:bg-[#FAFAFA] active:bg-[#F2F2F2] active:border-[#D6D7E0] active:text-[#B5B5B5]",
        // Success — green filled (Figma: success-primary)
        success:
          "bg-[#29845A] text-white hover:bg-[#22724D]",
        // Danger/error — red filled (Figma: error-primary, #E51C00)
        danger:
          "bg-[#E51C00] text-white hover:bg-[#C91A00]",
        // ── Backward-compatible aliases ──
        // filled = primary
        filled:
          "bg-[#00B3FF] text-white hover:bg-[#009FE6] active:text-[#C1E7F7]",
        // secondary — light grey
        secondary:
          "bg-[#F2F7F9] text-[#0F172A] border border-[#E2E8F0] hover:bg-[#E8EEF2]",
        // outline — transparent with border
        outline:
          "bg-transparent border border-[#DBDBDB] text-[#272932] hover:bg-[#FAFAFA]",
        // ghost — no border, subtle hover
        ghost:
          "bg-transparent border border-transparent text-[#475569] hover:bg-[#F2F7F9] hover:text-[#0F172A]",
      },
      size: {
        // Figma reg-big: 48px
        lg: "h-12 px-3",
        // Figma reg-mid: 44px (default)
        default: "h-11 px-3",
        // Figma reg-sm: 40px
        sm: "h-10 px-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface CoreButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Visually disabled — no pointer events, muted style */
  inactive?: boolean;
  iconLeft?: IconSvgObject;
  iconRight?: IconSvgObject;
  /** Text button (Figma: text button) — no bg, #00B3FF, 15px medium */
  text?: boolean;
}

const CoreButton = forwardRef<HTMLButtonElement, CoreButtonProps>(
  (
    {
      variant,
      size,
      loading,
      disabled,
      inactive,
      iconLeft,
      iconRight,
      text,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const hasIcon = !!(iconLeft || iconRight);
    // Figma: gap-8 (2 units) for text-only, gap-4 (1 unit) for icon+text
    const gapClass = hasIcon ? "gap-1" : "gap-2";

    // Text button variant (Figma: text button — 15px w500, #00B3FF, p-2)
    if (text) {
      return (
        <button
          ref={ref}
          disabled={isDisabled}
          className={[
            "inline-flex items-center justify-center gap-2 transition-all duration-150",
            "text-[15px] font-medium text-[#00B3FF] hover:text-[#008FCC]",
            "p-2 rounded-lg",
            isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        >
          {loading ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
              className="animate-spin"
            />
          ) : (
            <>
              {iconLeft && (
                <HugeiconsIcon
                  icon={iconLeft}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              )}
              {children}
              {iconRight && (
                <HugeiconsIcon
                  icon={iconRight}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              )}
            </>
          )}
        </button>
      );
    }

    // Inactive / visually-disabled state
    if (inactive) {
      return (
        <button
          ref={ref}
          className={[
            "inline-flex items-center justify-center rounded-[10px] transition-all duration-150 font-semibold text-sm",
            size === "sm" ? "h-10 px-3" : size === "lg" ? "h-12 px-3" : "h-11 px-3",
            gapClass,
            "bg-[#F2F7F9] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed pointer-events-none",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          disabled
          {...rest}
        >
          {children}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          buttonVariants({ variant, size }),
          gapClass,
          isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {loading ? (
          <HugeiconsIcon
            icon={Loading03Icon}
            size={18}
            color="currentColor"
            strokeWidth={1.5}
            className="animate-spin"
          />
        ) : (
          <>
            {iconLeft && (
              <HugeiconsIcon
                icon={iconLeft}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
              />
            )}
            {children}
            {iconRight && (
              <HugeiconsIcon
                icon={iconRight}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
              />
            )}
          </>
        )}
      </button>
    );
  }
);

CoreButton.displayName = "CoreButton";

export { CoreButton, buttonVariants };
export type { IconSvgObject };
