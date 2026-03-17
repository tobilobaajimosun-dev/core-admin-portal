import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import type { IconSvgObject } from "./CoreButton";

interface FinanceItem {
  label: string;
  value: string;
  delta: string;
  deltaType: "up" | "down";
  icon: IconSvgObject;
  iconBg: string;
  iconColor: string;
}

interface FinanceSummaryCardProps {
  title: string;
  subtitle: string;
  items: FinanceItem[];
}

export default function FinanceSummaryCard({
  title,
  subtitle,
  items,
}: FinanceSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E8F0]">
        <p className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">
          {title}
        </p>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">{subtitle}</p>
      </div>

      {/* Rows */}
      <div className="flex-1 flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-5 py-4 flex items-center justify-between border-b border-[#E2E8F0] last:border-b-0"
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.iconBg }}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={18}
                  color={item.iconColor}
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-[13px] font-medium text-[#475569]">
                {item.label}
              </span>
            </div>

            {/* Right */}
            <div className="text-right">
              <p className="font-[SN_Pro] text-[16px] font-semibold text-[#0F172A]">
                {item.value}
              </p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                {item.deltaType === "up" ? (
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={12}
                    color="#22C55E"
                    strokeWidth={1.5}
                  />
                ) : (
                  <HugeiconsIcon
                    icon={ArrowDownLeft01Icon}
                    size={12}
                    color="#EF4444"
                    strokeWidth={1.5}
                  />
                )}
                <span
                  className={[
                    "text-[12px] font-medium",
                    item.deltaType === "up"
                      ? "text-[#22C55E]"
                      : "text-[#EF4444]",
                  ].join(" ")}
                >
                  {item.delta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
