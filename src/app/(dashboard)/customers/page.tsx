"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  UserCheck01Icon,
  Activity01Icon,
  UserBlock01Icon,
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  Download01Icon,
  MoreVerticalIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import { CoreButton } from "@/components/ui/CoreButton";
import CoreBadge from "@/components/ui/CoreBadge";

const customers = [
  { id: "1", name: "Amaka Obi", phone: "+234 801 234 5678", kyc: "verified", walletBalance: "₦124,500.00", loanStatus: "active", registered: "Jan 12, 2024" },
  { id: "2", name: "Biodun Adeyemi", phone: "+234 802 345 6789", kyc: "pending", walletBalance: "₦45,200.00", loanStatus: "none", registered: "Feb 3, 2024" },
  { id: "3", name: "Chidi Nwosu", phone: "+234 803 456 7890", kyc: "verified", walletBalance: "₦380,750.00", loanStatus: "completed", registered: "Mar 18, 2024" },
  { id: "4", name: "Dupe Afolabi", phone: "+234 804 567 8901", kyc: "failed", walletBalance: "₦0.00", loanStatus: "none", registered: "Jan 29, 2024" },
  { id: "5", name: "Emmanuel Okafor", phone: "+234 805 678 9012", kyc: "verified", walletBalance: "₦92,100.00", loanStatus: "active", registered: "Apr 5, 2024" },
  { id: "6", name: "Fatima Aliyu", phone: "+234 806 789 0123", kyc: "verified", walletBalance: "₦215,000.00", loanStatus: "active", registered: "Feb 20, 2024" },
  { id: "7", name: "Grace Eze", phone: "+234 807 890 1234", kyc: "unverified", walletBalance: "₦12,800.00", loanStatus: "none", registered: "May 1, 2024" },
  { id: "8", name: "Henry Babatunde", phone: "+234 808 901 2345", kyc: "verified", walletBalance: "₦567,300.00", loanStatus: "defaulted", registered: "Dec 14, 2023" },
  { id: "9", name: "Ifunanya Okonkwo", phone: "+234 809 012 3456", kyc: "verified", walletBalance: "₦78,900.00", loanStatus: "completed", registered: "Mar 7, 2024" },
  { id: "10", name: "James Lawal", phone: "+234 810 123 4567", kyc: "pending", walletBalance: "₦33,400.00", loanStatus: "none", registered: "Apr 22, 2024" },
];

const kycVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  verified: "success", pending: "warning", failed: "error", unverified: "neutral",
};
const loanVariant: Record<string, "info" | "success" | "neutral" | "error"> = {
  active: "info", completed: "success", none: "neutral", defaulted: "error",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <PageShell title="Customers">
      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Customers" value="24,531" icon={UserMultiple02Icon} delta="+12%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="KYC Verified" value="18,204" icon={UserCheck01Icon} delta="+8%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Active This Month" value="9,847" icon={Activity01Icon} delta="+5%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Suspended" value="124" icon={UserBlock01Icon} delta="+2" deltaLabel="this month" deltaType="down" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={15} color="#94A3B8" strokeWidth={1.5} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="h-9 w-[220px] bg-[#F2F7F9] rounded-lg border-0 outline-none pl-8 pr-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
          <CoreButton variant="outline" size="sm" iconLeft={FilterIcon}>Filter</CoreButton>
          <CoreButton variant="outline" size="sm" iconRight={ArrowDown01Icon}>KYC Status</CoreButton>
          <CoreButton variant="outline" size="sm" iconRight={ArrowDown01Icon}>Loan Status</CoreButton>
          <div className="ml-auto">
            <CoreButton variant="ghost" size="sm" iconLeft={Download01Icon} disabled={filtered.length === 0}>
              Export
            </CoreButton>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Customer", "Phone", "KYC Status", "Wallet Balance", "Loan Status", "Registered", "Actions"].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <td className="px-5 py-3.5">
                  <Link href={`/customers/${c.id}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00B3FF] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <span className="text-[13px] font-medium text-[#0F172A]">{c.name}</span>
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{c.phone}</td>
                <td className="px-5 py-3.5">
                  <CoreBadge variant={kycVariant[c.kyc]}>
                    {c.kyc.charAt(0).toUpperCase() + c.kyc.slice(1)}
                  </CoreBadge>
                </td>
                <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A]">{c.walletBalance}</td>
                <td className="px-5 py-3.5">
                  <CoreBadge variant={loanVariant[c.loanStatus]}>
                    {c.loanStatus.charAt(0).toUpperCase() + c.loanStatus.slice(1)}
                  </CoreBadge>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{c.registered}</td>
                <td className="px-5 py-3.5">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F7F9] transition-colors">
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} color="#94A3B8" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–10 of 24,531 results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm">Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
