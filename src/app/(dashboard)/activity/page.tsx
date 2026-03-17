"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAccountIcon,
  ShieldKeyIcon,
  DatabaseIcon,
  Download01Icon,
  Search01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";
import Link from "next/link";

const tabs = ["All Activity", "Login/Logout", "Data Changes", "Exports"] as const;
type Tab = (typeof tabs)[number];

const logs = [
  { id: "ACT-1041", admin: "Lademi Aliu", role: "Super Admin", action: "Updated loan status", module: "Loans", details: "Loan #LN-8821 marked as Defaulted", ip: "102.89.12.45", datetime: "May 8, 2024 · 11:42 AM", category: "Data Changes" },
  { id: "ACT-1040", admin: "Tolu Bankole", role: "Support", action: "Viewed customer profile", module: "Customers", details: "Opened profile for Amaka Obi", ip: "102.89.23.10", datetime: "May 8, 2024 · 11:30 AM", category: "All Activity" },
  { id: "ACT-1039", admin: "Seun Adeyemi", role: "Finance", action: "Exported report", module: "Reports", details: "Loan repayment CSV — Apr 2024", ip: "197.211.58.12", datetime: "May 8, 2024 · 10:55 AM", category: "Exports" },
  { id: "ACT-1038", admin: "Lademi Aliu", role: "Super Admin", action: "Logged in", module: "Auth", details: "Successful login from Chrome/Mac", ip: "102.89.12.45", datetime: "May 8, 2024 · 09:01 AM", category: "Login/Logout" },
  { id: "ACT-1037", admin: "Tolu Bankole", role: "Support", action: "Reset customer password", module: "Customers", details: "Password reset for user #USR-3041", ip: "102.89.23.10", datetime: "May 7, 2024 · 04:18 PM", category: "Data Changes" },
  { id: "ACT-1036", admin: "Chidi Eze", role: "Loan Officer", action: "Approved loan", module: "Loans", details: "Loan #LN-8818 approved — ₦150,000", ip: "197.211.45.67", datetime: "May 7, 2024 · 02:31 PM", category: "Data Changes" },
  { id: "ACT-1035", admin: "Seun Adeyemi", role: "Finance", action: "Logged out", module: "Auth", details: "Session ended", ip: "197.211.58.12", datetime: "May 7, 2024 · 01:00 PM", category: "Login/Logout" },
  { id: "ACT-1034", admin: "Lademi Aliu", role: "Super Admin", action: "Invited admin user", module: "Users", details: "Invited kemi@princeps.ng as Support", ip: "102.89.12.45", datetime: "May 7, 2024 · 10:22 AM", category: "Data Changes" },
  { id: "ACT-1033", admin: "Tolu Bankole", role: "Support", action: "Logged in", module: "Auth", details: "Successful login from Firefox/Windows", ip: "102.89.23.10", datetime: "May 7, 2024 · 09:05 AM", category: "Login/Logout" },
  { id: "ACT-1032", admin: "Chidi Eze", role: "Loan Officer", action: "Rejected loan", module: "Loans", details: "Loan #LN-8812 rejected — insufficient docs", ip: "197.211.45.67", datetime: "May 6, 2024 · 03:48 PM", category: "Data Changes" },
  { id: "ACT-1031", admin: "Seun Adeyemi", role: "Finance", action: "Exported report", module: "Reports", details: "VAS transactions CSV — May 2024", ip: "197.211.58.12", datetime: "May 6, 2024 · 02:10 PM", category: "Exports" },
  { id: "ACT-1030", admin: "Lademi Aliu", role: "Super Admin", action: "Updated role permissions", module: "Users", details: "Finance role: removed delete access", ip: "102.89.12.45", datetime: "May 6, 2024 · 11:14 AM", category: "Data Changes" },
  { id: "ACT-1029", admin: "Kemi Okafor", role: "Support", action: "Logged in", module: "Auth", details: "Successful login from Safari/iPhone", ip: "105.112.88.21", datetime: "May 6, 2024 · 09:30 AM", category: "Login/Logout" },
  { id: "ACT-1028", admin: "Tolu Bankole", role: "Support", action: "Sent notification", module: "Notifications", details: "KYC prompt sent to 6,129 users", ip: "102.89.23.10", datetime: "May 5, 2024 · 04:50 PM", category: "Data Changes" },
  { id: "ACT-1027", admin: "Lademi Aliu", role: "Super Admin", action: "Froze wallet", module: "Wallets", details: "Wallet #WAL-2041 frozen — fraud flag", ip: "102.89.12.45", datetime: "May 5, 2024 · 02:07 PM", category: "Data Changes" },
  { id: "ACT-1026", admin: "Chidi Eze", role: "Loan Officer", action: "Logged out", module: "Auth", details: "Session ended", ip: "197.211.45.67", datetime: "May 5, 2024 · 01:00 PM", category: "Login/Logout" },
  { id: "ACT-1025", admin: "Seun Adeyemi", role: "Finance", action: "Logged in", module: "Auth", details: "Successful login from Chrome/Windows", ip: "197.211.58.12", datetime: "May 5, 2024 · 09:02 AM", category: "Login/Logout" },
  { id: "ACT-1024", admin: "Kemi Okafor", role: "Support", action: "Exported report", module: "Reports", details: "Customer list CSV — full export", ip: "105.112.88.21", datetime: "May 4, 2024 · 03:15 PM", category: "Exports" },
  { id: "ACT-1023", admin: "Lademi Aliu", role: "Super Admin", action: "Disbursed loan", module: "Loans", details: "Loan #LN-8805 disbursed — ₦200,000", ip: "102.89.12.45", datetime: "May 4, 2024 · 11:55 AM", category: "Data Changes" },
  { id: "ACT-1022", admin: "Tolu Bankole", role: "Support", action: "Updated customer KYC", module: "Customers", details: "KYC status changed to Verified for USR-2918", ip: "102.89.23.10", datetime: "May 4, 2024 · 10:30 AM", category: "Data Changes" },
];

const categoryMap: Record<Tab, string> = {
  "All Activity": "",
  "Login/Logout": "Login/Logout",
  "Data Changes": "Data Changes",
  "Exports": "Exports",
};

const moduleColor: Record<string, string> = {
  Loans: "bg-[#EFF6FF] text-[#3B82F6]",
  Customers: "bg-[#F0FDF4] text-[#22C55E]",
  Reports: "bg-[#FFF7ED] text-[#F59E0B]",
  Auth: "bg-[#FEF2F2] text-[#EF4444]",
  Users: "bg-[#F5F3FF] text-[#8B5CF6]",
  Wallets: "bg-[#ECFDF5] text-[#10B981]",
  Notifications: "bg-[#EFF6FF] text-[#00B3FF]",
};

export default function ActivityLogsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All Activity");
  const [search, setSearch] = useState("");

  const filtered = logs.filter((l) => {
    const matchTab = activeTab === "All Activity" || l.category === categoryMap[activeTab];
    const matchSearch =
      l.admin.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.module.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <PageShell title="Activity Logs">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Events Today" value="142" icon={UserAccountIcon} delta="+18" deltaLabel="vs yesterday" deltaType="up" />
        <MetricCard label="Admin Sessions" value="9" icon={ShieldKeyIcon} delta="+2" deltaLabel="active now" deltaType="up" />
        <MetricCard label="Data Exports" value="7" icon={Download01Icon} tag="Last: 2h ago" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-3 flex-wrap">
          <div className="inline-flex bg-[#F8FAFC] rounded-full p-1 gap-1 border border-[#E2E8F0]">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={["px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 whitespace-nowrap",
                  activeTab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-[#475569] hover:text-[#0F172A]"].join(" ")}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative ml-2">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={15} color="#94A3B8" strokeWidth={1.5} />
            </span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..."
              className="h-9 w-[200px] bg-[#F2F7F9] rounded-lg border-0 outline-none pl-8 pr-3 text-[13px] placeholder:text-[#94A3B8]" />
          </div>
          <div className="ml-auto">
            <CoreButton variant="ghost" size="sm" iconLeft={Download01Icon}>Export</CoreButton>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Admin", "Action", "Module", "Details", "IP Address", "Date / Time", ""].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-medium text-[#0F172A]">{log.admin}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{log.role}</p>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#475569]">{log.action}</td>
                <td className="px-4 py-3.5">
                  <span className={["text-[11px] font-semibold px-2 py-0.5 rounded-full", moduleColor[log.module] ?? "bg-[#F8FAFC] text-[#475569]"].join(" ")}>
                    {log.module}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[12px] text-[#475569] max-w-[220px] truncate">{log.details}</td>
                <td className="px-4 py-3.5 text-[12px] font-mono text-[#94A3B8]">{log.ip}</td>
                <td className="px-4 py-3.5 text-[12px] text-[#475569] whitespace-nowrap">{log.datetime}</td>
                <td className="px-4 py-3.5">
                  <Link href={`/activity/${log.id}`}>
                    <CoreButton variant="ghost" size="sm">View</CoreButton>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–{filtered.length} of 1,204 results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm">Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
