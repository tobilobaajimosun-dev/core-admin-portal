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
  "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-150 font-semibold",
  {
    variants: {
      variant: {
        filled: "bg-[#00B3FF] text-white hover:bg-[#009FE6]",
        secondary: "bg-[#F2F7F9] text-[#0F172A] hover:bg-[#E8EEF2]",
        outline:
          "bg-transparent border-[1.5px] border-[#00B3FF] text-[#00B3FF] hover:bg-[rgba(0,179,255,0.06)]",
        ghost: "bg-transparent text-[#00B3FF] hover:bg-[rgba(0,179,255,0.06)]",
      },
      size: {
        default: "h-12 px-6 text-[14px]",
        sm: "h-9 px-4 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

interface CoreButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  inactive?: boolean;
  iconLeft?: IconSvgObject;
  iconRight?: IconSvgObject;
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
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    if (inactive) {
      return (
        <button
          ref={ref}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-150 font-semibold",
            size === "sm" ? "h-9 px-4 text-[13px]" : "h-12 px-6 text-[14px]",
            "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed pointer-events-none",
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
