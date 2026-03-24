"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  UserMultiple02Icon,
  Money02Icon,
  Wallet02Icon,
  ReceiptTextIcon,
  Notification02Icon,
  BarChartIcon,
  Settings02Icon,
  FileSearchIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import type { IconSvgObject } from "@/components/ui/CoreButton";

interface NavItem {
  label: string;
  href: string;
  icon: IconSvgObject;
}

interface NavGroup {
  heading?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home01Icon }],
  },
  {
    heading: "MANAGE",
    items: [
      { label: "Customers", href: "/customers", icon: UserMultiple02Icon },
      { label: "Loans", href: "/loans", icon: Money02Icon },
      { label: "Wallet & Accounts", href: "/wallets", icon: Wallet02Icon },
      { label: "VAS / Bill Payments", href: "/vas", icon: ReceiptTextIcon },
    ],
  },
  {
    heading: "COMMUNICATE",
    items: [
      { label: "Notifications", href: "/notifications", icon: Notification02Icon },
      { label: "Reports", href: "/reports", icon: BarChartIcon },
    ],
  },
  {
    heading: "SYSTEM",
    items: [
      { label: "Settings", href: "/settings", icon: Settings02Icon },
      { label: "Activity Logs", href: "/activity", icon: FileSearchIcon },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] h-screen fixed left-0 top-0 bg-[#F5F5F5] flex flex-col">
      {/* Top section */}
      <div className="px-4 pt-5 pb-4">
        <Image
          src="/images/core-logo.png"
          width={90}
          height={30}
          alt="Core"
          priority
        />

        {/* Admin card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white mt-4">
          <div className="w-8 h-8 rounded-full bg-[#00B3FF] flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0">
            LA
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#0F172A] truncate">
              Lademi Ajimosun
            </p>
            <p className="text-[11px] text-[#94A3B8]">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.heading && (
              <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] px-2 mb-1 mt-4 first:mt-0">
                {group.heading}
              </p>
            )}
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 px-3 py-2 rounded-xl w-full transition-all duration-150 text-[13px] font-medium",
                    active
                      ? "bg-white text-[#0F172A] font-semibold shadow-sm"
                      : "text-[#64748B] hover:bg-white hover:text-[#0F172A] hover:shadow-sm",
                  ].join(" ")}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-5 mt-auto">
        <div className="h-px bg-[#E8E8E8] mb-4" />
        <button className="w-full text-[13px] text-[#64748B] hover:text-[#0F172A] text-center py-1.5 rounded-xl hover:bg-white transition-all">
          Help
        </button>
        <div className="flex items-center justify-center gap-3 mt-2">
          {["Terms", "Privacy", "Cookies"].map((l) => (
            <a
              key={l}
              className="text-[11px] text-[#94A3B8] hover:text-[#64748B] cursor-pointer transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
