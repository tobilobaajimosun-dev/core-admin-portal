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
  "inline-flex items-center justify-center gap-1.5 rounded-lg transition-all duration-150 font-medium text-[13px]",
  {
    variants: {
      variant: {
        filled:
          "bg-[#00B3FF] text-white border border-[#00B3FF] hover:bg-[#009FE6] hover:border-[#009FE6]",
        secondary:
          "bg-[#F2F7F9] text-[#0F172A] border border-[#E2E8F0] hover:bg-[#E8EEF2]",
        outline:
          "bg-transparent border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F2F7F9]",
        ghost:
          "bg-transparent border border-transparent text-[#475569] hover:bg-[#F2F7F9] hover:text-[#0F172A]",
        danger:
          "bg-[#EF4444] text-white border border-[#EF4444] hover:bg-[#DC2626] hover:border-[#DC2626]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3",
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
            "inline-flex items-center justify-center gap-1.5 rounded-lg transition-all duration-150 font-medium text-[13px]",
            size === "sm" ? "h-8 px-3" : "h-10 px-4",
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
                size={15}
                color="currentColor"
                strokeWidth={1.5}
              />
            )}
            {children}
            {iconRight && (
              <HugeiconsIcon
                icon={iconRight}
                size={15}
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
