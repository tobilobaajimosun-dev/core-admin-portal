import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Notification02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import Sidebar from "./Sidebar";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-[220px] overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center gap-4 sticky top-0 z-10">
          {/* Search */}
          <div className="relative flex-1 max-w-[400px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon
                icon={Search01Icon}
                size={15}
                color="#94A3B8"
                strokeWidth={1.5}
              />
            </span>
            <input
              placeholder="Search..."
              className="w-full h-9 bg-[#F5F5F5] rounded-lg pl-9 pr-4 text-[13px] text-[#0F172A] border-0 outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[rgba(0,179,255,0.15)] transition-all"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F5F5] transition-colors">
              <HugeiconsIcon
                icon={Notification02Icon}
                size={18}
                color="#64748B"
                strokeWidth={1.5}
              />
              <span className="w-2 h-2 bg-[#EF4444] rounded-full absolute top-1.5 right-1.5" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#00B3FF] flex items-center justify-center text-white text-[12px] font-semibold cursor-pointer">
              LA
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-8 py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
