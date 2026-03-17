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
  tag?: string;
  delta?: string;
  deltaLabel?: string;
  deltaType?: "up" | "down";
}

export default function MetricCard({
  label,
  value,
  icon,
  tag,
  delta,
  deltaLabel,
  deltaType,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      {/* Top section */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,179,255,0.08)" }}
          >
            <HugeiconsIcon
              icon={icon}
              size={16}
              color="#00B3FF"
              strokeWidth={1.5}
            />
          </div>
          <span className="text-[13px] font-medium text-[#475569]">{label}</span>
        </div>
        {tag && (
          <span className="text-[11px] font-medium text-[#94A3B8] bg-[#F2F7F9] px-2 py-0.5 rounded-full">
            {tag}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E2E8F0]" />

      {/* Bottom section */}
      <div className="px-5 py-4">
        <p className="font-[SN_Pro] text-[26px] font-semibold text-[#0F172A] leading-none">
          {value}
        </p>
        {delta && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {deltaType === "up" ? (
              <>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={13}
                  color="#22C55E"
                  strokeWidth={1.5}
                />
                <span className="text-[12px] font-medium text-[#22C55E]">
                  {delta}
                </span>
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={ArrowDownLeft01Icon}
                  size={13}
                  color="#EF4444"
                  strokeWidth={1.5}
                />
                <span className="text-[12px] font-medium text-[#EF4444]">
                  {delta}
                </span>
              </>
            )}
            {deltaLabel && (
              <span className="text-[12px] text-[#94A3B8] ml-0.5">
                {deltaLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
