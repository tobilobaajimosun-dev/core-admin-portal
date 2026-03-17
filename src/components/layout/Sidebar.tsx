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
  Logout01Icon,
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
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5">
        <Image
          src="/images/core-logo.png"
          width={100}
          height={34}
          alt="Core"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.heading && (
              <p className="text-[10px] font-medium tracking-[0.08em] text-[#94A3B8] uppercase px-3 mt-4 mb-1">
                {group.heading}
              </p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-2.5 px-3 py-1.5 rounded-lg w-full transition-all duration-150 text-[13px]",
                    active
                      ? "bg-[#F2F7F9] text-[#0F172A] font-medium"
                      : "text-[#64748B] font-normal hover:bg-[#F8FAFC] hover:text-[#0F172A]",
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

      {/* User footer */}
      <div className="px-4 py-4 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#00B3FF] flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
            LA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#0F172A] truncate">
              Lademi Ajimosun
            </p>
            <p className="text-[11px] text-[#94A3B8]">Super Admin</p>
          </div>
          <button className="ml-auto flex-shrink-0 hover:opacity-70 transition-opacity">
            <HugeiconsIcon
              icon={Logout01Icon}
              size={15}
              color="#94A3B8"
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
