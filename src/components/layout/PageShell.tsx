import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  ArrowDown01Icon,
  Notification02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import Sidebar from "./Sidebar";

interface PageShellProps {
  title: string;
  children: React.ReactNode;
}

export default function PageShell({ title, children }: PageShellProps) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-[240px] overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-[SN_Pro] text-[18px] font-semibold text-[#0F172A]">
            {title}
          </h1>

          <div className="flex items-center gap-3">
            {/* Date range pill */}
            <button className="bg-white border border-[#E2E8F0] rounded-full px-4 py-2 flex items-center gap-2 text-[13px] text-[#475569] cursor-pointer hover:border-[#CBD5E1] transition-colors">
              <HugeiconsIcon
                icon={Calendar01Icon}
                size={14}
                color="#94A3B8"
                strokeWidth={1.5}
              />
              Mar 1 – Mar 17, 2026
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={14}
                color="#94A3B8"
                strokeWidth={1.5}
              />
            </button>

            {/* Notification bell */}
            <button className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center hover:border-[#CBD5E1] transition-colors">
              <HugeiconsIcon
                icon={Notification02Icon}
                size={18}
                color="#475569"
                strokeWidth={1.5}
              />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#00B3FF] flex items-center justify-center text-white text-[12px] font-semibold">
              LA
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
