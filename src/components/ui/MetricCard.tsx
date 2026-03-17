import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import type { IconSvgObject } from "./CoreButton";

interface MetricCardProps {
  label: string;
  value: string;
  icon: IconSvgObject;
  delta?: string;
  deltaLabel?: string;
  deltaType?: "up" | "down";
}

export default function MetricCard({
  label,
  value,
  icon,
  delta,
  deltaLabel,
  deltaType,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
      {/* Top row */}
      <div className="flex justify-between items-start">
        <span className="text-[13px] text-[#475569] font-medium">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,179,255,0.08)" }}
        >
          <HugeiconsIcon
            icon={icon}
            size={18}
            color="#00B3FF"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Value */}
      <p className="font-[SN_Pro] text-[28px] font-semibold text-[#0F172A] mt-3 leading-none">
        {value}
      </p>

      {/* Delta */}
      {delta && (
        <div className="flex items-center gap-1.5 mt-1.5">
          {deltaType === "up" ? (
            <>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={14}
                color="#22C55E"
                strokeWidth={1.5}
              />
              <span className="text-[12px] text-[#22C55E] font-medium">
                {delta}
              </span>
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={ArrowDownLeft01Icon}
                size={14}
                color="#EF4444"
                strokeWidth={1.5}
              />
              <span className="text-[12px] text-[#EF4444] font-medium">
                {delta}
              </span>
            </>
          )}
          {deltaLabel && (
            <span className="text-[12px] text-[#94A3B8]">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
