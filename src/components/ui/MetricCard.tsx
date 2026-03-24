import type { IconSvgObject } from "./CoreButton";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: IconSvgObject;
  tag?: string;
  delta?: string;
  deltaLabel?: string;
  deltaType?: "up" | "down";
}

export default function MetricCard({
  label,
  value,
  tag,
  delta,
  deltaLabel,
  deltaType,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] mb-3">
        {label}
      </p>
      <p className="font-[SN_Pro] text-[26px] font-semibold text-[#0F172A] leading-none mb-2">
        {value}
      </p>
      {delta ? (
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[12px] font-semibold ${
              deltaType === "up" ? "text-[#16A34A]" : "text-[#DC2626]"
            }`}
          >
            {delta}
          </span>
          {deltaLabel && (
            <span className="text-[11px] text-[#94A3B8]">{deltaLabel}</span>
          )}
        </div>
      ) : tag ? (
        <span className="text-[12px] font-medium text-[#F59E0B]">{tag}</span>
      ) : null}
    </div>
  );
}
