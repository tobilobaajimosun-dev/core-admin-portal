"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet02Icon,
  CheckmarkCircle02Icon,
  BankIcon,
  AlertCircleIcon,
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  Download01Icon,
  MoreVerticalIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";

const wallets = [
  { id: "1", customer: "Amaka Obi", accountNo: "2041234567", balance: "₦124,500.00", status: "active", lastTx: "May 8, 2024", created: "Jan 12, 2024" },
  { id: "2", customer: "Biodun Adeyemi", accountNo: "2042345678", balance: "₦45,200.00", status: "active", lastTx: "May 6, 2024", created: "Feb 3, 2024" },
  { id: "3", customer: "Chidi Nwosu", accountNo: "2043456789", balance: "₦380,750.00", status: "active", lastTx: "May 7, 2024", created: "Mar 18, 2024" },
  { id: "4", customer: "Dupe Afolabi", accountNo: "2044567890", balance: "₦0.00", status: "frozen", lastTx: "Feb 12, 2024", created: "Jan 29, 2024" },
  { id: "5", customer: "Emmanuel Okafor", accountNo: "2045678901", balance: "₦92,100.00", status: "active", lastTx: "May 8, 2024", created: "Apr 5, 2024" },
  { id: "6", customer: "Fatima Aliyu", accountNo: "2046789012", balance: "₦215,000.00", status: "active", lastTx: "May 5, 2024", created: "Feb 20, 2024" },
  { id: "7", customer: "Grace Eze", accountNo: "2047890123", balance: "₦12,800.00", status: "inactive", lastTx: "Mar 30, 2024", created: "May 1, 2024" },
  { id: "8", customer: "Henry Babatunde", accountNo: "2048901234", balance: "₦567,300.00", status: "frozen", lastTx: "Jan 8, 2024", created: "Dec 14, 2023" },
  { id: "9", customer: "Ifunanya Okonkwo", accountNo: "2049012345", balance: "₦78,900.00", status: "active", lastTx: "May 7, 2024", created: "Mar 7, 2024" },
  { id: "10", customer: "James Lawal", accountNo: "2040123456", balance: "₦33,400.00", status: "active", lastTx: "May 4, 2024", created: "Apr 22, 2024" },
  { id: "11", customer: "Kemi Okonkwo", accountNo: "2041234568", balance: "₦156,200.00", status: "active", lastTx: "May 8, 2024", created: "Jan 18, 2024" },
  { id: "12", customer: "Lanre Balogun", accountNo: "2042345679", balance: "₦290,000.00", status: "active", lastTx: "May 3, 2024", created: "Feb 10, 2024" },
  { id: "13", customer: "Ngozi Eze", accountNo: "2043456780", balance: "₦5,000.00", status: "inactive", lastTx: "Apr 1, 2024", created: "Nov 22, 2023" },
  { id: "14", customer: "Rotimi Adeleke", accountNo: "2044567891", balance: "₦443,800.00", status: "active", lastTx: "May 8, 2024", created: "Jan 5, 2024" },
  { id: "15", customer: "Sola Fashola", accountNo: "2045678902", balance: "₦67,500.00", status: "active", lastTx: "May 6, 2024", created: "Mar 1, 2024" },
];

const statusVariant: Record<string, "success" | "neutral" | "error"> = {
  active: "success", inactive: "neutral", frozen: "error",
};

export default function WalletsPage() {
  const [search, setSearch] = useState("");
  const filtered = wallets.filter((w) =>
    w.customer.toLowerCase().includes(search.toLowerCase()) || w.accountNo.includes(search)
  );

  return (
    <PageShell title="Wallet & Accounts">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Wallets" value="21,403" icon={Wallet02Icon} delta="+9%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Active Wallets" value="18,291" icon={CheckmarkCircle02Icon} delta="+7%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Total Balance" value="₦2.1B" icon={BankIcon} delta="+14%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Failed Tx (Today)" value="12" icon={AlertCircleIcon} tag="Needs review" deltaType="down" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={15} color="#94A3B8" strokeWidth={1.5} />
            </span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search wallets..."
              className="h-9 w-[220px] bg-[#F2F7F9] rounded-lg border-0 outline-none pl-8 pr-3 text-[13px] placeholder:text-[#94A3B8]" />
          </div>
          <CoreButton variant="outline" size="sm" iconLeft={FilterIcon}>Filter</CoreButton>
          <CoreButton variant="outline" size="sm" iconRight={ArrowDown01Icon}>Status</CoreButton>
          <div className="ml-auto">
            <CoreButton variant="ghost" size="sm" iconLeft={Download01Icon} disabled={filtered.length === 0}>Export</CoreButton>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Customer", "Account No.", "Balance", "Status", "Last Transaction", "Created", "Actions"].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <td className="px-5 py-3.5">
                  <Link href={`/wallets/${w.id}`} className="text-[13px] font-medium text-[#0F172A] hover:text-[#00B3FF]">{w.customer}</Link>
                </td>
                <td className="px-5 py-3.5 text-[13px] font-mono text-[#475569]">{w.accountNo}</td>
                <td className="px-5 py-3.5 text-[13px] font-semibold text-[#0F172A]">{w.balance}</td>
                <td className="px-5 py-3.5"><CoreBadge variant={statusVariant[w.status]}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</CoreBadge></td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{w.lastTx}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{w.created}</td>
                <td className="px-5 py-3.5">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F7F9] transition-colors">
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} color="#94A3B8" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–{filtered.length} of 21,403 results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm">Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
