"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  InformationCircleIcon,
  Alert01Icon,
  Cancel01Icon,
} from "@hugeicons-pro/core-stroke-rounded";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
  onClose: () => void;
  visible: boolean;
}

const config: Record<
  ToastType,
  { icon: typeof CheckmarkCircle02Icon; iconColor: string; bg: string }
> = {
  success: {
    icon: CheckmarkCircle02Icon,
    iconColor: "#22C55E",
    bg: "#F0FDF4",
  },
  error: {
    icon: AlertCircleIcon,
    iconColor: "#EF4444",
    bg: "#FEF2F2",
  },
  info: {
    icon: InformationCircleIcon,
    iconColor: "#00B3FF",
    bg: "rgba(0,179,255,0.08)",
  },
  warning: {
    icon: Alert01Icon,
    iconColor: "#F59E0B",
    bg: "#FFFBEB",
  },
};

export default function Toast({
  type,
  title,
  description,
  onClose,
  visible,
}: ToastProps) {
  const { icon, iconColor, bg } = config[type];

  return (
    <div
      className={[
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] px-4 py-3.5 flex items-start gap-3 min-w-[300px] max-w-[380px]">
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg }}
        >
          <HugeiconsIcon
            icon={icon}
            size={18}
            color={iconColor}
            strokeWidth={1.5}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#0F172A]">{title}</p>
          {description && (
            <p className="text-[13px] text-[#475569] mt-0.5">{description}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F2F7F9] cursor-pointer flex-shrink-0 transition-colors"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={14}
            color="#94A3B8"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </div>
  );
}
